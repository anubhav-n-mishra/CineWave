import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCrown } from 'react-icons/fa'
import { IoDiamond } from 'react-icons/io5'
import { fetchTrending, fetchMoviesByCategory } from '../utils/api'
import { usePremium } from '../contexts/PremiumContext'
import PremiumBadge from '../components/ui/PremiumBadge'
import LoadingScreen from '../components/ui/LoadingScreen'
import SubscriptionModal from '../components/subscription/SubscriptionModal'

const Premium = () => {
  const [premiumMovies, setPremiumMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { checkBatchPremiumStatus } = usePremium()
  const navigate = useNavigate()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  
  useEffect(() => {
    const fetchPremiumContent = async () => {
      try {
        setIsLoading(true)
        
        // Fetch movies from different categories to ensure a good mix
        const [trendingData, topRatedData, popularData] = await Promise.all([
          fetchTrending(),
          fetchMoviesByCategory('top_rated'),
          fetchMoviesByCategory('popular')
        ])
        
        // Combine all movies
        const allMovies = [
          ...(trendingData.results || []),
          ...(topRatedData.results || []),
          ...(popularData.results || [])
        ]
        
        // Remove duplicates based on movie id
        const uniqueMovies = Array.from(
          new Map(allMovies.map(movie => [movie.id, movie])).values()
        )
        
        // Check which movies are premium
        const premiumIds = checkBatchPremiumStatus(uniqueMovies)
        
        // Filter to only premium movies
        const premiumMoviesList = uniqueMovies.filter(movie => 
          premiumIds.includes(movie.id)
        )
        
        setPremiumMovies(premiumMoviesList)
      } catch (error) {
        console.error('Error fetching premium content:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPremiumContent()
  }, [checkBatchPremiumStatus])
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden mb-12">
          <div className="relative z-10 py-16 px-8 md:py-24 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <IoDiamond className="text-yellow-400 text-2xl" />
                <h1 className="text-3xl md:text-4xl font-bold">Premium Content</h1>
              </div>
              
              <p className="text-lg text-gray-300 mb-8">
                Discover our collection of premium trailers, featuring high-rated and exclusive content selected just for you.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="btn btn-primary" onClick={() => setShowSubscriptionModal(true)}>
                  Get Premium Access
                </button>
                <button className="btn btn-ghost border border-white/20">
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-400 via-dark-300/90 to-transparent z-0"></div>
          
          {/* Premium badge decoration */}
          <div className="absolute top-8 right-8 transform rotate-12 z-0 opacity-50">
            <FaCrown className="text-yellow-400 text-7xl" />
          </div>
        </div>
        
        {/* Premium Movies Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaCrown className="text-yellow-400" />
            Premium Movies
          </h2>
          
          {premiumMovies.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {premiumMovies.map((movie) => (
                <motion.div
                  key={movie.id}
                  whileHover={{ scale: 1.05 }}
                  className="movie-card relative overflow-hidden rounded-lg shadow-lg cursor-pointer border border-amber-800/30"
                  onClick={() => navigate(`/player/${movie.id}`)}
                >
                  <div className="relative aspect-[2/3]">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : 'https://via.placeholder.com/500x750?text=No+Poster'
                      }
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-dark-400/30 to-transparent opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-semibold text-white">{movie.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-300">
                            {movie.release_date
                              ? new Date(movie.release_date).getFullYear()
                              : 'Unknown'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Premium badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <PremiumBadge size="small" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No premium movies found</h2>
              <p className="text-gray-400 mb-6">
                There seems to be an issue with our premium content. Please try again later.
              </p>
            </div>
          )}
        </div>
        
        {/* Premium Benefits Section */}
        <div className="glass-card p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Premium Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <FaCrown className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Content</h3>
              <p className="text-gray-300">
                Access to high-rated and exclusive movie trailers not available to regular users.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Early Access</h3>
              <p className="text-gray-300">
                Be the first to watch upcoming movie trailers before they're released to the public.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Ads</h3>
              <p className="text-gray-300">
                Enjoy an ad-free experience while watching your favorite movie trailers.
              </p>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Get access to all premium features and content with our premium subscription.
          </p>
          <button className="btn btn-primary px-8 py-3 text-lg" onClick={() => setShowSubscriptionModal(true)}>
            Subscribe Now
          </button>
        </div>
      </div>
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
    </div>
  )
}

export default Premium