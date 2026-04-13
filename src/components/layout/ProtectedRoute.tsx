import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return children;
}
