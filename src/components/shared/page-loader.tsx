import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

export function PageLoader({
    label = "Memuat",
    className,
}: {
    label?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-3 text-muted-foreground",
                className,
            )}
        >
            <Spinner className="size-6 text-primary" />
            <span className="text-sm">{label}</span>
        </div>
    );
}
