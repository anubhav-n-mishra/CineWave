// src/contexts/HistoryContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const HistoryContext = createContext(null);

export const HistoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  // Fetch history from Supabase on mount
  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('movie_id, title, poster, backdrop, watched_at')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false });
      if (error) throw error;
      setHistory(
        data.map((item) => ({
          id: item.movie_id,
          title: item.title,
          poster: item.poster,
          backdrop: item.backdrop,
        }))
      );
    } catch (error) {
      console.error('Error fetching history:', error.message);
    }
  };

  const addToHistory = useCallback(
    async (movie) => {
      if (!user) return; // History is passive, no alert needed

      try {
        // Check if movie is already in history
        const { data: existing } = await supabase
          .from('history')
          .select('movie_id')
          .eq('user_id', user.id)
          .eq('movie_id', movie.id)
          .single();

        if (existing) {
          // Update timestamp
          const { error } = await supabase
            .from('history')
            .update({
              title: movie.title,
              poster: movie.poster,
              backdrop: movie.backdrop,
              watched_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('movie_id', movie.id);
          if (error) throw error;
        } else {
          // Insert new entry
          const { error } = await supabase.from('history').insert([
            {
              user_id: user.id,
              movie_id: movie.id,
              title: movie.title,
              poster: movie.poster,
              backdrop: movie.backdrop,
            },
          ]);
          if (error) throw error;
        }

        // Refresh history
        setHistory((prev) => {
          const filtered = prev.filter((m) => m.id !== movie.id);
          return [
            { id: movie.id, title: movie.title, poster: movie.poster, backdrop: movie.backdrop },
            ...filtered,
          ];
        });
      } catch (error) {
        console.error('Error adding to history:', error.message);
      }
    },
    [user]
  );

  const removeFromHistory = useCallback(
    async (movieId) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('history')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movieId);
        if (error) throw error;
        setHistory((prev) => prev.filter((movie) => movie.id !== movieId));
      } catch (error) {
        console.error('Error removing from history:', error.message);
      }
    },
    [user]
  );

  const clearHistory = useCallback(
    async () => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('history')
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
        setHistory([]);
      } catch (error) {
        console.error('Error clearing history:', error.message);
      }
    },
    [user]
  );

  const value = {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};