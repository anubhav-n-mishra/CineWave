import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IoClose, IoShareSocial, IoHeart, IoHeartOutline } from 'react-icons/io5'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '../../contexts/AuthContext'
import ChatPanel from './ChatPanel'
import { useLike } from '../../contexts/LikeContext'

const GroupWatchModal = ({ movie, onClose }) => {
  const [roomId, setRoomId] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [messages, setMessages] = useState([])
  const [viewers, setViewers] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const { user } = useAuth()
  const { likedMovies, likeMovie, removeLikedMovie } = useLike()
  
  const isLiked = likedMovies.some(m => m.id === movie.id)

  // Simulate joining room
  useEffect(() => {
    // Generate random room ID if none exists
    const newRoomId = uuidv4().substring(0, 8)
    setRoomId(newRoomId)
    setInviteUrl(`${window.location.origin}/groupwatch/${newRoomId}`)
    
    // Simulate some viewers
    setViewers([
      { id: 1, name: 'You (Host)', isHost: true },
      { id: 2, name: 'Guest 1', isHost: false }
    ])
    
    // Simulate some welcome messages
    setMessages([
      { id: 1, sender: 'System', text: `Welcome to the GroupWatch room!`, timestamp: new Date().toISOString() },
      { id: 2, sender: 'System', text: `You are watching "${movie.title}"`, timestamp: new Date().toISOString() },
      { id: 3, sender: 'System', text: `Invite friends by sharing the room link`, timestamp: new Date().toISOString() }
    ])
    
  }, [movie.title])
  
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl)
      .then(() => {
        // Add system message
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now(), 
            sender: 'System', 
            text: 'Invite link copied to clipboard!', 
            timestamp: new Date().toISOString() 
          }
        ])
      })
      .catch(err => {
        console.error('Failed to copy invite link:', err)
      })
  }
  
  const handleLike = () => {
    if (isLiked) {
      removeLikedMovie(movie.id)
    } else {
      likeMovie({
        id: movie.id,
        title: movie.title,
        poster: movie.poster
      })
      
      // Add message to chat
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now(), 
          sender: 'You', 
          text: '❤️ liked this trailer!', 
          timestamp: new Date().toISOString() 
        }
      ])
    }
  }
  
  const handleSendMessage = (message) => {
    if (!message.trim()) return
    
    setMessages(prev => [
      ...prev,
      { 
        id: Date.now(), 
        sender: 'You', 
        text: message, 
        timestamp: new Date().toISOString() 
      }
    ])
  }
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    
    // Add message to chat
    setMessages(prev => [
      ...prev,
      { 
        id: Date.now(), 
        sender: 'You (Host)', 
        text: `${!isPlaying ? '▶️ Started' : '⏸️ Paused'} the trailer for everyone`, 
        timestamp: new Date().toISOString() 
      }
    ])
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-500/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full h-full md:h-auto md:w-auto md:max-w-6xl md:max-h-[90vh] bg-dark-300 rounded-xl overflow-hidden flex flex-col md:flex-row"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Left Side - Video Player */}
        <div className="w-full md:w-3/4 h-[40vh] md:h-auto relative">
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-dark-400/70 hover:bg-dark-300 transition-colors"
            onClick={onClose}
          >
            <IoClose size={24} />
          </button>
          
          {/* Trailer Player */}
          <div className="w-full h-full">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=0&enablejsapi=1`}
              title={`${movie.title} - Group Watch`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          
          {/* Control Bar */}
          <div className="bg-dark-400 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={togglePlayPause}
                className="btn btn-primary flex items-center space-x-2"
              >
                <span>{isPlaying ? 'Pause for All' : 'Play for All'}</span>
              </button>
              
              <button 
                onClick={handleLike}
                className={`btn ${isLiked ? 'btn-accent' : 'btn-ghost border border-white/20'}`}
              >
                {isLiked ? <IoHeart /> : <IoHeartOutline />}
              </button>
            </div>
            
            <div>
              <div className="text-xs text-gray-400">Room ID: {roomId}</div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Chat & Participants */}
        <div className="w-full md:w-1/4 bg-dark-400 flex flex-col border-l border-dark-100">
          {/* Room Info */}
          <div className="p-4 border-b border-dark-100">
            <h3 className="text-lg font-bold mb-2">{movie.title}</h3>
            <p className="text-sm text-gray-300 mb-4">Group Watch Room</p>
            
            <div className="flex flex-wrap gap-2">
              {viewers.map(viewer => (
                <span 
                  key={viewer.id}
                  className={`text-xs px-2 py-1 rounded-full ${
                    viewer.isHost 
                      ? 'bg-primary-600/30 text-primary-400' 
                      : 'bg-dark-100/80 text-gray-300'
                  }`}
                >
                  {viewer.name}
                </span>
              ))}
            </div>
            
            <button
              onClick={handleCopyInvite}
              className="btn btn-ghost border border-white/20 w-full mt-4 flex items-center justify-center gap-2"
            >
              <IoShareSocial size={16} />
              <span>Copy Invite Link</span>
            </button>
          </div>
          
          {/* Chat Panel */}
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GroupWatchModal