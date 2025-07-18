import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'

const genres = [
  { id: 'all', name: 'All' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' }
]

const CategoryFilter = () => {
  const [searchParams] = useSearchParams()
  const [selectedGenre, setSelectedGenre] = useState('all')
  const navigate = useNavigate()

  // Update selected genre when URL changes
  useEffect(() => {
    const genreId = searchParams.get('genre')
    setSelectedGenre(genreId || 'all')
  }, [searchParams])

  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId)
    // Navigate to explore page with the selected genre
    navigate(`/explore?genre=${genreId}`)
  }

  return (
    <div className="category-filter bg-dark-200/50 backdrop-blur-md rounded-xl p-6 mb-8 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Browse by Category</h3>
        <button 
          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          onClick={() => navigate('/explore')}
        >
          View All
        </button>
      </div>
      
      <motion.div 
        className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
              selectedGenre === genre.id.toString()
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'bg-dark-100/50 hover:bg-dark-100 text-gray-300'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </motion.div>
    </div>
  )
}

export default CategoryFilter