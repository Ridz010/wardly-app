import { z } from "zod";

import type { FieldErrors } from "@/lib/result";

const text = (min: number, max: number, label: string) =>
    z
        .string()
        .trim()
        .min(min, `${label} minimal ${min} karakter.`)
        .max(max, `${label} maksimal ${max} karakter.`);

const slug = z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter.")
    .max(80, "Slug maksimal 80 karakter.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung.");

const uuid = z.guid("ID tidak valid.");
const optionalUuid = z
    .string()
    .trim()
    .transform((value) => (value ? value : null))
    .pipe(z.guid("ID tidak valid.").nullable());

const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max, `Maksimal ${max} karakter.`)
        .optional()
        .transform((value) => (value ? value : null));

const bool = z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((value) => value === "on" || value === "true");

export const emailSchema = z.string().trim().toLowerCase().email("Email tidak valid.");

export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Kata sandi wajib diisi.").max(128),
});

export const signUpSchema = z
    .object({
        name: text(2, 60, "Nama"),
        email: emailSchema,
        password: z
            .string()
            .min(8, "Kata sandi minimal 8 karakter.")
            .max(128, "Kata sandi maksimal 128 karakter.")
            .regex(/[A-Za-z]/, "Kata sandi harus memuat huruf.")
            .regex(/\d/, "Kata sandi harus memuat angka."),
        confirm: z.string(),
    })
    .refine((value) => value.password === value.confirm, {
        path: ["confirm"],
        message: "Konfirmasi kata sandi tidak sama.",
    });

export const analyzeSchema = z.object({
    text: text(8, 4000, "Pesan"),
});

export const linkSchema = z.object({
    url: z
        .string()
        .trim()
        .min(4, "Tautan terlalu pendek.")
        .max(2000, "Tautan terlalu panjang.")
        .refine((value) => !/\s/.test(value), "Tautan tidak boleh mengandung spasi."),
});

export const chatSchema = z.object({
    messages: z
        .array(
            z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().trim().min(1).max(800),
            }),
        )
        .min(1)
        .max(12),
});

export const communityPostSchema = z.object({
    title: text(6, 120, "Judul"),
    body: text(30, 8000, "Isi"),
    kind: z.enum(["tips", "pengalaman", "peringatan"]),
    category_id: optionalUuid,
});

export const reportSchema = z.object({
    post_id: uuid,
    reason: text(8, 400, "Alasan"),
});

export const settingsSchema = z.object({
    display_name: text(2, 60, "Nama"),
    save_history: bool,
});

export const ruleSchema = z.object({
    code: z.string().trim().min(3).max(60).regex(/^[A-Z0-9_]+$/, "Kode hanya huruf besar, angka, dan garis bawah."),
    label: text(3, 140, "Label"),
    explanation: text(10, 500, "Penjelasan"),
    pattern: text(1, 300, "Pola").refine((value) => {
        try {
            new RegExp(value, "i");
            return true;
        } catch {
            return false;
        }
    }, "Pola regex tidak valid."),
    weight: z.coerce.number().int().min(1, "Bobot minimal 1.").max(60, "Bobot maksimal 60."),
    category_id: optionalUuid,
    is_active: bool,
});

export const categorySchema = z.object({
    name: text(2, 60, "Nama"),
    slug,
    description: optionalText(300),
    icon: optionalText(40),
    sort_order: z.coerce.number().int().min(0).max(999),
});

export const scenarioSchema = z.object({
    title: text(4, 120, "Judul"),
    slug,
    summary: optionalText(400),
    difficulty: z.enum(["mudah", "sedang", "sulit"]),
    xp_reward: z.coerce.number().int().min(0).max(1000),
    category_id: optionalUuid,
    status: z.enum(["draft", "pending", "published", "rejected"]),
});

export const guideSchema = z.object({
    title: text(4, 120, "Judul"),
    slug,
    summary: optionalText(400),
    phase: z.enum(["sebelum", "sesudah"]),
    urgency: z.coerce.number().int().min(1).max(5),
    category_id: optionalUuid,
    status: z.enum(["draft", "pending", "published", "rejected"]),
});

export const blogSchema = z.object({
    title: text(4, 140, "Judul"),
    slug,
    excerpt: optionalText(300),
    content_md: text(20, 40000, "Konten"),
    cover_url: optionalText(500).refine(
        (value) => !value || /^https:\/\//.test(value),
        "URL gambar harus diawali https://.",
    ),
    tags: optionalText(200),
    status: z.enum(["draft", "pending", "published", "rejected"]),
});

export const stepSchema = z.object({
    step_order: z.coerce.number().int().min(1).max(99),
    channel: optionalText(40),
    sender_name: optionalText(80),
    narrative: text(10, 1200, "Narasi"),
});

export const choiceSchema = z.object({
    label: text(2, 240, "Label"),
    feedback: text(5, 800, "Umpan balik"),
    is_safe: bool,
    score_delta: z.coerce.number().int().min(-50, "Minimal -50.").max(50, "Maksimal 50."),
    next_step_id: optionalUuid,
    sort_order: z.coerce.number().int().min(0).max(99),
});

export const guideStepSchema = z.object({
    step_order: z.coerce.number().int().min(1).max(99),
    title: text(3, 140, "Judul"),
    detail: text(5, 800, "Detail"),
    link_label: optionalText(80),
    link_url: optionalText(400).refine(
        (value) => !value || /^https?:\/\//.test(value),
        "Tautan harus diawali http:// atau https://.",
    ),
});

export const moderationSchema = z.object({
    id: uuid,
    status: z.enum(["pending", "published", "rejected"]),
    note: optionalText(300),
});

export const roleSchema = z.object({
    id: uuid,
    role: z.enum(["user", "moderator", "admin"]),
});

export const toFieldErrors = (error: z.ZodError): FieldErrors =>
    z.flattenError(error).fieldErrors as FieldErrors;

export const formToObject = (form: FormData) => {
    const out: Record<string, FormDataEntryValue> = {};
    for (const [key, value] of form.entries()) {
        if (typeof value === "string") out[key] = value;
    }
    return out;
};
