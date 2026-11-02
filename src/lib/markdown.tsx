import { Fragment, type ReactNode } from "react";

const INLINE =
    /(!\[[^\]]*\]\(https:\/\/[^)\s]+\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

function Figure({ alt, src }: { alt: string; src: string }) {
    return (
        <figure className="flex flex-col gap-2">
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="h-auto w-full rounded-2xl border border-border bg-muted object-cover"
            />
            {alt ? <figcaption className="text-center text-sm text-muted-foreground">{alt}</figcaption> : null}
        </figure>
    );
}

function inline(text: string): ReactNode[] {
    return text.split(INLINE).map((part, index) => {
        if (!part) return null;

        const image = /^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)$/.exec(part);
        if (image) {
            return (
                <img
                    key={index}
                    src={image[2]}
                    alt={image[1]}
                    loading="lazy"
                    decoding="async"
                    className="my-2 inline-block h-auto max-w-full rounded-xl"
                />
            );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
            return <u key={index} className="underline-offset-4">{part.slice(2, -2)}</u>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return <code key={index} className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);
        if (link) {
            return (
                <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">
                    {link[1]}
                </a>
            );
        }
        return <Fragment key={index}>{part}</Fragment>;
    });
}

type Block =
    | { type: "heading"; level: 1 | 2 | 3; text: string }
    | { type: "image"; alt: string; src: string }
    | { type: "rule" }
    | { type: "ul" | "ol" | "quote"; items: string[] }
    | { type: "p"; text: string };

const HEADING = /^(#{1,3})\s+(.+)$/;
const IMAGE = /^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)$/;
const UL = /^[-*]\s+(.*)$/;
const OL = /^\d+\.\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;

function parse(source: string): Block[] {
    const lines = source.replace(/\r\n/g, "\n").split("\n");
    const blocks: Block[] = [];
    let paragraph: string[] = [];

    const flush = () => {
        if (paragraph.length) blocks.push({ type: "p", text: paragraph.join("\n") });
        paragraph = [];
    };

    const pushItem = (type: "ul" | "ol" | "quote", item: string) => {
        const last = blocks[blocks.length - 1];
        if (last && last.type === type) last.items.push(item);
        else blocks.push({ type, items: [item] });
    };

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) {
            flush();
            continue;
        }

        const heading = HEADING.exec(line);
        if (heading) {
            flush();
            blocks.push({ type: "heading", level: heading[1].length as 1 | 2 | 3, text: heading[2] });
            continue;
        }
        if (/^(-{3,}|\*{3,})$/.test(line)) {
            flush();
            blocks.push({ type: "rule" });
            continue;
        }
        const image = IMAGE.exec(line);
        if (image) {
            flush();
            blocks.push({ type: "image", alt: image[1], src: image[2] });
            continue;
        }
        const ul = UL.exec(line);
        if (ul) {
            flush();
            pushItem("ul", ul[1]);
            continue;
        }
        const ol = OL.exec(line);
        if (ol) {
            flush();
            pushItem("ol", ol[1]);
            continue;
        }
        const quote = QUOTE.exec(line);
        if (quote) {
            flush();
            pushItem("quote", quote[1]);
            continue;
        }
        paragraph.push(line);
    }
    flush();
    return blocks;
}

const HEADING_CLASS = "font-heading font-medium tracking-tight text-foreground";

export function Markdown({ source, className }: { source: string; className?: string }) {
    const blocks = parse(source);

    return (
        <div className={className ?? "flex flex-col gap-5 text-base leading-relaxed text-muted-foreground"}>
            {blocks.map((block, index) => {
                switch (block.type) {
                    case "heading":
                        if (block.level === 1) return <h2 key={index} className={`${HEADING_CLASS} mt-6 text-3xl`}>{inline(block.text)}</h2>;
                        if (block.level === 2) return <h3 key={index} className={`${HEADING_CLASS} mt-4 text-2xl`}>{inline(block.text)}</h3>;
                        return <h4 key={index} className={`${HEADING_CLASS} mt-2 text-xl`}>{inline(block.text)}</h4>;
                    case "image":
                        return <Figure key={index} alt={block.alt} src={block.src} />;
                    case "rule":
                        return <hr key={index} className="border-border" />;
                    case "ul":
                        return (
                            <ul key={index} className="flex list-disc flex-col gap-2 pl-5 marker:text-primary">
                                {block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}
                            </ul>
                        );
                    case "ol":
                        return (
                            <ol key={index} className="flex list-decimal flex-col gap-2 pl-5 marker:text-primary">
                                {block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}
                            </ol>
                        );
                    case "quote":
                        return (
                            <blockquote key={index} className="border-l-2 border-primary pl-4 italic">
                                {inline(block.items.join(" "))}
                            </blockquote>
                        );
                    default:
                        return <p key={index} className="whitespace-pre-line">{inline(block.text)}</p>;
                }
            })}
        </div>
    );
}
