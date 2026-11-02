import { DityChat } from "@/components/chat/dity-chat";
import { getUser } from "@/lib/auth/session";

export async function DityChatLoader() {
    const user = await getUser();
    return <DityChat signedIn={Boolean(user)} />;
}
