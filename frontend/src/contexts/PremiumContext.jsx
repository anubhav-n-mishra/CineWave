import { createContext, useContext, useState, useEffect } from 'react';

const PremiumContext = createContext(null);

export const PremiumProvider = ({ children }) => {
  const [premiumMovies, setPremiumMovies] = useState([]);

  // Function to determine if a movie should be premium based on rating and popularity
  const isPremiumMovie = (movie) => {
    // Movies with high ratings (>= 8.0) or very popular movies are marked as premium
    return (
      (movie.vote_average && movie.vote_average >= 8.0) || 
      (movie.popularity && movie.popularity > 1000) ||
      // Also make some random movies premium (based on ID)
      (movie.id && movie.id % 5 === 0) // Make approximately 20% of movies premium
    );
  };

  // Check if a specific movie ID is premium
  const isMoviePremium = (movieId) => {
    return premiumMovies.some(movie => movie.id === parseInt(movieId));
  };

  // Add a movie to premium list
  const addPremiumMovie = (movie) => {
    setPremiumMovies((prev) => {
      if (prev.some((m) => m.id === movie.id)) {
        return prev;
      }
      return [...prev, movie];
    });
  };

  // Check multiple movies and determine which ones are premium
  const checkBatchPremiumStatus = (movies) => {
    if (!movies || !Array.isArray(movies)) return [];
    
    const premiumIds = [];
    
    movies.forEach(movie => {
      if (isPremiumMovie(movie)) {
        addPremiumMovie(movie);
        premiumIds.push(movie.id);
      }
    });
    
    return premiumIds;
  };

  const value = {
    premiumMovies,
    isPremiumMovie,
    isMoviePremium,
    checkBatchPremiumStatus
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};