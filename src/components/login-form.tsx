import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { FcGoogle } from "react-icons/fc";
import GradientASCII from "./GradientASCII"

const WARDLY_COLORS = ["#0B4A5C", "#158AB0", "#2FB6C9", "#5DF2E7", "#D4FFF7"];

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-3 text-center">
                <Image
                  src="/icon/logo.svg"
                  alt="Logo Wardly"
                  width={48}
                  height={48}
                  priority
                />
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading text-2xl font-bold tracking-tight">
                    Selamat datang kembali
                  </h1>
                  <p className="text-balance text-muted-foreground">
                    Masuk ke akun Wardly untuk melanjutkan latihanmu.
                  </p>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm text-teal-700 underline-offset-2 hover:underline dark:text-teal-400"
                  >
                    Lupa kata sandi?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="bg-teal-500 font-semibold text-slate-900 hover:bg-teal-400"
                >
                  Masuk
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Atau lanjut dengan
              </FieldSeparator>

              <Field>
                <Button variant="outline" type="button" className="gap-2">
                  <FcGoogle size={20} />
                  Masuk dengan Google
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Belum punya akun?{" "}
                <a href="#" className="font-medium">
                  Daftar
                </a>
              </FieldDescription>

              <FieldDescription className="text-center">
                Cuma mau cek pesan?{" "}
                <a href="/bedah" className="font-medium">
                  Lanjut tanpa akun
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div
            className="
              relative isolate hidden min-h-120 overflow-hidden md:block
              bg-[#06141B]
              bg-[radial-gradient(120%_70%_at_50%_110%,#158AB0_0%,#0B4A5C_35%,#06141B_70%)]
            "
            aria-hidden="true"
          >
            {/* Background ASCII */}
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

            {/* Maskot: di tengah bawah, sedikit terpotong */}
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-end justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/animated_maskot.gif"
                alt=""
                className="h-[80%] w-auto max-w-full translate-y-6 select-none object-contain object-bottom"
                draggable={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
