import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { fetchTrending } from '../utils/api'
import GroupWatchModal from '../components/groupwatch/GroupWatchModal'
import { useAuth } from '../contexts/AuthContext'

const GroupWatch = () => {
  const { roomId } = useParams()
  const [trendingMovies, setTrendingMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [isJoiningRoom, setIsJoiningRoom] = useState(!!roomId)
  const [roomIdInput, setRoomIdInput] = useState(roomId || '')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    const getTrendingMovies = async () => {
      try {
        const data = await fetchTrending()
        setTrendingMovies(data.results?.slice(0, 12) || [])
      } catch (error) {
        console.error('Error fetching trending movies:', error)
      }
    }
    
    getTrendingMovies()
  }, [])
  
  useEffect(() => {
    if (roomId) {
      setIsJoiningRoom(true)
      setRoomIdInput(roomId)
    }
  }, [roomId])
  
  const handleCreateRoom = (movie) => {
    if (!user) {
      // Prompt user to sign in first
      login()
      return
    }
    
    setSelectedMovie(movie)
    setIsCreatingRoom(true)
  }
  
  const handleJoinRoom = (e) => {
    e.preventDefault()
    
    if (!roomIdInput.trim()) {
      return
    }
    
    if (!user) {
      // Prompt user to sign in first
      login()
      return
    }
    
    // Navigate to the room
    navigate(`/groupwatch/${roomIdInput}`)
  }
  
  const createNewRoomId = () => {
    return uuidv4().substring(0, 8)
  }
  
  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">GroupWatch</h1>
        <p className="text-gray-300 mb-8">
          Watch trailers together with friends in real-time. Chat, react, and enjoy the experience together.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Create Room */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Create a Room</h2>
            <p className="text-gray-300 mb-6">
              Select a movie trailer below to create a GroupWatch room and invite your friends.
            </p>
            <button
              onClick={() => setIsCreatingRoom(true)}
              className="btn btn-primary w-full"
            >
              Create Room
            </button>
          </motion.div>
          
          {/* Join Room */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4">Join a Room</h2>
            <p className="text-gray-300 mb-4">
              Enter a room ID to join an existing GroupWatch session.
            </p>
            <form onSubmit={handleJoinRoom}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="Enter Room ID"
                  className="flex-grow bg-dark-200 border border-dark-100 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary whitespace-nowrap"
                >
                  Join Room
                </button>
              </div>
            </form>
          </motion.div>
        </div>
        
        {/* Trending Movies for Room Creation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Trailers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingMovies.map((movie) => (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer overflow-hidden rounded-lg shadow-lg"
                onClick={() => handleCreateRoom(movie)}
              >
                <div className="aspect-[2/3] relative">
                  <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://via.placeholder.com/342x513?text=No+Image'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-500/90 via-dark-400/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="btn btn-primary">
                      Select
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-dark-200 text-center">
                  <h3 className="font-medium line-clamp-1">{movie.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Features Section */}
        <div className="glass-card p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">GroupWatch Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-600/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Synchronized Playback</h3>
              <p className="text-gray-300">
                Watch trailers in perfect sync with your friends, with the host controlling playback for everyone.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-600/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-300">
                Chat with your friends in real-time while watching together. Share reactions and discuss the trailer.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-600/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Invites</h3>
              <p className="text-gray-300">
                Share a simple room code with your friends so they can join your GroupWatch session with one click.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Room Modal */}
      {isCreatingRoom && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark-500/95 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-full max-w-2xl bg-dark-300 rounded-xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="p-6 border-b border-dark-100">
              <h2 className="text-2xl font-bold">Create GroupWatch Room</h2>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Select a movie to watch:</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                {trendingMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => setSelectedMovie(movie)}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                      selectedMovie?.id === movie.id
                        ? 'ring-2 ring-primary-500 transform scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsCreatingRoom(false)}
                  className="btn btn-ghost border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsCreatingRoom(false)
                    
                    // If a movie is selected, create and open GroupWatch modal
                    if (selectedMovie) {
                      const newRoomId = createNewRoomId()
                      navigate(`/groupwatch/${newRoomId}`)
                    }
                  }}
                  className="btn btn-primary"
                  disabled={!selectedMovie}
                >
                  Create Room
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Join Room Modal */}
      {isJoiningRoom && roomId && (
        <GroupWatchModal
          movie={{
            id: 0, // This will be updated once we fetch the room info
            title: "Joining GroupWatch",
            trailerKey: "", // This will be updated
            poster: ""
          }}
          onClose={() => {
            setIsJoiningRoom(false)
            navigate('/groupwatch')
          }}
        />
      )}
    </div>
  )
}

export default GroupWatch