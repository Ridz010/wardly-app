"use server";

import { getUser } from "@/lib/auth/session";
import { getClientFingerprint } from "@/lib/client-id";
import { toActionError } from "@/lib/errors";
import { chatDity } from "@/lib/llm";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { redact } from "@/lib/redact";
import { fail, type ActionState } from "@/lib/result";
import { chatSchema } from "@/lib/validation";

const OFFLINE =
  "Aku belum tersambung ke layanan AI, jadi belum bisa menjawab bebas. Sementara itu: jangan balas, jangan klik tautan, dan jangan bagikan OTP atau PIN. Tempel pesannya di halaman Bedah untuk melihat tanda-tandanya.";

export async function askDityAction(
  history: { role: "user" | "assistant"; content: string }[],
): Promise<ActionState<{ reply: string }>> {
  const parsed = chatSchema.safeParse({ messages: history });
  if (!parsed.success) return fail("Pesan belum bisa dikirim.");

  try {
    const user = await getUser();
    await enforceRateLimit(
      user ? RATE_LIMITS.chat : RATE_LIMITS.chatGuest,
      user?.id ?? (await getClientFingerprint()),
    );

    const safe = parsed.data.messages.map((turn) => ({
      role: turn.role,
      content: turn.role === "user" ? redact(turn.content).clean : turn.content,
    }));
    const reply = await chatDity(safe);
    return { status: "success", data: { reply: reply ?? OFFLINE } };
  } catch (error) {
    return toActionError(error);
  }
}
