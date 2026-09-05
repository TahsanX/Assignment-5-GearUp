/**
 * `/dashboard` is redirected to the role-specific home by middleware; this page
 * exists only so the route resolves during client-side transitions.
 */
export default function DashboardIndexPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-muted">Redirecting to your dashboard…</p>
    </div>
  );
}
