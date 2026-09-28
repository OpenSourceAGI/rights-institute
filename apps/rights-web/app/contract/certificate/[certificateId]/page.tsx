import CertificateView from '@rights/contract-builder/invite/CertificateView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Agreement certificate - Rights.Institute',
};

/** Public verification page for a signed agreement's certificate. */
export default async function CertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-3xl mx-auto py-6">
        <CertificateView certificateId={certificateId} />
      </div>
    </div>
  );
}
