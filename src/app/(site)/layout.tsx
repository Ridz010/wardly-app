import { Suspense } from "react";

import { DityChatLoader } from "@/components/chat/dity-chat-loader";
import Footer from "@/components/layouts/section/footer";
import Navbar from "@/components/layouts/section/navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Suspense fallback={null}>
                <DityChatLoader />
            </Suspense>
        </>
    );
}
