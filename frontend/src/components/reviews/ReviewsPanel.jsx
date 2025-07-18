import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IoClose, IoStar } from 'react-icons/io5'
import { fetchMovieReviews } from '../../utils/api'

const ReviewsPanel = ({ movieId, movieTitle, onClose }) => {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const getReviews = async () => {
      try {
        setIsLoading(true)
        const data = await fetchMovieReviews(movieId)
        setReviews(data.results || [])
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    getReviews()
  }, [movieId])
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-500/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-2xl max-h-[80vh] bg-dark-300 rounded-xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-dark-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Reviews for {movieTitle}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-100 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>
        
        {/* Reviews List */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-dark-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{review.author}</h3>
                      {review.author_details?.rating && (
                        <div className="flex items-center mt-1">
                          <IoStar className="text-yellow-400 mr-1" />
                          <span>{review.author_details.rating}/10</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                    {review.content}
                  </p>
                  
                  <button className="mt-2 text-primary-400 text-xs hover:underline">
                    Read full review
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-400">No reviews found for this movie.</p>
              <button className="mt-4 btn btn-primary">Be the first to review</button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ReviewsPanel