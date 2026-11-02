import Link from "next/link";

import AnimatedContent from "@/components/AnimatedContent";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

type Props = {
    code: string;
    title: string;
    description: string;
    children?: React.ReactNode;
    digest?: string;
    home?: boolean;
};

export function ErrorView({ code, title, description, children, digest, home = true }: Props) {
    return (
        <section className="flex min-h-svh flex-1 items-center justify-center px-6 py-20">
            <AnimatedContent distance={28} duration={0.7}>
                <div className="flex max-w-md flex-col items-center gap-5 text-center">
                    <span className="font-heading text-7xl font-light tracking-tight text-primary sm:text-8xl">
                        {code}
                    </span>
                    <div className="flex flex-col gap-2">
                        <h1 className="font-heading text-2xl font-light tracking-tight text-foreground sm:text-3xl">
                            {title}
                        </h1>
                        <p className="text-balance text-muted-foreground">{description}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {children}
                        {home ? (
                            <Link
                                href="/"
                                className={cn(
                                    buttonVariants({ variant: "outline", size: "lg" }),
                                    "h-10 rounded-full px-5 font-normal",
                                )}
                            >
                                Kembali ke beranda
                            </Link>
                        ) : null}
                    </div>
                    {digest ? (
                        <span className="text-xs text-muted-foreground">Kode: {digest}</span>
                    ) : null}
                </div>
            </AnimatedContent>
        </section>
    );
}
