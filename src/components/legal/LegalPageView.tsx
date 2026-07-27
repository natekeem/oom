import { legalPages, type LegalPageId } from "../../data/legalPages";
import { Card } from "../ui/Card";

type LegalPageViewProps = {
  pageId: LegalPageId;
};

export function LegalPageView({ pageId }: LegalPageViewProps) {
  const page = legalPages[pageId];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{page.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">{page.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">{page.description}</p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">최종 업데이트: {page.updatedAt}</p>
      </header>
      <div className="space-y-4">
        {page.sections.map((section) => (
          <Card className="p-5 sm:p-6" key={section.heading}>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300" key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.bullets ? <ul className="mt-4 space-y-2">{section.bullets.map((bullet) => <li className="text-sm leading-6 text-zinc-600 dark:text-zinc-300" key={bullet}>- {bullet}</li>)}</ul> : null}
            {section.links ? (
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li className="text-sm leading-6" key={link.href}>
                    <a className="font-medium text-indigo-700 underline-offset-4 hover:underline dark:text-indigo-300" href={link.href} rel={link.href.startsWith("http") ? "noreferrer" : undefined} target={link.href.startsWith("http") ? "_blank" : undefined}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
