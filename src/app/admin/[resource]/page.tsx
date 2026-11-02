import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Suspense } from "react";
import { z } from "zod";

import { ResourceManager, type ClientColumn, type ClientField, type Row } from "@/components/admin/resource-manager";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { RESOURCES, isResourceKey, type OptionsSource, type Resource } from "@/lib/admin/resources";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">): Promise<Metadata> {
  const { resource } = await params;
  return { title: isResourceKey(resource) ? RESOURCES[resource].title : "Admin" };
}

type Option = { value: string; label: string };

async function loadOptions(source: OptionsSource, parentId?: string): Promise<Option[]> {
  const admin = createAdminClient();

  if (source === "categories") {
    const { data } = await admin.from("scam_categories").select("id,name").order("sort_order");
    return data?.map((item) => ({ value: item.id, label: item.name })) ?? [];
  }

  if (!parentId) return [];
  const { data: step } = await admin.from("scenario_steps").select("scenario_id").eq("id", parentId).maybeSingle();
  if (!step) return [];
  const { data: steps } = await admin
    .from("scenario_steps")
    .select("id,step_order,narrative")
    .eq("scenario_id", step.scenario_id)
    .order("step_order");
  return steps?.map((item) => ({ value: item.id, label: `#${item.step_order} ${item.narrative.slice(0, 48)}` })) ?? [];
}

async function ResourceView({ params, searchParams }: PageProps<"/admin/[resource]">) {
  await requireRole("admin", "/admin");
  const [{ resource: key }, query] = await Promise.all([params, searchParams]);
  if (!isResourceKey(key)) notFound();
  const config: Resource = RESOURCES[key];

  const parentRaw = typeof query.parent === "string" ? query.parent : undefined;
  const parentId = parentRaw && z.string().uuid().safeParse(parentRaw).success ? parentRaw : undefined;
  if (config.parent && !parentId) notFound();

  const admin = createAdminClient();
  let builder = admin
    .from(config.table as "scam_categories")
    .select("*")
    .order(config.order.column as "id", { ascending: config.order.ascending })
    .limit(300);
  if (config.parent && parentId) builder = builder.eq(config.parent.fk as "id", parentId);
  const { data } = await builder;
  const rows = ((data ?? []) as unknown as Row[]);

  const sources = new Set<OptionsSource>();
  config.fields.forEach((field) => field.optionsFrom && sources.add(field.optionsFrom));
  config.columns.forEach((column) => column.lookup && sources.add(column.lookup));
  const resolved = new Map<OptionsSource, Option[]>();
  await Promise.all(
    [...sources].map(async (source) => {
      resolved.set(source, await loadOptions(source, parentId));
    }),
  );

  const fields: ClientField[] = config.fields.map((field) => ({
    name: field.name,
    label: field.label,
    type: field.type,
    hint: field.hint,
    placeholder: field.placeholder,
    nullable: field.nullable,
    wide: field.wide,
    options: field.optionsFrom ? resolved.get(field.optionsFrom) : field.options,
  }));

  const columns: ClientColumn[] = config.columns.map((column) => ({
    key: column.key,
    label: column.label,
    kind: column.kind,
    lookup: column.lookup
      ? Object.fromEntries((resolved.get(column.lookup) ?? []).map((option) => [option.value, option.label]))
      : undefined,
  }));

  let back: { href: string; label: string } | null = null;
  let subtitle = config.description;
  if (config.parent && parentId) {
    const parentConfig = RESOURCES[config.parent.resource];
    const { data: parentRow } = await admin
      .from(parentConfig.table as "scam_categories")
      .select("*")
      .eq("id", parentId)
      .maybeSingle();
    if (!parentRow) notFound();
    const record = parentRow as unknown as Record<string, unknown>;
    const grand = parentConfig.parent ? `?parent=${String(record[parentConfig.parent.fk])}` : "";
    back = { href: `/admin/${parentConfig.key}${grand}`, label: parentConfig.title };
    subtitle = `${String(record[parentConfig.labelKey]).slice(0, 90)}`;
  }

  return (
    <>
      {back ? (
        <Link href={back.href} className="group inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {back.label}
        </Link>
      ) : null}
      <PageHeader animate={false} title={config.title} description={subtitle} />
      <ResourceManager
        resource={config.key}
        singular={config.singular}
        fields={fields}
        columns={columns}
        rows={rows}
        parentId={parentId}
        drilldowns={(config.children ?? []).map((child) => ({
          label: child.label,
          resource: child.resource,
        }))}
      />
    </>
  );
}

export default function AdminResourcePage(props: PageProps<"/admin/[resource]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResourceView {...props} />
    </Suspense>
  );
}
