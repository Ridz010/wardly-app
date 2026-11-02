export const formatDate = (
    value: string | null | undefined,
    style: "short" | "long" = "short",
) =>
    value
        ? new Date(value).toLocaleDateString("id-ID", {
              day: "numeric",
              month: style === "long" ? "long" : "short",
              year: "numeric",
          })
        : "";

export const initials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "W";

export const stripMarkdown = (text: string) =>
    text
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/^#{1,3}\s+/gm, "")
        .replace(/^[-*>]\s+/gm, "")
        .replace(/^\d+\.\s+/gm, "")
        .replace(/(\*\*|__|\*|`)/g, "")
        .replace(/\n{2,}/g, "\n")
        .trim();

export const firstImage = (text: string) =>
    /!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/.exec(text)?.[1] ?? null;
