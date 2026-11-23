/**
 * News & Blog section for the homepage: the latest posts from the docs blog,
 * with a link to the full list.
 */
import React from 'react';
import { Newspaper } from 'lucide-react';

export interface NewsPost {
  title: string;
  description?: string;
  /** ISO day, e.g. 2026-11-23. */
  date?: string;
  author?: string;
  href: string;
}

export interface NewsSectionProps {
  posts: NewsPost[];
  /** Where "All posts" points. */
  allPostsHref?: string;
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const NewsSection: React.FC<NewsSectionProps> = ({ posts, allPostsHref = '/docs/blog' }) => {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="news-heading" className="mt-10">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-rose-500/40">
        <Newspaper className="w-5 h-5 text-slate-400 shrink-0" />
        <h2 id="news-heading" className="text-lg font-semibold text-slate-200">
          News &amp; Blog
        </h2>
        <a
          href={allPostsHref}
          className="ml-auto text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
        >
          All posts →
        </a>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post) => (
          <li key={post.href}>
            <a
              href={post.href}
              className="group flex h-full flex-col rounded-xl border border-slate-700/50 bg-slate-900 p-4 sm:p-5 shadow-xl transition-all duration-300 hover:border-slate-600/70 hover:shadow-2xl"
            >
              {post.date && (
                <time dateTime={post.date} className="text-xs uppercase tracking-wide text-slate-400">
                  {formatDate(post.date)}
                </time>
              )}
              <h3 className="mt-1 text-base font-bold text-slate-100 leading-tight group-hover:text-blue-300 transition-colors">
                {post.title}
              </h3>
              {post.description && (
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{post.description}</p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default NewsSection;
