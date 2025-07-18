import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCrown } from 'react-icons/fa'
import { fetchMoviesByCategory } from '../../utils/api'
import { usePremium } from '../../contexts/PremiumContext'
import PremiumBadge from '../ui/PremiumBadge'
import { useSubscription } from '../../contexts/SubscriptionContext'
import SubscriptionModal from '../subscription/SubscriptionModal'
import gsap from 'gsap'

const TitleCards = ({ title, category }) => {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [premiumIds, setPremiumIds] = useState([])
  const cardsRef = useRef()
  const navigate = useNavigate()
  const { checkBatchPremiumStatus } = usePremium()
  const { isSubscriptionActive } = useSubscription()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const cardsContainerRef = useRef(null)

  const handleWheel = (event) => {
    if (cardsRef.current && cardsRef.current.matches(':hover')) {
      if (event.deltaY !== 0) {
        event.preventDefault()
        cardsRef.current.scrollLeft += event.deltaY
      }
    }
  }

  const scrollLeft = () => {
    if (cardsRef.current) {
      cardsRef.current.scrollBy({
        left: -cardsRef.current.offsetWidth / 2,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (cardsRef.current) {
      cardsRef.current.scrollBy({
        left: cardsRef.current.offsetWidth / 2,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        const data = await fetchMoviesByCategory(category || 'now_playing')
        setMovies(data.results || [])
        
        // Check which movies are premium
        const premiumMovieIds = checkBatchPremiumStatus(data.results || [])
        setPremiumIds(premiumMovieIds)
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [category, checkBatchPremiumStatus])

  useEffect(() => {
    if (!isLoading && cardsContainerRef.current) {
      gsap.fromTo(
        cardsContainerRef.current.children,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
      )
    }
  }, [isLoading, movies])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  const handleCardClick = (movie) => {
    const isPremium = premiumIds.includes(movie.id)
    
    if (isPremium && !isSubscriptionActive()) {
      setSelectedMovie(movie)
      setShowSubscriptionModal(true)
    } else {
      navigate(`/player/${movie.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="title-cards mb-16">
        <h2 className="text-2xl font-bold mb-4">{title || 'Loading Movies...'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <div 
              key={index} 
              className="aspect-video rounded-lg bg-dark-100/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="title-cards mb-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title || 'Now Playing'}</h2>
        <div className="flex gap-2">
          <button 
            onClick={scrollLeft} 
            className="p-2 rounded-full bg-dark-100/80 hover:bg-dark-100 transition-colors"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            onClick={scrollRight} 
            className="p-2 rounded-full bg-dark-100/80 hover:bg-dark-100 transition-colors"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      <motion.div 
        className="card-list flex gap-4 overflow-x-auto pb-4 no-scrollbar"
        ref={cardsRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {movies.map((movie) => {
          const isPremium = premiumIds.includes(movie.id)
          
          return (
            <motion.div 
              key={movie.id}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              className={`card flex-shrink-0 w-[300px] relative group cursor-pointer ${isPremium ? 'premium-card' : ''}`}
              onClick={() => handleCardClick(movie)}
            >
              <div className="block h-full">
                <div className="relative overflow-hidden rounded-xl aspect-video">
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`} 
                    alt={movie.title || movie.original_title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://via.placeholder.com/300x169?text=No+Image'
                    }}
                  />
                  
                  {/* Premium overlay gradient */}
                  {isPremium && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-800/50 via-dark-400/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  
                  {/* Premium badge */}
                  {isPremium && (
                    <div className="absolute top-2 left-2 z-10">
                      <PremiumBadge size="small" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="text-sm font-semibold line-clamp-1">
                      {movie.title || movie.original_title}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400 text-xs mr-1">Ôÿà</span>
                      <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        movieId={selectedMovie?.id}
      />
    </div>
  )
}

export default TitleCards