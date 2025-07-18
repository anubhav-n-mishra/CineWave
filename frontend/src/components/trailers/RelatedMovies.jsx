import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchRelatedMovies } from '../../utils/api';

const RelatedMovies = ({ movieId }) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const getRelatedMovies = async () => {
      if (!movieId || isNaN(parseInt(movieId))) {
        setError('Invalid movie ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchRelatedMovies(movieId);

        if (isMounted) {
          setMovies(data.results?.slice(0, 6) || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching related movies:', error);
          setError('Failed to load related movies');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getRelatedMovies();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-dark-100/30 rounded-lg aspect-video animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (movies.length === 0) {
    return <p className="text-gray-400">No related movies found</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {movies.map((movie) => (
        <motion.div
          key={movie.id}
          whileHover={{ scale: 1.05 }}
          className="relative overflow-hidden rounded-lg group"
        >
          <Link to={`/player/${movie.id}`}>
            <div className="aspect-video">
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.backdrop_path || movie.poster_path}`}
                alt={movie.title || movie.original_title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x169?text=No+Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-500/90 via-dark-400/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="text-sm font-medium line-clamp-1">
                  {movie.title || movie.original_title}
                </h3>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400 text-xs mr-1">★</span>
                  <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default memo(RelatedMovies);