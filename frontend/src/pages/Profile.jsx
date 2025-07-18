
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { IoPerson, IoBookmark, IoHeart, IoTime, IoLogOut, IoCog, IoHelpCircle } from 'react-icons/io5';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const { user, logout, updateProfile, isPremium, upgradeToPremium, updateEmail, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalHours: 0,
    favoriteGenre: 'Action'
  });
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch history
      const { data: historyData } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id);

      // Fetch watchlist
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id);

      // Fetch liked movies
      const { data: likedData } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id);

      setHistory(historyData || []);
      setWatchlist(watchlistData || []);
      setLikedMovies(likedData || []);

      // Calculate stats
      setStats({
        totalWatched: historyData?.length || 0,
        totalHours: Math.floor((historyData?.length || 0) * 1.5),
        favoriteGenre: calculateFavoriteGenre(likedData || [])
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFavoriteGenre = (likedMovies) => {
    // Implement your genre calculation logic here
    const genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror'];
    return genres[Math.floor(Math.random() * genres.length)];
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ name: editData.name });
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      await updateEmail(editData.email);
    } catch (error) {
      console.error('Email update error:', error);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (editData.newPassword !== editData.confirmPassword) {
        throw new Error("Passwords don't match");
      }
      await updatePassword(editData.newPassword);
    } catch (error) {
      console.error('Password update error:', error);
    }
  };

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-300 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white text-4xl font-bold">
              {user.user_metadata?.name?.charAt(0) || user.email.charAt(0)}
            </div>
            {isPremium && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-2">
                <FaCrown className="text-dark-900 text-sm" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{user.user_metadata?.name || 'User'}</h1>
            <p className="text-gray-400 mb-4">{user.email}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-dark-400 rounded-xl p-4 sticky top-24">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'dashboard' ? 'bg-dark-300 text-primary-400' : 'hover:bg-dark-200'
                  }`}
                >
                  <IoPerson />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'history' ? 'bg-dark-300 text-primary-400' : 'hover:bg-dark-200'
                  }`}
                >
                  <IoTime />
                  <span>Watch History</span>
                  <span className="ml-auto bg-dark-100 text-xs px-2 py-1 rounded-full">
                    {history.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('watchlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'watchlist' ? 'bg-dark-300 text-primary-400' : 'hover:bg-dark-200'
                  }`}
                >
                  <IoBookmark />
                  <span>Watchlist</span>
                  <span className="ml-auto bg-dark-100 text-xs px-2 py-1 rounded-full">
                    {watchlist.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'liked' ? 'bg-dark-300 text-primary-400' : 'hover:bg-dark-200'
                  }`}
                >
                  <IoHeart />
                  <span>Liked Trailers</span>
                  <span className="ml-auto bg-dark-100 text-xs px-2 py-1 rounded-full">
                    {likedMovies.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-dark-300 text-primary-400' : 'hover:bg-dark-200'
                  }`}
                >
                  <IoCog />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-4"
                >
                  <IoLogOut />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-dark-400 rounded-xl p-6"
            >
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-dark-500 to-dark-600 p-4 rounded-lg">
                      <h3 className="text-gray-400 text-sm mb-2">Trailers Watched</h3>
                      <p className="text-3xl font-bold">{stats.totalWatched}</p>
                    </div>
                    <div className="bg-gradient-to-br from-dark-500 to-dark-600 p-4 rounded-lg">
                      <h3 className="text-gray-400 text-sm mb-2">Hours Watched</h3>
                      <p className="text-3xl font-bold">{stats.totalHours}</p>
                    </div>
                    <div className="bg-gradient-to-br from-dark-500 to-dark-600 p-4 rounded-lg">
                      <h3 className="text-gray-400 text-sm mb-2">Favorite Genre</h3>
                      <p className="text-3xl font-bold">{stats.favoriteGenre}</p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {history.slice(0, 5).map((movie, index) => (
                        <div key={index} className="flex items-center p-3 bg-dark-300 rounded-lg">
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster}`}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded mr-4"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/92x138?text=No+Image';
                            }}
                          />
                          <div className="flex-grow">
                            <h4 className="font-medium">{movie.title}</h4>
                            <p className="text-sm text-gray-400">
                              Watched {index === 0 ? 'today' : `${index + 1} days ago`}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/player/${movie.id}`)}
                            className="text-primary-400 hover:text-primary-300 text-sm"
                          >
                            Watch Again
                          </button>
                        </div>
                      ))}
                      {history.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-400 mb-4">No recent activity</p>
                          <button
                            onClick={() => navigate('/explore')}
                            className="btn btn-primary"
                          >
                            Explore Trailers
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Recommended For You</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, index) => (
                        <div
                          key={index}
                          className="aspect-[2/3] bg-dark-300 rounded-lg flex items-center justify-center text-gray-400"
                        >
                          Coming Soon
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Watch History Tab */}
              {activeTab === 'history' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Watch History</h2>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Clear All History
                      </button>
                    )}
                  </div>
                  
                  {history.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {history.map((movie) => (
                        <div
                          key={movie.id}
                          className="relative group overflow-hidden rounded-lg"
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                            alt={movie.title}
                            className="w-full h-full object-cover aspect-[2/3]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-500/90 via-dark-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <h3 className="text-white font-medium text-sm line-clamp-2">{movie.title}</h3>
                            <button
                              onClick={() => navigate(`/player/${movie.id}`)}
                              className="mt-2 btn btn-primary btn-sm"
                            >
                              Watch Again
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-dark-300 rounded-full flex items-center justify-center text-gray-500">
                        <IoTime size={24} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Watch History</h3>
                      <p className="text-gray-400 mb-4">Trailers you watch will appear here</p>
                      <button
                        onClick={() => navigate('/explore')}
                        className="btn btn-primary"
                      >
                        Browse Trailers
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Watchlist Tab */}
              {activeTab === 'watchlist' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Your Watchlist</h2>
                  
                  {watchlist.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {watchlist.map((movie) => (
                        <div
                          key={movie.id}
                          className="relative group overflow-hidden rounded-lg"
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                            alt={movie.title}
                            className="w-full h-full object-cover aspect-[2/3]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-500/90 via-dark-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <h3 className="text-white font-medium text-sm line-clamp-2">{movie.title}</h3>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => navigate(`/player/${movie.id}`)}
                                className="flex-1 btn btn-primary btn-sm"
                              >
                                Watch
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-dark-300 rounded-full flex items-center justify-center text-gray-500">
                        <IoBookmark size={24} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Your Watchlist is Empty</h3>
                      <p className="text-gray-400 mb-4">Add trailers to your watchlist to keep track of what you want to watch</p>
                      <button
                        onClick={() => navigate('/explore')}
                        className="btn btn-primary"
                      >
                        Browse Trailers
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Liked Movies Tab */}
              {activeTab === 'liked' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Liked Trailers</h2>
                  
                  {likedMovies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {likedMovies.map((movie) => (
                        <div
                          key={movie.id}
                          className="relative group overflow-hidden rounded-lg"
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                            alt={movie.title}
                            className="w-full h-full object-cover aspect-[2/3]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-500/90 via-dark-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <h3 className="text-white font-medium text-sm line-clamp-2">{movie.title}</h3>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => navigate(`/player/${movie.id}`)}
                                className="flex-1 btn btn-primary btn-sm"
                              >
                                Watch
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-dark-300 rounded-full flex items-center justify-center text-gray-500">
                        <IoHeart size={24} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Liked Trailers</h3>
                      <p className="text-gray-400 mb-4">Like trailers to build a collection of your favorites</p>
                      <button
                        onClick={() => navigate('/explore')}
                        className="btn btn-primary"
                      >
                        Browse Trailers
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
          
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-dark-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <IoPerson />
                Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={editData.name || user.user_metadata?.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-100 rounded-lg px-4 py-2"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={editData.email || user.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-100 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <button 
                onClick={handleUpdateProfile}
                className="btn btn-primary mt-4"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Password Update */}
            <div className="bg-dark-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                  <input
                    type="password"
                    value={editData.currentPassword}
                    onChange={(e) => setEditData({...editData, currentPassword: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-100 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">New Password</label>
                  <input
                    type="password"
                    value={editData.newPassword}
                    onChange={(e) => setEditData({...editData, newPassword: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-100 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={editData.confirmPassword}
                    onChange={(e) => setEditData({...editData, confirmPassword: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-100 rounded-lg px-4 py-2"
                  />
                </div>
                <button 
                  onClick={handleUpdatePassword}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

                    {/* Preferences */}
                    <div className="bg-dark-300 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <IoCog />
                        Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Dark Mode</h4>
                            <p className="text-sm text-gray-400">Enable dark theme</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-gray-400">Receive email updates</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Security */}
                    <div className="bg-dark-300 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        Security
                      </h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-4 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors">
                          <h4 className="font-medium">Change Password</h4>
                          <p className="text-sm text-gray-400">Update your account password</p>
                        </button>
                        <button className="w-full text-left p-4 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors">
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-400">Add an extra layer of security</p>
                        </button>
                      </div>
                    </div>

                    {/* Help */}
                    <div className="bg-dark-300 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <IoHelpCircle />
                        Help & Support
                      </h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-4 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors">
                          <h4 className="font-medium">Help Center</h4>
                          <p className="text-sm text-gray-400">Find answers to common questions</p>
                        </button>
                        <button className="w-full text-left p-4 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors">
                          <h4 className="font-medium">Contact Support</h4>
                          <p className="text-sm text-gray-400">Get in touch with our team</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;