import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { searchMovies, fetchGenres, fetchMoviesByGenre } from '../utils/api'
import { usePremium } from '../contexts/PremiumContext'
import PremiumBadge from '../components/ui/PremiumBadge'
import LoadingScreen from '../components/ui/LoadingScreen'

const Explore = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [premiumIds, setPremiumIds] = useState([])
  
  const { checkBatchPremiumStatus } = usePremium()
  const query = searchParams.get('query')
  const genreId = searchParams.get('genre')
  
  useEffect(() => {
    // Fetch genres once
    const getGenres = async () => {
      try {
        const genreData = await fetchGenres()
        setGenres(genreData.genres || [])
      } catch (error) {
        console.error('Error fetching genres:', error)
      }
    }
    
    getGenres()
  }, [])
  
  useEffect(() => {
    // Set selected genre from URL parameter
    if (genreId) {
      setSelectedGenre(genreId)
    } else {
      setSelectedGenre('all')
    }
  }, [genreId])
  
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      
      try {
        let data
        if (query) {
          // If we have a search query, search for movies
          data = await searchMovies(query)
        } else if (selectedGenre && selectedGenre !== 'all') {
          // If a genre is selected, fetch movies by genre
          data = await fetchMoviesByGenre(selectedGenre)
        } else {
          // Default: fetch trending movies
          data = await searchMovies('a')
        }
        
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
  }, [query, selectedGenre, checkBatchPremiumStatus])
  
  // Handle genre selection
  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId)
    navigate(`/explore?genre=${genreId}`)
  }
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {query ? `Search Results for "${query}"` : 'Explore Movies'}
          </h1>
          
          {!query && (
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleGenreChange('all')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                    selectedGenre === 'all'
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-dark-100/50 hover:bg-dark-100 text-gray-300'
                  }`}
                >
                  All Movies
                </button>
                
                {genres.map(genre => (
                  <button 
                    key={genre.id}
                    onClick={() => handleGenreChange(genre.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                      selectedGenre === genre.id.toString()
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                        : 'bg-dark-100/50 hover:bg-dark-100 text-gray-300'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {movies.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {movies.map((movie) => {
              const isPremium = premiumIds.includes(movie.id);
              
              return (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <a
                    href={`/player/${movie.id}`}
                    className="block group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                      <img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isPremium && (
                        <div className="absolute top-2 left-2">
                          <PremiumBadge />
                        </div>
                      )}
                    </div>
                    <div className={`p-4 ${isPremium ? 'bg-gradient-to-r from-amber-900/80 to-dark-200' : 'bg-dark-200'}`}>
                      <h3 className="font-semibold text-white line-clamp-1">{movie.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="text-sm text-gray-300">
                            {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : 'Unknown'
                          }
                        </span>
                      </div>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No movies found</h2>
            <p className="text-gray-400">
              {query 
                ? `We couldn't find any movies matching "${query}"`
                : 'Try selecting a different genre or search term'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Explore