"use server";

import { AppError, toActionError } from "@/lib/errors";
import { isLlmEnabled, readScreenshot } from "@/lib/llm";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { fail, type ActionState } from "@/lib/result";
import { analyzeMessage, type AnalysisResult } from "@/lib/services/analyze";
import { startScan } from "@/lib/services/scan-guard";
import {
  analyzeSchema,
  formToObject,
  linkSchema,
  toFieldErrors,
} from "@/lib/validation";

type Result = ActionState<AnalysisResult>;

export async function analyzeAction(_prev: Result, form: FormData): Promise<Result> {
  const parsed = analyzeSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Pesannya belum bisa diperiksa.", toFieldErrors(parsed.error));
  }

  try {
    const scan = await startScan();
    const quota = await scan.charge();
    const result = await analyzeMessage({ text: parsed.data.text, kind: "text", userId: scan.userId, rateKey: scan.rateKey, saveHistory: scan.saveHistory });
    return { status: "success", data: { ...result, quota } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function analyzeLinkAction(_prev: Result, form: FormData): Promise<Result> {
  const parsed = linkSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Tautannya belum bisa diperiksa.", toFieldErrors(parsed.error));
  }

  const raw = parsed.data.url;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let normalized: string;
  try {
    const url = new URL(candidate);
    if (!url.hostname.includes(".")) throw new Error("host");
    normalized = url.toString();
  } catch {
    return fail("Format tautan belum benar.", { url: ["Contoh: https://contoh.co.id/promo"] });
  }

  try {
    const scan = await startScan();
    const quota = await scan.charge();
    const result = await analyzeMessage({ text: normalized, kind: "url", userId: scan.userId, rateKey: scan.rateKey, saveHistory: scan.saveHistory });
    return { status: "success", data: { ...result, quota } };
  } catch (error) {
    return toActionError(error);
  }
}

const MAX_BYTES = 4 * 1024 * 1024;

function detectMime(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return "image/webp";
  return null;
}

export async function analyzeImageAction(_prev: Result, form: FormData): Promise<Result> {
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Pilih tangkapan layar dulu.", { image: ["Belum ada gambar dipilih."] });
  }
  if (file.size > MAX_BYTES) {
    return fail("Gambar terlalu besar.", { image: ["Maksimal 4 MB."] });
  }

  try {
    if (!isLlmEnabled()) {
      throw new AppError("upstream", "Pembacaan screenshot butuh layanan AI yang belum diaktifkan. Tempel teksnya di tab Teks.");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectMime(bytes);
    if (!mime) return fail("Format gambar tidak didukung.", { image: ["Gunakan PNG, JPG, atau WebP."] });

    const scan = await startScan();
    await enforceRateLimit(RATE_LIMITS.screenshot, scan.rateKey);
    const quota = await scan.charge();

    const text = await readScreenshot(`data:${mime};base64,${Buffer.from(bytes).toString("base64")}`);
    if (!text) {
      return fail("Tidak ada teks pesan yang terbaca di gambar ini. Coba gambar yang lebih jelas.");
    }

    const result = await analyzeMessage({ text, kind: "image", userId: scan.userId, rateKey: scan.rateKey, saveHistory: scan.saveHistory });
    return { status: "success", data: { ...result, extracted: text, quota } };
  } catch (error) {
    return toActionError(error);
  }
}
