"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

type Props = Omit<React.ComponentProps<typeof Button>, "type"> & {
    pendingLabel?: string;
};

export function SubmitButton({
    children,
    pendingLabel,
    className,
    disabled,
    ...props
}: Props) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending || disabled}
            aria-busy={pending}
            className={cn("rounded-full font-normal", className)}
            {...props}
        >
            {pending ? <Spinner /> : null}
            {pending && pendingLabel ? pendingLabel : children}
        </Button>
    );
}
