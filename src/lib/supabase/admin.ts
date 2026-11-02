import "server-only";
import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/env/public";
import { serverEnv } from "@/env/server";
import type { Database } from "./types";

export const createAdminClient = () =>
    createClient<Database>(publicEnv.supabaseUrl, serverEnv.serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
