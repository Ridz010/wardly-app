export function safeNext(value: FormDataEntryValue | string | null | undefined) {
    if (typeof value !== "string") return "/dashboard";
    if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
    if (value.includes("\\")) return "/dashboard";
    return value;
}
