import CaraKerja from "@/components/layouts/section/cara-kerja";
import Footer from "@/components/layouts/section/footer";
import Hero from "@/components/layouts/section/hero";
import Modus from "@/components/layouts/section/modus";
import Navbar from "@/components/layouts/section/navbar";
import Problem from "@/components/layouts/section/problem";
import Tanda from "@/components/layouts/section/tanda";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Problem />
      <CaraKerja />
      <Modus />
      <Tanda />
      <Footer />
    </>
  );
}
