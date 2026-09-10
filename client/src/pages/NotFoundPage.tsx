import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="mt-2 text-sm text-slate-600">The requested route does not exist.</p>
      <Link className="mt-4 inline-block text-sm font-medium text-sky-700 underline" to="/">
        Return home
      </Link>
    </section>
  );
}
