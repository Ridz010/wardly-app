import { FcGoogle } from "react-icons/fc";

import { googleSignInAction } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/shared/submit-button";

export function GoogleButton({ next, label }: { next: string; label: string }) {
  return (
    <form action={googleSignInAction}>
      <input type="hidden" name="next" value={next} />
      <SubmitButton variant="outline" size="lg" className="h-10 w-full gap-2 font-light">
        <FcGoogle size={18} />
        {label}
      </SubmitButton>
    </form>
  );
}
