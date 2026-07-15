import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { magazineArticles } from "../../data/magazine";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function MagazineList() {
  return (
    <div className="space-y-6">
      <header className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">OOM Magazine</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">외우는 답에서, 나답게 이어 말하는 답으로</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">짧게 훑고 필요한 글을 골라 읽을 수 있도록, 학습 노트를 목록으로 모았습니다.</p>
      </header>

      <div className="space-y-3">
        {magazineArticles.map((article) => (
          <Card className="group overflow-hidden transition hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800" key={article.id}>
            <div className="grid gap-0 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <img alt={article.imageAlt} className="aspect-[16/9] h-full w-full object-cover sm:aspect-auto sm:min-h-36" loading="lazy" src={article.image} />
              <div className="min-w-0 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">{article.category}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{article.readMinutes}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{article.date}</span>
                </div>
                <h2 className="mt-2 text-balance text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">{article.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{article.summary}</p>
                <Link className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition group-hover:gap-2.5 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-300 dark:hover:text-indigo-200 dark:focus-visible:ring-offset-zinc-900" to={`/magazine/${article.id}/`}>
                  기사 읽기 <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
