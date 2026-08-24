import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider>
      <DocsLayout
        tree={source.getPageTree()}
        nav={{ title: 'Rights Institute Docs' }}
        githubUrl="https://github.com/opensourceagi/rights-institute"
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
