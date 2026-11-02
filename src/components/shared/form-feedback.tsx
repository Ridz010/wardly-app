import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActionState } from "@/lib/result";

export function FormFeedback({ state }: { state: ActionState<unknown> }) {
    if (state.status === "idle") return null;

    if (state.status === "error") {
        return (
            <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription className="text-destructive">
                    {state.message}
                </AlertDescription>
            </Alert>
        );
    }

    if (!state.message) return null;

    return (
        <Alert variant="success">
            <CircleCheckIcon />
            <AlertDescription>{state.message}</AlertDescription>
        </Alert>
    );
}

export const fieldError = (state: ActionState<unknown>, name: string) =>
    state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined;
