"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

export type ActivityPoint = { day: string; rendah: number; waspada: number; tinggi: number };

const config = {
    rendah: { label: "Rendah", color: "var(--primary)" },
    waspada: { label: "Waspada", color: "#d97706" },
    tinggi: { label: "Tinggi", color: "var(--destructive)" },
} satisfies ChartConfig;

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
    return (
        <ChartContainer config={config} className="h-64 w-full">
            <BarChart data={data} margin={{ left: -16, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="rendah" stackId="a" fill="var(--color-rendah)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="waspada" stackId="a" fill="var(--color-waspada)" />
                <Bar dataKey="tinggi" stackId="a" fill="var(--color-tinggi)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ChartContainer>
    );
}
