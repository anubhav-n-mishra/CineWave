import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoArrowBack, IoHeart, IoHeartOutline, IoDiamond } from 'react-icons/io5';
import { FaCrown } from 'react-icons/fa';
import { fetchMovieDetails, fetchMovieVideos } from '../utils/api';
import { useHistory } from '../contexts/HistoryContext';
import { useLike } from '../contexts/LikeContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { usePremium } from '../contexts/PremiumContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import GroupWatchModal from '../components/groupwatch/GroupWatchModal';
import ReviewsPanel from '../components/reviews/ReviewsPanel';
import RelatedMovies from '../components/trailers/RelatedMovies';
import PremiumBadge from '../components/ui/PremiumBadge';
import LoadingScreen from '../components/ui/LoadingScreen';
import SubscriptionModal from '../components/subscription/SubscriptionModal';

const Player = () => {
  const { id } = useParams();
  const [movieDetails, setMovieDetails] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showGroupWatch, setShowGroupWatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { addToHistory } = useHistory();
  const { likedMovies, likeMovie, removeLikedMovie } = useLike();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isPremiumMovie } = usePremium();
  const { isSubscriptionActive, subscription } = useSubscription();
  
  const navigate = useNavigate();

  const isLiked = likedMovies.some((movie) => movie.id === parseInt(id));
  const isInWatchlist = watchlist.some((movie) => movie.id === parseInt(id));

  useEffect(() => {
    let isMounted = true;

    const loadMovieData = async () => {
      if (!id || isNaN(parseInt(id))) {
        setError('Invalid movie ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const details = await fetchMovieDetails(id);
        if (!isMounted) return;

        const videos = await fetchMovieVideos(id);
        if (!isMounted) return;

        // Select only a video that is a Trailer, from YouTube, and has "Trailer" in the name
        const trailerData = videos.results?.find(
          (video) =>
            video.type === 'Trailer' &&
            video.site === 'YouTube' &&
            video.name.toLowerCase().includes('trailer')
        );

        if (isMounted) {
          setMovieDetails(details);
          setTrailer(trailerData || null);
          
          // Check if this is a premium movie
          const premiumStatus = isPremiumMovie(details);
          setIsPremium(premiumStatus);

          // If it's a premium movie and user doesn't have an active subscription, show subscription modal
          if (premiumStatus && !isSubscriptionActive()) {
            setShowSubscriptionModal(true);
          }

          if (details) {
            addToHistory({
              id: parseInt(id),
              title: details.original_title || details.title,
              poster: details.poster_path,
              backdrop: details.backdrop_path,
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading movie data:', error);
          setError(error.message || 'Failed to load movie data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMovieData();

    return () => {
      isMounted = false;
    };
  }, [id, addToHistory, isPremiumMovie, isSubscriptionActive]);

  const handleLikeClick = () => {
    if (isLiked) {
      removeLikedMovie(parseInt(id));
    } else {
      likeMovie({
        id: parseInt(id),
        title: movieDetails?.original_title || movieDetails?.title || 'Unknown',
        poster: movieDetails?.poster_path,
        backdrop: movieDetails?.backdrop_path,
      });
    }
  };

  const handleWatchlistClick = () => {
    if (isInWatchlist) {
      removeFromWatchlist(parseInt(id));
    } else {
      addToWatchlist({
        id: parseInt(id),
        title: movieDetails?.original_title || movieDetails?.title || 'Unknown',
        poster: movieDetails?.poster_path,
        backdrop: movieDetails?.backdrop_path,
      });
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="bg-dark-200 p-8 rounded-xl max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button onClick={handleBackClick} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="bg-dark-200 p-8 rounded-xl max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
          <p className="text-gray-300 mb-6">We couldn't find the movie you're looking for.</p>
          <button onClick={handleBackClick} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isPremium && !isSubscriptionActive()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-300">
        <div className="text-center max-w-md p-8 bg-dark-400 rounded-xl">
          <div className="mb-6">
            <FaCrown className="text-yellow-400 text-5xl mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Premium Content Locked</h2>
          <p className="text-gray-300 mb-6">
            This content is only available to premium subscribers. Upgrade your account to access premium trailers and features.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setShowSubscriptionModal(true)}
              className="btn btn-primary"
            >
              <FaCrown className="mr-2" />
              Upgrade to Premium
            </button>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-ghost border border-white/20"
            >
              Back to Home
            </button>
          </div>
        </div>
        <SubscriptionModal 
          isOpen={showSubscriptionModal} 
          onClose={() => setShowSubscriptionModal(false)}
          movieId={id}
        />
      </div>
    );
  }

  const { backdrop_path, poster_path, original_title, title, release_date, vote_average, overview, genres } =
    movieDetails;

  const movieTitle = original_title || title;
  const releaseYear = release_date ? new Date(release_date).getFullYear() : 'Unknown';

  const backdropUrl = backdrop_path
    ? `https://image.tmdb.org/t/p/original${backdrop_path}`
    : poster_path
    ? `https://image.tmdb.org/t/p/original${poster_path}`
    : 'https://via.placeholder.com/1280x720?text=No+Backdrop+Available';

  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster+Available';

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url(${backdropUrl})`,
          backgroundPosition: 'center 20%',
        }}
      >
        <div className={`absolute inset-0 ${isPremium 
          ? 'bg-gradient-to-b from-amber-900/70 via-dark-400/90 to-dark-300' 
          : 'bg-gradient-to-b from-dark-500/70 via-dark-400/90 to-dark-300'
        }`}></div>
      </div>

      <button
        className="absolute top-24 left-6 z-30 p-3 rounded-full bg-dark-300/50 hover:bg-dark-200/70 transition-colors duration-300"
        onClick={handleBackClick}
      >
        <IoArrowBack size={24} />
      </button>

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1"
          >
            <div className={`relative rounded-xl overflow-hidden shadow-2xl group ${
              isPremium ? 'ring-2 ring-yellow-500/30' : ''
            }`}>
              <img
                src={posterUrl}
                alt={movieTitle}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                {trailer ? (
                  <button onClick={toggleModal} className="btn btn-primary px-6 py-3 font-semibold">
                    Watch Trailer
                  </button>
                ) : (
                  <span className="text-gray-300">No Trailer Available</span>
                )}
              </div>
              
              {/* Premium badge */}
              {isPremium && (
                <div className="absolute top-3 left-3 z-10">
                  <PremiumBadge />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold">{movieTitle}</h1>
              {isPremium && <IoDiamond className="text-yellow-400 text-3xl" />}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full">
                {releaseYear}
              </span>
              {genres &&
                genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="text-sm bg-dark-100/50 text-gray-300 px-3 py-1 rounded-full"
                  >
                    {genre.name}
                  </span>
                ))}
              {vote_average > 0 && (
                <span className="text-sm bg-secondary-600/20 text-secondary-400 px-3 py-1 rounded-full flex items-center">
                  <span className="text-yellow-400 mr-1">Ôÿà</span>
                  {vote_average.toFixed(1)}/10
                </span>
              )}
            </div>

            <p className="text-lg text-gray-300 mb-6 leading-relaxed">{overview || 'No overview available.'}</p>

            <div className="flex flex-wrap gap-3 mb-8">
              {trailer ? (
                <button onClick={toggleModal} className="btn btn-primary flex items-center gap-2">
                  <span>Watch Trailer</span>
                </button>
              ) : (
                <button disabled className="btn btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <span>No Trailer Available</span>
                </button>
              )}

              <button
                onClick={handleLikeClick}
                className={`btn ${isLiked ? 'btn-accent' : 'btn-ghost border border-white/20'} flex items-center gap-2`}
              >
                {isLiked ? <IoHeart /> : <IoHeartOutline />}
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </button>

              <button
                onClick={handleWatchlistClick}
                className={`btn ${isInWatchlist ? 'btn-secondary' : 'btn-ghost border border-white/20'} flex items-center gap-2`}
              >
                <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              {trailer && (
                <button
                  onClick={() => navigate(`/group?videoKey=${trailer.key}`)}
                  className="btn btn-ghost border border-white/20 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
                >
                  <span>Group Watch</span>
                </button>
              )}

              <button
                onClick={() => setShowReviews(true)}
                className="btn btn-ghost border border-white/20 flex items-center gap-2"
              >
                <span>Reviews</span>
              </button>
            </div>

            {movieDetails && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Related Movies</h2>
                <RelatedMovies movieId={id} />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && trailer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleModal}
          >
            <motion.div
              className="relative w-full max-w-6xl bg-dark-400 rounded-xl overflow-hidden shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-dark-300/70 hover:bg-dark-200 transition-colors"
                onClick={toggleModal}
              >
                <IoClose size={24} />
              </button>

              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  title={`${movieTitle} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold mb-2">{movieTitle} - Trailer</h2>
                  {isPremium && <PremiumBadge />}
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={handleLikeClick}
                    className={`btn ${isLiked ? 'btn-accent' : 'btn-ghost border border-white/20'} flex items-center gap-2`}
                  >
                    {isLiked ? <IoHeart /> : <IoHeartOutline />}
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                  </button>

                  <button
                    onClick={handleWatchlistClick}
                    className={`btn ${isInWatchlist ? 'btn-secondary' : 'btn-ghost border border-white/20'} flex items-center gap-2`}
                  >
                    <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setShowGroupWatch(true);
                    }}
                    className="btn btn-ghost border border-white/20 flex items-center gap-2"
                  >
                    <span>Group Watch</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReviews && (
          <ReviewsPanel movieId={id} movieTitle={movieTitle} onClose={() => setShowReviews(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGroupWatch && trailer && (
          <GroupWatchModal
            movie={{
              id,
              title: movieTitle,
              trailerKey: trailer.key,
              poster: poster_path,
            }}
            onClose={() => setShowGroupWatch(false)}
          />
        )}
      </AnimatePresence>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        movieId={id}
      />
    </div>
  );
};

export default Player;