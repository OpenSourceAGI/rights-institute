import React from 'react'
import DocumentNavigation from '@rights/site-shell/DocumentNavigation'
import NewsSection from '@rights/site-shell/NewsSection'
import GameOfLifeBackground from '@/components/animations/GameOfLifeBackground'
import { source } from '@/lib/source'
import { BLOG_BASE_URL, blogPosts } from '@/lib/blog'

const HOMEPAGE_POST_COUNT = 3

export default function HomePage() {
  const posts = blogPosts(source.getPages()).slice(0, HOMEPAGE_POST_COUNT)

  return (
    <GameOfLifeBackground className="bg-slate-900" delay={1.2}>
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-slate-900/90 backdrop-blur-md shadow-2xl shadow-black/40 border-x border-white/10">
        <DocumentNavigation>
          <NewsSection posts={posts} allPostsHref={BLOG_BASE_URL} />
        </DocumentNavigation>
      </main>
    </GameOfLifeBackground>
  )
}
