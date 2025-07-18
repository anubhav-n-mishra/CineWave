import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';

const PremiumBadge = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-sm px-2 py-1',
    large: 'text-base px-3 py-1.5'
  };

  return (
    <motion.div
      className={`premium-badge flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-semibold rounded-md ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <FaCrown className="text-yellow-100" />
      <span>Premium</span>
    </motion.div>
  );
};

export default PremiumBadge;