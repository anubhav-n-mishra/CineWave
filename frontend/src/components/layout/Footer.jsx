import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Footer = () => {
  const year = new Date().getFullYear()
  const footerRef = useRef(null)
  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(footerRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 })
    }
  }, [])
  
  return (
    <footer ref={footerRef} className="bg-dark-400">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 title-gradient">CineWave</h3>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for movie and web series trailers. Discover, watch, and share the latest and greatest trailers with friends.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Watchlist
                </Link>
              </li>
              <li>
                <Link to="/groupwatch" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Group Watch
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://merchant.razorpay.com/policy/QuFgreHGybKfUP/shipping" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Shipping
                </a>
              </li>
              <li>
                <a href="https://merchant.razorpay.com/policy/QuFgreHGybKfUP/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a href="https://merchant.razorpay.com/policy/QuFgreHGybKfUP/refund" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Cancellation & Refunds
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/copyright" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Copyright
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB Logo"
                className="h-4 mt-2"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-dark-100 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {year} CineWave. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer