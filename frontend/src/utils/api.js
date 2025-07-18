const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
console.log("✅ VITE_TMDB_API_KEY:", import.meta.env.VITE_TMDB_API_KEY);
console.log("✅ Authorization Header:", `Bearer ${API_KEY}`);
const API_BASE_URL = 'https://api.themoviedb.org/3';

// Using bearer token authorization as per TMDB v3 API requirements
const defaultOptions = {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
};

// Helper function to handle API requests with better error handling
const fetchFromApi = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching from: ${url}`);
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status}`, errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Fetch trending movies
export const fetchTrending = async () => {
  return fetchFromApi('/trending/movie/day?language=en-US');
};

// Fetch movies by category (popular, now_playing, top_rated, upcoming)
export const fetchMoviesByCategory = async (category = 'now_playing') => {
  return fetchFromApi(`/movie/${category}?language=en-US&page=1`);
};

// Fetch movie details
export const fetchMovieDetails = async (movieId) => {
  if (!movieId) {
    throw new Error('Movie ID is required');
  }
  return fetchFromApi(`/movie/${movieId}?language=en-US`);
};

// Fetch movie videos (trailers, teasers, etc.)
export const fetchMovieVideos = async (movieId) => {
  if (!movieId) {
    throw new Error('Movie ID is required');
  }
  return fetchFromApi(`/movie/${movieId}/videos?language=en-US`);
};

// Fetch movie reviews
export const fetchMovieReviews = async (movieId) => {
  if (!movieId) {
    throw new Error('Movie ID is required');
  }
  return fetchFromApi(`/movie/${movieId}/reviews?language=en-US&page=1`);
};

// Fetch related movies (similar)
export const fetchRelatedMovies = async (movieId) => {
  if (!movieId) {
    throw new Error('Movie ID is required');
  }
  return fetchFromApi(`/movie/${movieId}/similar?language=en-US&page=1`);
};

// Search movies
export const searchMovies = async (query) => {
  if (!query) {
    throw new Error('Search query is required');
  }
  return fetchFromApi(`/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`);
};

// Fetch movie recommendations
export const fetchMovieRecommendations = async (movieId) => {
  if (!movieId) {
    throw new Error('Movie ID is required');
  }
  return fetchFromApi(`/movie/${movieId}/recommendations?language=en-US&page=1`);
};

// Fetch movies by genre
export const fetchMoviesByGenre = async (genreId) => {
  if (!genreId) {
    throw new Error('Genre ID is required');
  }
  return fetchFromApi(`/discover/movie?with_genres=${genreId}&language=en-US&page=1`);
};

// Fetch movie genres list
export const fetchGenres = async () => {
  return fetchFromApi('/genre/movie/list?language=en-US');
};