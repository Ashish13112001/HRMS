import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../services/health';

export function HomePage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Project foundation</h2>
      <p className="mt-2 text-sm text-slate-600">
        The React client is running. API status is loaded from <code>GET /api/v1/health</code>.
      </p>

      {healthQuery.isLoading ? (
        <p className="mt-4 text-sm text-slate-500" role="status">
          Checking API health…
        </p>
      ) : null}

      {healthQuery.isError ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {healthQuery.error instanceof Error
            ? healthQuery.error.message
            : 'Unable to reach the API'}
        </p>
      ) : null}

      {healthQuery.data ? (
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex gap-2">
            <dt className="font-medium text-slate-500">Status</dt>
            <dd className="font-medium text-emerald-700">{healthQuery.data.status}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-slate-500">Checked at</dt>
            <dd>{healthQuery.data.timestamp}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
