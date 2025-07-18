import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { motion } from 'framer-motion';

export default function GroupLanding() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const videoKey = params.get('videoKey');

  const [joinId, setJoinId] = useState('');

  const handleCreate = () => {
    const roomId = nanoid(6);
    navigate(`/group/${roomId}?videoKey=${videoKey}&host=true`);
  };

  const handleJoin = () => {
    if (!joinId.trim()) return;
    navigate(`/group/${joinId}?videoKey=${videoKey}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center space-y-8
                 bg-gradient-to-br from-purple-600 to-indigo-700 p-4"
    >
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
        Group Watch
      </h1>

      <motion.button
        onClick={handleCreate}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-4 bg-white text-indigo-700 font-semibold rounded-lg shadow-lg
                   uppercase tracking-wide transition-shadow"
      >
        Create Room
      </motion.button>

      <div className="flex w-full max-w-md space-x-3">
        <input
          type="text"
          value={joinId}
          onChange={e => setJoinId(e.target.value)}
          placeholder="Enter Room ID"
          className="flex-1 px-4 py-3 rounded-lg border-2 border-white/50
                     focus:border-white focus:outline-none bg-white/20 text-white placeholder-white"
        />
        <motion.button
          onClick={handleJoin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-lg
                     uppercase tracking-wide transition-shadow"
        >
          Join
        </motion.button>
      </div>
    </motion.div>
  );
} 