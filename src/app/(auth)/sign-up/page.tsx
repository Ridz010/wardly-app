import { RegisterForm } from "@/components/register-form";

export default function SignUpPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 pb-10 pt-28">
      <div className="w-full max-w-4xl">
        <RegisterForm />
      </div>
    </main>
  );
}