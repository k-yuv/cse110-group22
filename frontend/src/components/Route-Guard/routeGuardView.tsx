import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { ROUTES } from '../../routes';
import { useRouteGuardModel, type GuardedScreen } from './routeGuardModel';

interface RouteGuardProps {
  screen: GuardedScreen;
  children: ReactNode;
}

// Wraps a route that has to be unlocked first. Shows nothing while loading,
// so a locked screen never flashes. A locked screen redirects to the desk
// with `replace`, so Back doesn't return to it.
export default function RouteGuard({ screen, children }: RouteGuardProps) {
  const { status } = useRouteGuardModel(screen);

  if (status === 'loading') return null;
  if (status === 'locked') return <Navigate to={ROUTES.desk} replace />;
  return children;
}
