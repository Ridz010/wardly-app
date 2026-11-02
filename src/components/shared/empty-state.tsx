import { cn } from "cn";

type Props = {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
};

export function EmptyState({ icon, title, description, action, className }: Props) {
    return (
        <div
            className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center",
                className,
            )}
        >
            {icon ? (
                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-primary [&_svg]:size-5">
                    {icon}
                </span>
            ) : null}
            <div className="flex flex-col gap-1">
                <p className="font-normal text-foreground">{title}</p>
                {description ? (
                    <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {action}
        </div>
    );
}
