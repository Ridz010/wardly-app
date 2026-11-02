import Image from "next/image";

import GradientASCII from "@/components/GradientASCII";
import { Card, CardContent } from "@/components/ui/card";

const WARDLY_COLORS = ["#0B4A5C", "#158AB0", "#2FB6C9", "#5DF2E7", "#D4FFF7"];

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: Props) {
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Image src="/icon/logo.svg" alt="Ward-Ly" width={48} height={48} priority />
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl font-light tracking-tight">{title}</h1>
              <p className="text-balance text-muted-foreground">{description}</p>
            </div>
          </div>
          {children}
        </div>

        <div
          aria-hidden="true"
          className="relative isolate hidden min-h-120 overflow-hidden bg-[#06141B] bg-[radial-gradient(120%_70%_at_50%_110%,#158AB0_0%,#0B4A5C_35%,#06141B_70%)] md:block"
        >
          <div className="absolute inset-0 -z-20">
            <GradientASCII
              className="h-full w-full [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
              shape="rise"
              colors={WARDLY_COLORS}
              characters=" .:=+xX0S8#@"
              cellSize={14}
              density={0.85}
              glyphOpacity={0.9}
              glow={0.35}
              softness={0.6}
              flow={0.6}
              speed={0.8}
              gradientOpacity={0.55}
              grain={0.06}
              scrambleRadius={0.12}
              clickEffect="wave"
              intro
            />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-end justify-center">
            <Image
              src="/animated_maskot.gif"
              alt=""
              width={480}
              height={480}
              unoptimized
              className="h-[80%] w-auto max-w-full translate-y-6 select-none object-contain object-bottom"
              draggable={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
