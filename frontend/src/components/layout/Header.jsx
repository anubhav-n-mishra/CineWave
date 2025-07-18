import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import SearchBar from '../ui/SearchBar'
import { IoPerson, IoBookmark, IoLogOut, IoChevronDown, IoDiamond } from 'react-icons/io5'
import gsap from 'gsap'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const headerRef = useRef(null)
  
  // Navigation links - now handles protected routes
  const navLinks = [
    { name: 'Home', path: '/', protected: false },
    { name: 'Explore', path: '/explore', protected: false },
    { name: 'Premium Content', path: '/premium', protected: false, highlight: true },
    { name: 'Watchlist', path: '/watchlist', protected: true }
  ].filter(link => !link.protected || user)
  
  // Update header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
    }
  }, [])
  
  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }, [location])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-dark-300/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold title-gradient">
            CineWave
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors hover:text-primary-400 ${
                  link.highlight ? 'flex items-center gap-1' : ''
                } ${
                  location.pathname === link.path 
                    ? 'text-primary-500' 
                    : 'text-white'
                }`}
              >
                {link.highlight && <IoDiamond className="text-yellow-400" />}
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Search and Profile */}
          <div className="flex items-center space-x-4">
            <SearchBar />
            
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-dark-200 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 group"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {user.user_metadata?.name?.charAt(0) || user.email.charAt(0)}
                  </div>
                  <IoChevronDown className={`text-gray-300 transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-dark-200 border border-dark-100"
                    >
                      <div className="px-4 py-3 border-b border-dark-100">
                        <p className="text-sm font-medium text-white truncate">
                          {user.user_metadata?.name || user.email}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-100"
                      >
                        <IoPerson className="mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/watchlist"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-100"
                      >
                        <IoBookmark className="mr-2" />
                        My Watchlist
                      </Link>
                      <Link
                        to="/premium"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-100"
                      >
                        <IoDiamond className="mr-2 text-yellow-400" />
                        Premium Content
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-100"
                      >
                        <IoLogOut className="mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn btn-ghost border border-white/20 hover:border-primary-400 hover:text-primary-400"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="block md:hidden p-2 text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-300 border-t border-dark-100"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md font-medium flex items-center ${
                      link.highlight ? 'gap-1' : ''
                    } ${
                      location.pathname === link.path 
                        ? 'bg-primary-600/20 text-primary-400' 
                        : 'hover:bg-dark-200'
                    }`}
                  >
                    {link.highlight && <IoDiamond className="text-yellow-400" />}
                    {link.name}
                  </Link>
                ))}
                
                {!user && (
                  <div className="flex space-x-3 pt-2">
                    <Link
                      to="/login"
                      className="btn btn-ghost border border-white/20 flex-1 text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="btn btn-primary flex-1 text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header