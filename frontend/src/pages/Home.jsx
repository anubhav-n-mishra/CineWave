import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import FeaturedTrailer from '../components/home/FeaturedTrailer'
import TitleCards from '../components/trailers/TitleCards'
import TrendingSection from '../components/home/TrendingSection'
import CategoryFilter from '../components/filters/CategoryFilter'
import { fetchTrending } from '../utils/api'
import gsap from 'gsap'

const Home = () => {
  const [trending, setTrending] = useState([])
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const heroRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const trendingData = await fetchTrending()
        setTrending(trendingData.results || [])
        
        // Select a random movie with backdrop for featured section
        const moviesWithBackdrops = trendingData.results.filter(
          movie => movie.backdrop_path && movie.vote_average > 7
        )
        
        if (moviesWithBackdrops.length > 0) {
          const randomIndex = Math.floor(Math.random() * moviesWithBackdrops.length)
          setFeaturedMovie(moviesWithBackdrops[randomIndex])
        }
      } catch (error) {
        console.error('Error loading home data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (featuredMovie && heroRef.current) {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
    }
  }, [featuredMovie])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Featured Trailer Section */}
      {featuredMovie && <div ref={heroRef}><FeaturedTrailer movie={featuredMovie} /></div>}

      {/* Main Content */}
      <motion.div
        className="container mx-auto px-4 md:px-8 -mt-32 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Category Filters */}
        <motion.div variants={itemVariants}>
          <CategoryFilter />
        </motion.div>

        {/* Trending Section */}
        <motion.div variants={itemVariants} className="mt-8">
          <TrendingSection movies={trending.slice(0, 10)} />
        </motion.div>

        {/* Movie Categories */}
        <motion.div variants={itemVariants} className="mt-8">
          <TitleCards title="Popular Movies" category="popular" />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <TitleCards title="Now Playing" category="now_playing" />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <TitleCards title="Top Rated" category="top_rated" />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <TitleCards title="Upcoming" category="upcoming" />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Home