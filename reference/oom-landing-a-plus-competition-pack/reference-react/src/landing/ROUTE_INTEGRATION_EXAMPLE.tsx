// Concept only. Adapt to the actual OOM router.
// The important contract is: `/` bypasses the app shell.

function RootRouteBoundary() {
  const location = useLocation();

  if (location.pathname === "/") {
    return <LandingPage />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
