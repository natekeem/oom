import { ArrowLeft, Clock3, Lightbulb } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { magazineArticles } from "../../data/magazine";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function MagazineDetail() {
  const { id } = useParams<{ id: string }>();
  const article = magazineArticles.find((item) => item.id === id);

  if (!article) {
    return (
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-white">게시물을 찾을 수 없습니다.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">다시 목록으로 이동하여 다른 글을 확인해 주세요.</p>
        <div className="mt-6"><Link className="inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900" to="/magazine/">매거진 목록으로</Link></div>
      </Card>
    );
  }

  return (
    <article className="pb-4">
      <header className="mx-auto max-w-4xl">
        <Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-600 transition hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-zinc-300 dark:hover:text-indigo-300 dark:focus-visible:ring-offset-zinc-950" to="/magazine/">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> 매거진 목록
        </Link>
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <Badge tone="indigo">{article.category}</Badge>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{article.date}</span>
          <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{article.readMinutes}</span>
        </div>
        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-white">{article.title}</h1>
        <p className="mt-4 text-balance text-lg leading-8 text-zinc-600 dark:text-zinc-300">{article.subtitle}</p>
      </header>

      <figure className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        <img alt={article.imageAlt} className="aspect-[16/8] w-full object-cover" src={article.image} />
        <figcaption className="px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400">OOM 매거진을 위해 생성한 에디토리얼 이미지</figcaption>
      </figure>

      <div className="mx-auto mt-10 max-w-3xl space-y-10">
        <p className="border-l-4 border-indigo-500 pl-5 text-lg font-medium leading-8 text-zinc-800 dark:text-zinc-100">{article.summary}</p>

        {article.disclaimer ? <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100"><span className="font-semibold">읽기 전 참고.</span> {article.disclaimer}</aside> : null}

        {article.sections.map((section) => (
          <section className="space-y-4" key={section.heading}>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">{section.heading}</h2>
            <div className="space-y-4 text-[15px] leading-8 text-zinc-700 dark:text-zinc-300">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {section.image ? (
              <figure className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                <img alt={section.imageAlt ?? ""} className="aspect-[16/9] w-full object-cover" loading="lazy" src={section.image} />
                {section.imageCaption ? <figcaption className="px-4 py-2.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{section.imageCaption}</figcaption> : null}
              </figure>
            ) : null}
            {section.bullets ? (
              <ul className="space-y-2 rounded-xl bg-zinc-50 p-5 text-sm leading-7 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                {section.bullets.map((bullet) => <li className="flex gap-3" key={bullet}><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />{bullet}</li>)}
              </ul>
            ) : null}
            {section.example ? (
              <aside className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/40">
                <h3 className="text-base font-semibold text-indigo-950 dark:text-indigo-100">{section.example.title}</h3>
                {section.example.description ? <p className="mt-1.5 text-sm leading-6 text-indigo-900/80 dark:text-indigo-200/80">{section.example.description}</p> : null}
                <div className="mt-4 space-y-3">
                  {section.example.lines.map((line) => <p className="border-l-2 border-indigo-300 pl-3 font-mono text-sm leading-6 text-indigo-950 dark:border-indigo-700 dark:text-indigo-100" key={line}>{line}</p>)}
                </div>
              </aside>
            ) : null}
            {section.note ? (
              <aside className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-100">
                <Lightbulb aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                <p><span className="font-semibold">{section.note.title}.</span> {section.note.text}</p>
              </aside>
            ) : null}
          </section>
        ))}

        <aside className="rounded-2xl bg-zinc-950 p-6 text-zinc-100 dark:bg-indigo-950">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Takeaway</p>
          <p className="mt-3 text-lg font-medium leading-8">{article.takeaway}</p>
        </aside>

        <div className="border-t border-zinc-200 pt-7 dark:border-zinc-800">
          <Link className="inline-flex rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-950" to="/magazine/">다른 매거진 글 보기</Link>
        </div>
      </div>
    </article>
  );
}
