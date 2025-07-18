import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoSearch, IoClose, IoTime, IoDiamond } from 'react-icons/io5'
import { searchMovies } from '../../utils/api'
import { usePremium } from '../../contexts/PremiumContext'

const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [premiumIds, setPremiumIds] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const searchRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { checkBatchPremiumStatus } = usePremium()
  
  // Load recent searches from localStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches')
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches))
    }
  }, [])
  
  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Focus input when search is opened
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])
  
  // Debounce search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    
    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await searchMovies(searchQuery)
        setSearchResults(results.results?.slice(0, 5) || [])
        
        // Check which movies are premium
        const premiumMovieIds = checkBatchPremiumStatus(results.results?.slice(0, 5) || [])
        setPremiumIds(premiumMovieIds)
      } catch (error) {
        console.error('Error searching movies:', error)
      } finally {
        setIsLoading(false)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchQuery, checkBatchPremiumStatus])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Add to recent searches
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5)
      
      setRecentSearches(newRecentSearches)
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))
      
      navigate(`/explore?query=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }
  
  const openSearch = () => {
    setIsSearchOpen(true)
  }
  
  const clearSearch = () => {
    setSearchQuery('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }
  
  return (
    <div className="relative" ref={searchRef}>
      {/* Search Icon */}
      {!isSearchOpen && (
        <motion.button 
          onClick={openSearch}
          className="p-2 rounded-full hover:bg-dark-100/70 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Search"
        >
          <IoSearch className="h-6 w-6" />
        </motion.button>
      )}
      
      {/* Search Input */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.form
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '300px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30 
            }}
            onSubmit={handleSubmit}
            className="flex items-center"
          >
            <div className="relative flex-grow">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-200/80 backdrop-blur border border-dark-100 rounded-l-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-dark-100/70"
                >
                  <IoClose className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-r-xl px-4 py-2.5 text-sm transition-colors flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IoSearch className="h-4 w-4" />
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
      
      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-full bg-dark-200/95 backdrop-blur-md rounded-xl shadow-2xl z-10 overflow-hidden border border-dark-100"
          >
            {/* Recent Searches */}
            {searchQuery.length < 2 && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <p className="text-xs text-gray-400">Recent Searches</p>
                </div>
                <ul>
                  {recentSearches.map((search, index) => (
                    <li key={index} className="border-b border-dark-100 last:border-b-0">
                      <button
                        onClick={() => {
                          setSearchQuery(search)
                          if (inputRef.current) {
                            inputRef.current.focus()
                          }
                        }}
                        className="flex items-center p-2 w-full text-left hover:bg-dark-100/70 rounded-lg transition-colors"
                      >
                        <IoTime className="text-gray-400 mr-2" />
                        <span className="text-sm">{search}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <>
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((movie) => {
                      const isPremium = premiumIds.includes(movie.id);
                      
                      return (
                        <li key={movie.id} className="border-b border-dark-100 last:border-b-0">
                          <motion.button
                            onClick={() => {
                              navigate(`/player/${movie.id}`)
                              setIsSearchOpen(false)
                              setSearchQuery('')
                            }}
                            className={`flex items-center p-3 w-full text-left hover:bg-dark-100/70 transition-colors ${
                              isPremium ? 'bg-gradient-to-r from-amber-900/30 to-transparent' : ''
                            }`}
                            whileHover={{ x: 3 }}
                          >
                            <div className="w-12 h-16 flex-shrink-0 mr-3 overflow-hidden rounded-md">
                              <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/92x138?text=No+Image'}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <h4 className="font-medium line-clamp-1">{movie.title}</h4>
                                {isPremium && <IoDiamond className="text-yellow-400 ml-1" size={14} />}
                              </div>
                              <div className="flex items-center text-xs text-gray-400">
                                <span className="flex items-center">
                                  <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                  {movie.vote_average.toFixed(1)}
                                </span>
                                <span className="mx-2">•</span>
                                <span>
                                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown Year'}
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        </li>
                      );
                    })}
                    <li className="p-2 text-center">
                      <button
                        onClick={handleSubmit}
                        className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                      >
                        View all results
                      </button>
                    </li>
                  </ul>
                ) : isLoading ? (
                  <div className="p-8 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2"></div>
                      <p className="text-sm text-gray-400">Searching...</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-400 mb-2">No results found for "{searchQuery}"</p>
                    <p className="text-sm text-gray-500">Try a different search term</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar