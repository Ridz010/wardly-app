import AnimatedContent from "@/components/AnimatedContent";
import { Card, CardContent } from "@/components/ui/card";

type Stat = { label: string; value: string | number; hint?: string; icon?: React.ReactNode };

export function StatGrid({ stats }: { stats: Stat[] }) {
    return (
        <AnimatedContent
            distance={24}
            duration={0.55}
            stagger={0.07}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0"
        >
            {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardContent className="flex flex-col gap-3 p-5">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{stat.label}</span>
                            {stat.icon ? <span className="text-primary [&_svg]:size-4">{stat.icon}</span> : null}
                        </div>
                        <span className="font-heading text-3xl font-light tabular-nums tracking-tight">
                            {stat.value}
                        </span>
                        {stat.hint ? <span className="text-xs text-muted-foreground">{stat.hint}</span> : null}
                    </CardContent>
                </Card>
            ))}
        </AnimatedContent>
    );
}
