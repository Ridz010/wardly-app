import "server-only";
import type { ZodType } from "zod";

import { TAGS } from "@/lib/data/content";
import {
    blogSchema,
    categorySchema,
    choiceSchema,
    guideSchema,
    guideStepSchema,
    ruleSchema,
    scenarioSchema,
    stepSchema,
} from "@/lib/validation";

export type FieldType = "text" | "textarea" | "number" | "select" | "switch" | "markdown" | "image";
export type OptionsSource = "categories" | "siblingSteps";

export type FieldDef = {
    name: string;
    label: string;
    type: FieldType;
    hint?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    optionsFrom?: OptionsSource;
    nullable?: boolean;
    wide?: boolean;
};

export type ColumnKind = "text" | "badge" | "bool" | "number" | "date" | "mono" | "lookup";

export type ColumnDef = { key: string; label: string; kind: ColumnKind; lookup?: OptionsSource };

export type ResourceKey =
    | "aturan"
    | "kategori"
    | "skenario"
    | "langkah"
    | "pilihan"
    | "panduan"
    | "butir"
    | "blog";

export type Resource = {
    key: ResourceKey;
    table:
        | "red_flag_rules"
        | "scam_categories"
        | "scenarios"
        | "scenario_steps"
        | "scenario_choices"
        | "action_guides"
        | "action_guide_steps"
        | "blog_posts";
    title: string;
    singular: string;
    description: string;
    labelKey: string;
    order: { column: string; ascending: boolean };
    columns: ColumnDef[];
    fields: FieldDef[];
    schema: ZodType;
    tag?: string;
    parent?: { fk: string; resource: ResourceKey };
    children?: { resource: ResourceKey; label: string }[];
    defaults?: Record<string, unknown>;
    authorColumn?: string;
    toRow?: (
        data: Record<string, unknown>,
        existing: Record<string, unknown> | null,
    ) => Record<string, unknown>;
};

const STATUS = [
    { value: "draft", label: "Draf" },
    { value: "pending", label: "Menunggu" },
    { value: "published", label: "Terbit" },
    { value: "rejected", label: "Ditolak" },
];

const category: FieldDef = {
    name: "category_id",
    label: "Kategori",
    type: "select",
    optionsFrom: "categories",
    nullable: true,
};

export const RESOURCES: Record<ResourceKey, Resource> = {
    aturan: {
        key: "aturan",
        table: "red_flag_rules",
        title: "Aturan deteksi",
        singular: "aturan",
        description: "Pola yang dicocokkan ke pesan pengguna. Bobot menentukan skor risiko.",
        labelKey: "label",
        order: { column: "code", ascending: true },
        tag: TAGS.rules,
        schema: ruleSchema,
        defaults: { applies_to: ["text", "url", "mixed"] },
        columns: [
            { key: "code", label: "Kode", kind: "mono" },
            { key: "label", label: "Label", kind: "text" },
            { key: "weight", label: "Bobot", kind: "number" },
            { key: "category_id", label: "Kategori", kind: "lookup", lookup: "categories" },
            { key: "is_active", label: "Aktif", kind: "bool" },
        ],
        fields: [
            { name: "code", label: "Kode", type: "text", placeholder: "OTP_REQUEST", hint: "Huruf besar, angka, garis bawah." },
            { name: "label", label: "Label", type: "text" },
            { name: "pattern", label: "Pola regex", type: "text", hint: "Dicocokkan tanpa membedakan huruf besar/kecil.", wide: true },
            { name: "explanation", label: "Penjelasan untuk pengguna", type: "textarea", wide: true },
            { name: "weight", label: "Bobot (1–60)", type: "number" },
            category,
            { name: "is_active", label: "Aktif", type: "switch" },
        ],
    },
    kategori: {
        key: "kategori",
        table: "scam_categories",
        title: "Kategori modus",
        singular: "kategori",
        description: "Jenis penipuan yang dipakai di aturan, skenario, dan panduan.",
        labelKey: "name",
        order: { column: "sort_order", ascending: true },
        tag: TAGS.categories,
        schema: categorySchema,
        columns: [
            { key: "name", label: "Nama", kind: "text" },
            { key: "slug", label: "Slug", kind: "mono" },
            { key: "sort_order", label: "Urutan", kind: "number" },
        ],
        fields: [
            { name: "name", label: "Nama", type: "text" },
            { name: "slug", label: "Slug", type: "text", placeholder: "phishing-bank" },
            { name: "description", label: "Deskripsi", type: "textarea", wide: true },
            { name: "icon", label: "Ikon", type: "text", hint: "Nama ikon opsional." },
            { name: "sort_order", label: "Urutan", type: "number" },
        ],
    },
    skenario: {
        key: "skenario",
        table: "scenarios",
        title: "Skenario latihan",
        singular: "skenario",
        description: "Latihan interaktif. Kelola langkah dan pilihannya dari tiap baris.",
        labelKey: "title",
        order: { column: "created_at", ascending: false },
        tag: TAGS.scenarios,
        schema: scenarioSchema,
        authorColumn: "created_by",
        children: [{ resource: "langkah", label: "Langkah" }],
        columns: [
            { key: "title", label: "Judul", kind: "text" },
            { key: "difficulty", label: "Tingkat", kind: "badge" },
            { key: "xp_reward", label: "XP", kind: "number" },
            { key: "status", label: "Status", kind: "badge" },
        ],
        fields: [
            { name: "title", label: "Judul", type: "text" },
            { name: "slug", label: "Slug", type: "text" },
            { name: "summary", label: "Ringkasan", type: "textarea", wide: true },
            { name: "difficulty", label: "Tingkat", type: "select", options: [{ value: "mudah", label: "Mudah" }, { value: "sedang", label: "Sedang" }, { value: "sulit", label: "Sulit" }] },
            { name: "xp_reward", label: "Hadiah XP", type: "number" },
            category,
            { name: "status", label: "Status", type: "select", options: STATUS },
        ],
    },
    langkah: {
        key: "langkah",
        table: "scenario_steps",
        title: "Langkah skenario",
        singular: "langkah",
        description: "Urutan situasi yang dihadapi pengguna.",
        labelKey: "narrative",
        order: { column: "step_order", ascending: true },
        tag: TAGS.scenarios,
        schema: stepSchema,
        parent: { fk: "scenario_id", resource: "skenario" },
        children: [{ resource: "pilihan", label: "Pilihan" }],
        columns: [
            { key: "step_order", label: "#", kind: "number" },
            { key: "channel", label: "Kanal", kind: "badge" },
            { key: "sender_name", label: "Pengirim", kind: "text" },
            { key: "narrative", label: "Narasi", kind: "text" },
        ],
        fields: [
            { name: "step_order", label: "Urutan", type: "number" },
            { name: "channel", label: "Kanal", type: "text", placeholder: "WhatsApp" },
            { name: "sender_name", label: "Nama pengirim", type: "text" },
            { name: "narrative", label: "Narasi", type: "textarea", wide: true },
        ],
    },
    pilihan: {
        key: "pilihan",
        table: "scenario_choices",
        title: "Pilihan jawaban",
        singular: "pilihan",
        description: "Pilihan pengguna di satu langkah beserta umpan baliknya.",
        labelKey: "label",
        order: { column: "sort_order", ascending: true },
        tag: TAGS.scenarios,
        schema: choiceSchema,
        parent: { fk: "step_id", resource: "langkah" },
        columns: [
            { key: "label", label: "Pilihan", kind: "text" },
            { key: "is_safe", label: "Aman", kind: "bool" },
            { key: "score_delta", label: "Skor", kind: "number" },
            { key: "next_step_id", label: "Lanjut ke", kind: "lookup", lookup: "siblingSteps" },
        ],
        fields: [
            { name: "label", label: "Teks pilihan", type: "text", wide: true },
            { name: "feedback", label: "Umpan balik", type: "textarea", wide: true },
            { name: "is_safe", label: "Pilihan aman", type: "switch" },
            { name: "score_delta", label: "Perubahan skor", type: "number" },
            { name: "next_step_id", label: "Langkah berikutnya", type: "select", optionsFrom: "siblingSteps", nullable: true, hint: "Kosong berarti lanjut berurutan." },
            { name: "sort_order", label: "Urutan", type: "number" },
        ],
    },
    panduan: {
        key: "panduan",
        table: "action_guides",
        title: "Panduan perlindungan",
        singular: "panduan",
        description: "Checklist sebelum dan sesudah terkena penipuan.",
        labelKey: "title",
        order: { column: "updated_at", ascending: false },
        tag: TAGS.guides,
        schema: guideSchema,
        children: [{ resource: "butir", label: "Langkah" }],
        columns: [
            { key: "title", label: "Judul", kind: "text" },
            { key: "phase", label: "Fase", kind: "badge" },
            { key: "urgency", label: "Urgensi", kind: "number" },
            { key: "status", label: "Status", kind: "badge" },
        ],
        fields: [
            { name: "title", label: "Judul", type: "text" },
            { name: "slug", label: "Slug", type: "text" },
            { name: "summary", label: "Ringkasan", type: "textarea", wide: true },
            { name: "phase", label: "Fase", type: "select", options: [{ value: "sebelum", label: "Sebelum (pencegahan)" }, { value: "sesudah", label: "Sesudah kejadian" }] },
            { name: "urgency", label: "Urgensi (1–5)", type: "number" },
            category,
            { name: "status", label: "Status", type: "select", options: STATUS },
        ],
    },
    butir: {
        key: "butir",
        table: "action_guide_steps",
        title: "Langkah panduan",
        singular: "langkah",
        description: "Butir checklist dalam satu panduan.",
        labelKey: "title",
        order: { column: "step_order", ascending: true },
        tag: TAGS.guides,
        schema: guideStepSchema,
        parent: { fk: "guide_id", resource: "panduan" },
        columns: [
            { key: "step_order", label: "#", kind: "number" },
            { key: "title", label: "Judul", kind: "text" },
            { key: "link_url", label: "Tautan", kind: "mono" },
        ],
        fields: [
            { name: "step_order", label: "Urutan", type: "number" },
            { name: "title", label: "Judul", type: "text" },
            { name: "detail", label: "Detail", type: "textarea", wide: true },
            { name: "link_label", label: "Label tautan", type: "text" },
            { name: "link_url", label: "URL tautan", type: "text", placeholder: "https://" },
        ],
    },
    blog: {
        key: "blog",
        table: "blog_posts",
        title: "Blog",
        singular: "artikel",
        description: "Artikel edukasi. Tulis dengan editor: judul, tebal, daftar, tautan, dan gambar.",
        labelKey: "title",
        order: { column: "created_at", ascending: false },
        tag: TAGS.blog,
        schema: blogSchema,
        authorColumn: "author_id",
        columns: [
            { key: "title", label: "Judul", kind: "text" },
            { key: "status", label: "Status", kind: "badge" },
            { key: "published_at", label: "Terbit", kind: "date" },
        ],
        fields: [
            { name: "title", label: "Judul", type: "text", wide: true },
            { name: "slug", label: "Slug", type: "text" },
            { name: "status", label: "Status", type: "select", options: STATUS },
            { name: "excerpt", label: "Ringkasan", type: "textarea", wide: true },
            { name: "cover_url", label: "Gambar sampul", type: "image", wide: true, hint: "Tampil di kartu dan bagian atas artikel." },
            { name: "tags", label: "Tag", type: "text", hint: "Pisahkan dengan koma." },
            { name: "content_md", label: "Isi artikel", type: "markdown", wide: true },
        ],
        toRow: (data, existing) => {
            const tags = typeof data.tags === "string" ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
            return {
                ...data,
                tags,
                published_at:
                    data.status === "published"
                        ? ((existing?.published_at as string | null) ?? new Date().toISOString())
                        : null,
            };
        },
    },
};

export const isResourceKey = (value: string): value is ResourceKey => value in RESOURCES;
