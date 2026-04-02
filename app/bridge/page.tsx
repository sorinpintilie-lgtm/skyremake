import { redirect } from 'next/navigation';
import BridgeDashboard from '@/components/bridge-dashboard';
import { hasDashboardCredentials, isDashboardAuthenticated } from '@/lib/dashboard-auth';

export const metadata = {
  title: 'Bridge',
  robots: { index: false, follow: false },
};

export default async function BridgePage() {
  if (!hasDashboardCredentials()) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#05070d] px-6 text-white">
        <div className="w-full max-w-md rounded-[28px] border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold">Dashboard auth is not configured</h1>
          <p className="mt-3 text-sm text-white/72">Set these env vars in Netlify: WHATSAPP_DASHBOARD_USERNAME, WHATSAPP_DASHBOARD_PASSWORD, WHATSAPP_DASHBOARD_SESSION_SECRET.</p>
        </div>
      </main>
    );
  }

  const authenticated = await isDashboardAuthenticated();
  if (!authenticated) redirect('/bridge/login');

  return <BridgeDashboard />;
}
