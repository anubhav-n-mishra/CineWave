import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-16">
      <div className="text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-8xl font-bold mb-6 title-gradient">404</h1>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/" className="btn btn-primary px-8 py-3">
            Back to Home
          </Link>
        </motion.div>
        
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold mb-4">You might like these instead:</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link to="/" className="hover:text-primary-400 transition-colors">
              Home
            </Link>
            <Link to="/explore" className="hover:text-primary-400 transition-colors">
              Explore
            </Link>
            <Link to="/watchlist" className="hover:text-primary-400 transition-colors">
              Watchlist
            </Link>
            <Link to="/groupwatch" className="hover:text-primary-400 transition-colors">
              GroupWatch
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound