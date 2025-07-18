import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchMovieVideos } from '../../utils/api'

const FeaturedTrailer = ({ movie }) => {
  const [trailerKey, setTrailerKey] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTrailer = async () => {
      if (!movie) return
      
      try {
        setIsLoading(true)
        const videos = await fetchMovieVideos(movie.id)
        const trailer = videos.results.find(
          video => video.type === "Trailer" && video.site === "YouTube"
        )
        
        if (trailer) {
          setTrailerKey(trailer.key)
        }
      } catch (error) {
        console.error('Error loading trailer:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTrailer()
  }, [movie])

  if (!movie) return null

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
  
  return (
    <div className="relative w-full h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dark-500/90 via-dark-300/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-dark-300/50 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="w-full lg:w-1/2 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              {movie.title || movie.original_title}
            </h1>
            
            <div className="flex items-center mb-4 space-x-4">
              <span className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                <span>{movie.vote_average.toFixed(1)}/10</span>
              </span>
              <span>•</span>
              <span>
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Coming Soon'}
              </span>
            </div>
            
            <p className="text-lg text-gray-300 mb-8 line-clamp-3">{movie.overview}</p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to={`/player/${movie.id}`}
                className="btn btn-primary px-8 py-3"
              >
                Watch Now
              </Link>
              
              {trailerKey && (
                <a 
                  href={`https://www.youtube.com/watch?v=${trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost border border-white/20 px-8 py-3"
                >
                  Trailer
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedTrailer