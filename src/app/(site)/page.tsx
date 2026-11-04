import { Suspense } from "react";

import Blog from "@/components/layouts/section/blog";
import FiturBento from "@/components/layouts/section/fitur-bento";
import Hero from "@/components/layouts/section/hero";
import Ketenangan from "@/components/layouts/section/ketenangan";
import Komunitas from "@/components/layouts/section/komunitas";
import Modus from "@/components/layouts/section/modus";
import Problem from "@/components/layouts/section/problem";
import Stats from "@/components/layouts/section/stats";
import Tanda from "@/components/layouts/section/tanda";

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="min-h-96" />}>
        <Stats />
      </Suspense>
      <Problem />
      <FiturBento />
      <Modus />
      <Suspense fallback={<div className="min-h-96" />}>
        <Komunitas />
      </Suspense>
      <Ketenangan />
      <Suspense fallback={<div className="min-h-96" />}>
        <Blog />
      </Suspense>
      <Tanda />
    </>
  );
}
