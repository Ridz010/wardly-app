import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/env/public";
import type { Database } from "./types";

export function createClient() {
    return createBrowserClient<Database>(
        publicEnv.supabaseUrl,
        publicEnv.supabaseKey,
    );
}
