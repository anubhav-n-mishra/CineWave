import { useState, useRef, useEffect } from 'react'

const ChatPanel = ({ messages, onSendMessage }) => {
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!messageText.trim()) return
    
    onSendMessage(messageText)
    setMessageText('')
  }
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex flex-col ${
              message.sender === 'System' 
                ? 'items-center' 
                : message.sender === 'You' 
                  ? 'items-end' 
                  : 'items-start'
            }`}
          >
            <div className={`px-3 py-2 rounded-xl max-w-[90%] ${
              message.sender === 'System' 
                ? 'bg-dark-100/50 text-gray-400 text-xs' 
                : message.sender === 'You' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-200 text-white'
            }`}>
              {message.sender !== 'System' && (
                <div className="font-semibold text-xs">
                  {message.sender}
                </div>
              )}
              <div className={message.sender === 'System' ? 'text-center' : ''}>
                {message.text}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 border-t border-dark-100 flex gap-2"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-grow bg-dark-200 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 transition-colors"
          disabled={!messageText.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default ChatPanel