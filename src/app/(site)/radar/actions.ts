"use server";

import { toActionError } from "@/lib/errors";
import { fail, type ActionState } from "@/lib/result";
import { quickCheck, type QuickResult } from "@/lib/services/analyze";
import { startScan, type QuotaInfo } from "@/lib/services/scan-guard";
import { analyzeSchema, formToObject, toFieldErrors } from "@/lib/validation";

type Result = ActionState<QuickResult & { quota: QuotaInfo }>;

export async function quickCheckAction(_prev: Result, form: FormData): Promise<Result> {
  const parsed = analyzeSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Tempel potongan pesannya dulu.", toFieldErrors(parsed.error));
  }

  try {
    const scan = await startScan();
    const quota = await scan.charge();
    const result = await quickCheck(parsed.data.text, scan.rateKey);
    return { status: "success", data: { ...result, quota } };
  } catch (error) {
    return toActionError(error);
  }
}
