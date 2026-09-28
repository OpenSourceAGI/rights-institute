import AgreementTracker from '@rights/contract-builder/invite/AgreementTracker';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Agreement tracker - Rights.Institute',
  robots: 'noindex, nofollow',
};

/** The job seeker's private tracker; `?k=` is their access key. */
export default async function TrackerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { id } = await params;
  const { k } = await searchParams;
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto py-6">
        <AgreementTracker id={id} accessKey={k || ''} />
      </div>
    </div>
  );
}
