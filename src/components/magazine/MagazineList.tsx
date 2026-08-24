import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { magazineArticles } from "../../data/magazine";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { topLevelNavigation } from "../layout/topLevelNavigation";
import { PageIntro } from "../ui/PageIntro";

export function MagazineList() {
  return (
    <div className="space-y-6">
      <PageIntro
        description="짧게 훑고 필요한 글을 골라 읽을 수 있도록, 학습 노트를 목록으로 모았습니다."
        icon={topLevelNavigation.magazine.icon}
        tag={topLevelNavigation.magazine.label}
        title="외우는 답에서, 나답게 이어 말하는 답으로"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {magazineArticles.map((article) => (
          <Card className="group flex h-full flex-col overflow-hidden transition hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800" key={article.id}>
            <Link aria-label={`${article.title} 기사 읽기`} className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500" to={`/magazine/${article.id}/`}>
              <img
                alt={article.imageAlt}
                className="aspect-[3/2] h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
                data-image-ratio="3:2"
                data-magazine-cover
                loading="lazy"
                src={article.image}
                style={{ objectPosition: article.imagePosition ?? "center" }}
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">{article.category}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{article.readMinutes}</span>
                  <time className="text-xs text-zinc-500 dark:text-zinc-400" dateTime={article.publishedAt}>{article.date}</time>
                </div>
                <h2 className="mt-2 text-balance text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">{article.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{article.summary}</p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">작성·검수 {article.author}</p>
                <Link className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-indigo-600 transition group-hover:gap-2.5 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-300 dark:hover:text-indigo-200 dark:focus-visible:ring-offset-zinc-900" to={`/magazine/${article.id}/`}>
                  기사 읽기 <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
