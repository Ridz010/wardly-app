import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";

type Section = { heading: string; body: string[] };

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: Section[] }) {
    return (
        <PageShell narrow>
            <PageHeader title={title} description={`Terakhir diperbarui ${updated}.`} />
            <div className="flex flex-col gap-8">
                {sections.map((section) => (
                    <section key={section.heading} className="flex flex-col gap-3">
                        <h2 className="font-heading text-xl font-light tracking-tight">{section.heading}</h2>
                        {section.body.map((paragraph) => (
                            <p key={paragraph} className="text-muted-foreground">{paragraph}</p>
                        ))}
                    </section>
                ))}
            </div>
        </PageShell>
    );
}
