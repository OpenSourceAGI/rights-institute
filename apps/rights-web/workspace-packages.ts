import { resolve } from 'path';

/**
 * Workspace packages under `packages/` that the site consumes as TypeScript
 * source. Each is imported as `@rights/<name>/<file>` (subpath) or
 * `@rights/<name>` (barrel, where the package has an `index.ts`).
 */
export const WORKSPACE_PACKAGES = [
  'contract-builder',
  'credit',
  'innovation-timeline',
  'investor-rank',
  'prosper-license',
  'site-shell',
  'startup-tools',
] as const;

/**
 * Resolve `@rights/*` straight to package source.
 *
 * The packages ship TypeScript rather than a build output and their `exports`
 * map subpaths without extensions, so aliasing to `src/` lets Vite and Vitest
 * resolve the same files the editor and `tsc` do. The subpath rule comes
 * before the bare one so `@rights/credit/CREDIT` isn't swallowed by the
 * `@rights/credit` entry.
 */
export function workspaceAliases(appDir: string) {
  return WORKSPACE_PACKAGES.flatMap((name) => {
    const src = resolve(appDir, `../../packages/${name}/src`);
    return [
      { find: new RegExp(`^@rights/${name}/(.*)$`), replacement: `${src}/$1` },
      { find: new RegExp(`^@rights/${name}$`), replacement: `${src}/index.ts` },
    ];
  });
}
