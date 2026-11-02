import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { detectImageMime, IMAGE_EXTENSION, MAX_IMAGE_BYTES } from "@/lib/image";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "content-images";

const reply = (message: string, status: number) =>
    NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
        return reply("Permintaan tidak diizinkan.", 403);
    }

    const user = await getUser();
    if (!user) return reply("Masuk dulu untuk mengunggah gambar.", 401);

    try {
        await enforceRateLimit(RATE_LIMITS.upload, user.id);
    } catch (error) {
        if (error instanceof AppError) return reply(error.message, 429);
        return reply("Terjadi kesalahan di sisi kami.", 500);
    }

    let file: FormDataEntryValue | null;
    try {
        file = (await request.formData()).get("file");
    } catch {
        return reply("Berkas tidak terbaca.", 400);
    }

    if (!(file instanceof File) || file.size === 0) return reply("Pilih gambar dulu.", 400);
    if (file.size > MAX_IMAGE_BYTES) return reply("Gambar terlalu besar. Maksimal 4 MB.", 413);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectImageMime(bytes);
    if (!mime) return reply("Format tidak didukung. Gunakan PNG, JPG, WebP, atau GIF.", 415);

    const path = `${user.id}/${randomUUID()}.${IMAGE_EXTENSION[mime]}`;
    const storage = createAdminClient().storage.from(BUCKET);
    const { error } = await storage.upload(path, bytes, {
        contentType: mime,
        cacheControl: "31536000",
        upsert: false,
    });

    if (error) {
        console.error("[upload] gagal menyimpan gambar", error.message);
        return reply(
            "Gambar belum bisa disimpan. Pastikan bucket content-images sudah dibuat (jalankan migrasi terbaru).",
            500,
        );
    }

    return NextResponse.json({ url: storage.getPublicUrl(path).data.publicUrl }, { headers: { "Cache-Control": "no-store" } });
}
