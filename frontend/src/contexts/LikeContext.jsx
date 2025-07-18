// src/contexts/LikeContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const LikeContext = createContext(null);

export const LikeProvider = ({ children }) => {
  const { user } = useAuth();
  const [likedMovies, setLikedMovies] = useState([]);

  // Fetch likes from Supabase on mount
  useEffect(() => {
    if (user) {
      fetchLikes();
    } else {
      setLikedMovies([]);
    }
  }, [user]);

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('movie_id, title, poster, backdrop')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLikedMovies(
        data.map((item) => ({
          id: item.movie_id,
          title: item.title,
          poster: item.poster,
          backdrop: item.backdrop,
        }))
      );
    } catch (error) {
      console.error('Error fetching likes:', error.message);
    }
  };

  const likeMovie = useCallback(
    async (movie) => {
      if (!user) {
        alert('Please log in to like movies.');
        return;
      }

      if (likedMovies.some((m) => m.id === movie.id)) {
        return; // Movie already liked
      }

      try {
        const { error } = await supabase.from('likes').insert([
          {
            user_id: user.id,
            movie_id: movie.id,
            title: movie.title,
            poster: movie.poster,
            backdrop: movie.backdrop,
          },
        ]);
        if (error) throw error;
        setLikedMovies((prev) => [
          { id: movie.id, title: movie.title, poster: movie.poster, backdrop: movie.backdrop },
          ...prev,
        ]);
      } catch (error) {
        console.error('Error liking movie:', error.message);
      }
    },
    [user, likedMovies]
  );

  const removeLikedMovie = useCallback(
    async (movieId) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movieId);
        if (error) throw error;
        setLikedMovies((prev) => prev.filter((movie) => movie.id !== movieId));
      } catch (error) {
        console.error('Error removing liked movie:', error.message);
      }
    },
    [user]
  );

  const value = {
    likedMovies,
    likeMovie,
    removeLikedMovie,
  };

  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
};

export const useLike = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLike must be used within a LikeProvider');
  }
  return context;
};