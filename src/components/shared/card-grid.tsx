import AnimatedContent from "@/components/AnimatedContent";

export function CardGrid({ children }: { children: React.ReactNode }) {
    return (
        <AnimatedContent
            distance={28}
            duration={0.6}
            stagger={0.08}
            threshold={0.05}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0"
        >
            {children}
        </AnimatedContent>
    );
}
