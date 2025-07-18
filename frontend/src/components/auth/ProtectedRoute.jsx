import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePremium } from '../../contexts/PremiumContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import LoadingScreen from '../ui/LoadingScreen';

const ProtectedRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isMoviePremium } = usePremium();
  const { isSubscriptionActive, loading: subLoading } = useSubscription();
  const location = useLocation();

  if (authLoading || subLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check if the current route is for a premium movie
  const movieId = location.pathname.split('/player/')[1];
  if (movieId && isMoviePremium(movieId) && !isSubscriptionActive()) {
    return <Navigate to="/premium" replace />;
  }

  return children;
};

export default ProtectedRoute;