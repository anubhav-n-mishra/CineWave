// src/contexts/WatchlistContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);

  // Fetch watchlist from Supabase on mount
  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('movie_id, title, poster, backdrop')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWatchlist(
        data.map((item) => ({
          id: item.movie_id,
          title: item.title,
          poster: item.poster,
          backdrop: item.backdrop,
        }))
      );
    } catch (error) {
      console.error('Error fetching watchlist:', error.message);
    }
  };

  const addToWatchlist = useCallback(
    async (movie) => {
      if (!user) {
        alert('Please log in to add to watchlist.');
        return;
      }

      if (watchlist.some((m) => m.id === movie.id)) {
        return; // Movie already in watchlist
      }

      try {
        const { error } = await supabase.from('watchlist').insert([
          {
            user_id: user.id,
            movie_id: movie.id,
            title: movie.title,
            poster: movie.poster,
            backdrop: movie.backdrop,
          },
        ]);
        if (error) throw error;
        setWatchlist((prev) => [
          { id: movie.id, title: movie.title, poster: movie.poster, backdrop: movie.backdrop },
          ...prev,
        ]);
      } catch (error) {
        console.error('Error adding to watchlist:', error.message);
      }
    },
    [user, watchlist]
  );

  const removeFromWatchlist = useCallback(
    async (movieId) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movieId);
        if (error) throw error;
        setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
      } catch (error) {
        console.error('Error removing from watchlist:', error.message);
      }
    },
    [user]
  );

  const isInWatchlist = useCallback(
    (movieId) => {
      return watchlist.some((movie) => movie.id === movieId);
    },
    [watchlist]
  );

  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};