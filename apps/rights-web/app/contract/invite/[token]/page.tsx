import EmployerInvite from '@rights/contract-builder/invite/EmployerInvite';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Review & sign agreement - Rights.Institute',
  robots: 'noindex, nofollow',
};

/** Where the employer lands from the job seeker's invite link. */
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto py-6">
        <EmployerInvite token={token} />
      </div>
    </div>
  );
}
