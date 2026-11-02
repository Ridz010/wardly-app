"use server";

import { redirect } from "next/navigation";

import { safeNext } from "@/lib/auth/safe-redirect";
import { publicEnv } from "@/env/public";
import { toActionError } from "@/lib/errors";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientFingerprint } from "@/lib/client-id";
import { fail, type ActionState } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import {
  formToObject,
  signInSchema,
  signUpSchema,
  toFieldErrors,
} from "@/lib/validation";

export async function signInAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Periksa kembali isian kamu.", toFieldErrors(parsed.error));
  }

  try {
    await enforceRateLimit(RATE_LIMITS.signIn, await getClientFingerprint());
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return fail("Email atau kata sandi tidak cocok.");
  } catch (error) {
    return toActionError(error);
  }

  redirect(safeNext(form.get("next")));
}

export async function signUpAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Periksa kembali isian kamu.", toFieldErrors(parsed.error));
  }

  const { name, email, password } = parsed.data;

  try {
    await enforceRateLimit(RATE_LIMITS.signUp, await getClientFingerprint());
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(safeNext(form.get("next")))}`,
      },
    });
    if (error) {
      return fail(
        error.code === "user_already_exists"
          ? "Email ini sudah terdaftar. Coba masuk."
          : "Pendaftaran belum berhasil. Coba lagi sebentar lagi.",
      );
    }
    if (!data.session) {
      return {
        status: "success",
        message: "Cek email kamu untuk konfirmasi, lalu masuk.",
      };
    }
  } catch (error) {
    return toActionError(error);
  }

  redirect("/dashboard");
}

export async function googleSignInAction(form: FormData) {
  const next = safeNext(form.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) redirect("/sign-in?error=oauth");
  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
