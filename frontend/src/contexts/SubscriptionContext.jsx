import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        // Check if subscription is still valid
        const endDate = new Date(data.end_date);
        const now = new Date();
        
        if (endDate > now) {
          setSubscription(data);
          // Store subscription in localStorage for persistence
          localStorage.setItem('subscription', JSON.stringify(data));
        } else {
          // Subscription expired, clear it
          setSubscription(null);
          localStorage.removeItem('subscription');
        }
      } else {
        // No subscription found, clear any stored data
        setSubscription(null);
        localStorage.removeItem('subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load subscription from localStorage on initial load
  useEffect(() => {
    const storedSubscription = localStorage.getItem('subscription');
    if (storedSubscription) {
      const parsedSubscription = JSON.parse(storedSubscription);
      const endDate = new Date(parsedSubscription.end_date);
      const now = new Date();
      
      if (endDate > now) {
        setSubscription(parsedSubscription);
      } else {
        localStorage.removeItem('subscription');
      }
    }
  }, []);

  const createSubscription = async (planData, paymentId) => {
    try {
      // Calculate end date (2 days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 2);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: user.id,
          plan_id: planData.id,
          plan_name: planData.name,
          amount: planData.amount,
          currency: planData.currency,
          payment_id: paymentId,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString()
        }])
        .select()
        .single();

      if (!error && data) {
        setSubscription(data);
        // Store subscription in localStorage
        localStorage.setItem('subscription', JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  const isSubscriptionActive = () => {
    if (!subscription) return false;
    
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    
    return endDate > now;
  };

  const value = {
    subscription,
    loading,
    isSubscriptionActive,
    createSubscription,
    fetchSubscription
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};