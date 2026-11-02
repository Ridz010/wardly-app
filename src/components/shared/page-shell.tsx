import { cn } from "cn";

export function PageShell({
    children,
    className,
    narrow,
}: {
    children: React.ReactNode;
    className?: string;
    narrow?: boolean;
}) {
    return (
        <div
            className={cn(
                "mx-auto flex w-full flex-col gap-10 px-6 pb-24 pt-32",
                narrow ? "max-w-3xl" : "max-w-6xl",
                className,
            )}
        >
            {children}
        </div>
    );
}
