import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { LikeProvider } from './contexts/LikeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { PremiumProvider } from './contexts/PremiumContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

const Root = () => {
  return (
    <AuthProvider>
      <LikeProvider>
        <HistoryProvider>
          <WatchlistProvider>
            <PremiumProvider>
              <SubscriptionProvider>
                <App />
              </SubscriptionProvider>
            </PremiumProvider>
          </WatchlistProvider>
        </HistoryProvider>
      </LikeProvider>
    </AuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>
);