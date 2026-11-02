import { Suspense } from "react";

import NavbarClient from "@/components/layouts/section/navbar-client";
import { getUser } from "@/lib/auth/session";

async function NavbarWithSession() {
    const user = await getUser();
    return <NavbarClient signedIn={Boolean(user)} />;
}

export default function Navbar() {
    return (
        <Suspense fallback={<NavbarClient signedIn={false} />}>
            <NavbarWithSession />
        </Suspense>
    );
}
