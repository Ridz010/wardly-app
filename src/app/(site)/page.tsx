import { Suspense } from "react";

import Blog from "@/components/layouts/section/blog";
import CaraKerja from "@/components/layouts/section/cara-kerja";
import Hero from "@/components/layouts/section/hero";
import Komunitas from "@/components/layouts/section/komunitas";
import Modus from "@/components/layouts/section/modus";
import Problem from "@/components/layouts/section/problem";
import Tanda from "@/components/layouts/section/tanda";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <CaraKerja />
      <Modus />
      <Suspense fallback={<div className="min-h-96" />}>
        <Komunitas />
      </Suspense>
      <Suspense fallback={<div className="min-h-96" />}>
        <Blog />
      </Suspense>
      <Tanda />
    </>
  );
}
