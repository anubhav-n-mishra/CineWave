import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWatchlist } from '../contexts/WatchlistContext'
import { useLike } from '../contexts/LikeContext'

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist()
  const { likedMovies } = useLike()
  const [activeTab, setActiveTab] = useState('watchlist')
  
  const currentList = activeTab === 'watchlist' ? watchlist : likedMovies
  const removeAction = activeTab === 'watchlist' ? removeFromWatchlist : () => {}
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }
  
  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">My Collections</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-dark-100 mb-8">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'watchlist'
                ? 'border-b-2 border-primary-500 text-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Watchlist
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'liked'
                ? 'border-b-2 border-primary-500 text-primary-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Liked Movies
          </button>
        </div>
        
        {currentList.length > 0 ? (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentList.map((movie) => (
              <motion.div
                key={movie.id}
                variants={itemVariants}
                className="relative group overflow-hidden rounded-lg shadow-lg"
              >
                <Link to={`/player/${movie.id}`}>
                  <div className="aspect-[2/3]">
                    <img
                      src={
                        movie.poster
                          ? `https://image.tmdb.org/t/p/w500${movie.poster}`
                          : 'https://via.placeholder.com/500x750?text=No+Poster'
                      }
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-500/90 via-dark-400/30 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white line-clamp-1">{movie.title}</h3>
                    </div>
                  </div>
                </Link>
                
                {activeTab === 'watchlist' && (
                  <button
                    onClick={() => removeFromWatchlist(movie.id)}
                    className="absolute top-2 right-2 p-2 bg-dark-400/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from watchlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">
              {activeTab === 'watchlist' 
                ? 'Your watchlist is empty' 
                : 'You haven\'t liked any movies yet'
              }
            </h2>
            <p className="text-gray-400 mb-6">
              {activeTab === 'watchlist'
                ? 'Add movies to your watchlist to keep track of what you want to watch.'
                : 'Like movies to build a collection of your favorites.'
              }
            </p>
            <Link to="/" className="btn btn-primary">
              Discover Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Watchlist