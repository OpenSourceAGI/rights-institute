'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Menu, Scale, X } from 'lucide-react';
import { AuthButton } from '@rights/auth/AuthButton';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@rights/ui/navigation-menu';
import { cn } from '@rights/ui/utils';
import {
  SITE_CATEGORIES,
  SITE_LINKS,
  categoryNavLabel,
  navLabel,
  type SiteCategory,
  type SiteDocument,
} from './site-nav';

/** Height of the fixed bar, mirrored by the layout's top padding. */
export const TOP_NAV_HEIGHT_CLASS = 'h-16';

/**
 * The bar — and so every dropdown inside it — sits above page chrome. Several
 * pages ship their own sticky header, and at a matching z-index the page wins
 * simply by coming later in the document, which is how an open menu ended up
 * painted over. Page headers dock at `top-16` below `z-40`; keep them there.
 */
export const TOP_NAV_Z_CLASS = 'z-[100]';

function CategoryMenu({
  category,
  onSelect,
}: {
  category: SiteCategory;
  onSelect?: () => void;
}) {
  const creatable = category.documents.filter((doc) => doc.createHref);
  const CategoryIcon = category.icon;

  return (
    <div
      className={cn(
        'w-[min(92vw,44rem)] overflow-hidden rounded-2xl border border-white/10 bg-gray-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl',
        creatable.length > 0 && 'w-[min(92vw,56rem)]',
      )}
    >
      <div className={cn('grid', creatable.length > 0 && 'md:grid-cols-[1fr_15rem]')}>
        <div className="p-3">
          <div
            className={cn(
              'mb-1 flex items-center gap-2 border-b px-2.5 pb-2.5',
              category.borderColor,
            )}
          >
            <CategoryIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              {category.title}
            </span>
          </div>
          <ul className={cn('grid gap-1', category.documents.length > 2 && 'md:grid-cols-2')}>
            {category.documents.map((doc) => (
              <li key={doc.href}>
                <DocumentRow doc={doc} inMenu onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </div>

        {creatable.length > 0 && (
          <div className="border-t border-white/10 bg-white/[0.03] p-3 md:border-t-0 md:border-l">
            <div className="mb-1 px-2.5 pb-2.5 text-xs font-semibold tracking-wide text-gray-300 uppercase">
              Create
            </div>
            <ul className="grid gap-1">
              {creatable.map((doc) => (
                <li key={doc.createHref}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={doc.createHref as string}
                      onClick={onSelect}
                      className="group/create flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06] focus-visible:outline-none"
                    >
                      <span className="min-w-0 truncate">{navLabel(doc)}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform group-hover/create:translate-x-0.5 group-hover/create:text-gray-300" />
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function GitHubLink({ className }: { className?: string }) {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-3.5 text-sm font-medium text-gray-300 transition-colors hover:border-white/25 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:outline-none',
        className,
      )}
    >
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
      GitHub
    </a>
  );
}

/**
 * Site-wide top navigation: the brand, a mega menu per document category, the
 * standalone links, and the sign-in state. Rendered from the root layout so it
 * is present on every page.
 */
export function TopNav() {
  const pathname = usePathname();
  const [openCategory, setOpenCategory] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);

  const closeAll = useCallback(() => {
    setOpenCategory('');
    setMobileOpen(false);
    setOpenMobileCategory(null);
  }, []);

  // A route change should never leave a menu hanging open over the new page.
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className={`fixed inset-x-0 top-0 ${TOP_NAV_Z_CLASS} border-b border-gray-800 bg-gray-900/80 backdrop-blur-md`}
    >
      <nav aria-label="Main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn('flex items-center justify-between gap-4', TOP_NAV_HEIGHT_CLASS)}>
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                <Scale className="h-4 w-4 text-white" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">Rights Institute</span>
            </Link>

            <NavigationMenu
              viewport={false}
              value={openCategory}
              onValueChange={setOpenCategory}
              className="hidden lg:flex"
              delayDuration={100}
            >
              <NavigationMenuList>
                {SITE_CATEGORIES.map((category) => (
                  <NavigationMenuItem key={category.title} value={category.title}>
                    <NavigationMenuTrigger className={cn(NAV_ITEM_CLASS, 'bg-transparent')} chevron={false}>
                      {categoryNavLabel(category)}
                      <ChevronDown
                        className="h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="left-0 md:absolute md:w-auto">
                      <CategoryPanel category={category} onSelect={closeAll} />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}

                {SITE_LINKS.filter((link) => link.href !== '/').map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          NAV_ITEM_CLASS,
                          pathname === link.href && 'bg-white/10 text-white',
                        )}
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <GitHubLink className="hidden xl:inline-flex" />
            <div className="hidden sm:block">
              <AuthButton />
            </div>
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="site-nav-mobile"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-md p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:outline-none lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="site-nav-mobile"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-gray-950/95 backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap gap-x-4 gap-y-2 pb-2">
              {SITE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {SITE_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              const expanded = openMobileCategory === category.title;
              return (
                <div key={category.title} className="rounded-xl border border-white/10">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() =>
                      setOpenMobileCategory((current) =>
                        current === category.title ? null : category.title,
                      )
                    }
                    className="flex w-full items-center gap-2 px-3 py-3 text-left"
                  >
                    <CategoryIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    <span className="flex-1 text-sm font-semibold text-gray-200">
                      {category.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-gray-500 transition-transform',
                        expanded && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {expanded && (
                    <div className="grid gap-1 px-2 pb-2">
                      {category.documents.map((doc) => (
                        <DocumentRow key={doc.href} doc={doc} onSelect={closeAll} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <GitHubLink />
              <div className="sm:hidden">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default TopNav;
