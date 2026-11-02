import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicEnv } from "@/env/public";
import type { Database } from "./types";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/komunitas/baru"];
const GUEST_ONLY_PREFIXES = ["/sign-in", "/sign-up"];

const matches = (path: string, prefixes: string[]) =>
    prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const hasAuthCookie = (request: NextRequest) =>
    request.cookies.getAll().some(({ name }) => name.startsWith("sb-"));

export async function updateSession(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const needsAuth = matches(path, PROTECTED_PREFIXES);
    const guestOnly = matches(path, GUEST_ONLY_PREFIXES);

    if (!hasAuthCookie(request)) {
        if (!needsAuth) return NextResponse.next({ request });
        return redirectToSignIn(request);
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient<Database>(
        publicEnv.supabaseUrl,
        publicEnv.supabaseKey,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll(list) {
                    list.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    response = NextResponse.next({ request });
                    list.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    const { data } = await supabase.auth.getClaims();
    const signedIn = Boolean(data?.claims?.sub);

    if (!signedIn && needsAuth) return redirectToSignIn(request);

    if (signedIn && guestOnly) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
    }

    return response;
}

function redirectToSignIn(request: NextRequest) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
}
