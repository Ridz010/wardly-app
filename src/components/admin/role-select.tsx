"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setRoleAction } from "@/app/admin/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const ROLES = [
  { value: "user", label: "Anggota" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
];

export function RoleSelect({ id, role, self }: { id: string; role: string; self: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Select
        items={ROLES}
        value={role}
        disabled={self || pending}
        onValueChange={(next) => {
          if (!next || next === role) return;
          const form = new FormData();
          form.set("id", id);
          form.set("role", String(next));
          startTransition(async () => {
            const result = await setRoleAction({ status: "idle" }, form);
            if (result.status === "error") toast.error(result.message);
            else toast.success(result.message ?? "Peran diperbarui.");
          });
        }}
      >
        <SelectTrigger className="w-36 font-light" aria-label="Peran pengguna">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending ? <Spinner className="text-primary" /> : null}
    </div>
  );
}
