import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import YouTube from 'react-youtube';
import Peer from 'simple-peer';
import { motion } from 'framer-motion';

const SERVER_URL = 'http://localhost:3000';

export default function GroupRoom() {
  const { roomId } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const videoKey = params.get('videoKey');
  const isHost = params.get('host') === 'true';

  const username = isHost ? 'Host' : 'Guest-' + Math.floor(Math.random() * 1000);

  const playerRef = useRef(null);

  // mic/webRTC state
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const peersRef = useRef([]); // [{ peerID, peer }]
  const [remoteAudio, setRemoteAudio] = useState([]); // [{ peerID, stream }]

  // video/chat state
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState(1);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  // ───── AUDIO / WEBRTC STATE ─────
  // 1) Ask for mic permission immediately (for everyone), start muted
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // start muted
        stream.getAudioTracks().forEach((track) => (track.enabled = false));
        setLocalStream(stream);
      })
      .catch((err) => {
        console.error('Microphone access failed:', err);
      });
  }, []);

  // 2) Once we have localStream (even if track.enabled=false) we can join & handshake
  useEffect(() => {
    if (localStream === null) return;

    const s = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(s);

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      s.emit('join-room', { roomId, username, isHost });
    });

    s.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    s.on('room-joined', ({ roomId, isHost }) => {
      console.log(`Joined room ${roomId} as ${isHost ? 'host' : 'guest'}`);
    });

    s.on('participants', (cnt) => {
      console.log('Participants updated:', cnt);
      setParticipants(cnt);
    });

    s.on('chat-message', (msg) => {
      console.log('Received chat message:', msg);
      // Allow all messages to be displayed; server handles broadcasting
      setMessages((m) => [...m, msg]);
    });

    s.on('play', (data) => {
      if (!isHost && playerRef.current) {
        console.log('Play event received:', data);
        playerRef.current.seekTo(data.currentTime, true);
        playerRef.current.playVideo();
      }
    });

    s.on('pause', (data) => {
      if (!isHost && playerRef.current) {
        console.log('Pause event received:', data);
        playerRef.current.seekTo(data.currentTime, true);
        playerRef.current.pauseVideo();
      }
    });

    s.on('seek', (data) => {
      if (playerRef.current) {
        console.log('Seek event received:', data);
        playerRef.current.seekTo(data.currentTime, true);
      }
    });

    // Helper to create a new simple-peer
    function createPeer(userId, initiator) {
      const peer = new Peer({
        initiator,
        trickle: false,
        stream: localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });
      peer.on('signal', (sig) => {
        console.log(`Sending signal to ${userId}`);
        s.emit('signal', { to: userId, signal: sig });
      });
      peer.on('stream', (stream) => {
        console.log(`Received stream from ${userId}`);
        setRemoteAudio((list) => {
          if (list.find((x) => x.peerID === userId)) return list;
          return [...list, { peerID: userId, stream }];
        });
      });
      peer.on('error', (err) => console.error('Peer error:', err));
      peersRef.current.push({ peerID: userId, peer });
    }

    s.on('all-users', ({ users }) => {
      console.log('Existing users:', users);
      users.forEach((u) => createPeer(u, true));
    });

    s.on('user-joined', ({ userId }) => {
      console.log('User joined:', userId);
      createPeer(userId, false);
    });

    s.on('signal', ({ from, signal }) => {
      console.log(`Received signal from ${from}`);
      const item = peersRef.current.find((x) => x.peerID === from);
      if (item) {
        item.peer.signal(signal);
      }
    });

    return () => {
      console.log('Cleaning up socket and peers');
      s.off('connect');
      s.off('connect_error');
      s.off('room-joined');
      s.off('participants');
      s.off('chat-message');
      s.off('play');
      s.off('pause');
      s.off('seek');
      s.off('all-users');
      s.off('user-joined');
      s.off('signal');
      s.disconnect();
      peersRef.current.forEach((p) => p.peer.destroy());
      peersRef.current = [];
    };
  }, [localStream, roomId, username, isHost]);

  // ────── VIDEO CONTROLS (host only) ──────
  const handlePlay = (e) => {
    if (socket) {
      console.log('Emitting play event');
      socket.emit('play', { roomId, currentTime: e.target.getCurrentTime() });
    }
  };

  const handlePause = (e) => {
    if (socket) {
      console.log('Emitting pause event');
      socket.emit('pause', { roomId, currentTime: e.target.getCurrentTime() });
    }
  };

  const handleSeek = (e) => {
    if (socket) {
      console.log('Emitting seek event');
      socket.emit('seek', { roomId, currentTime: e.target.getCurrentTime() });
    }
  };

  // ────── CHAT ──────
  const sendChat = () => {
    if (!newMsg.trim() || !socket) return;
    console.log('Sending chat message:', newMsg);
    socket.emit('chat-message', { roomId, author: username, message: newMsg });
    setNewMsg('');
  };

  // ───── MIC TOGGLE ─────
  const toggleMic = () => {
    if (!localStream) return;
    const on = !micOn;
    localStream.getAudioTracks().forEach((t) => (t.enabled = on));
    setMicOn(on);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col md:flex-row h-screen bg-gray-900 text-white"
    >
      {/* Video area */}
      <div className="flex flex-col md:w-2/3 flex-1">
        <header className="p-4 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
          <span>
            Room: <b>{roomId}</b>
          </span>
          <span>Participants: {participants}</span>
          <button
            className="px-2 py-1 border rounded border-white/50 hover:bg-white/10 transition-colors"
            onClick={() => navigator.clipboard.writeText(roomId)}
          >
            Copy ID
          </button>
        </header>
        <div className="flex-1 bg-black relative overflow-hidden">
          <YouTube
            videoId={videoKey}
            className="w-full h-full"
            opts={{
              playerVars: {
                autoplay: 0,
                controls: isHost ? 1 : 0,
                disablekb: isHost ? 0 : 1,
                enablejsapi: 1,
              },
            }}
            onReady={(e) => (playerRef.current = e.target)}
            onStateChange={(e) => {
              if (!isHost) return;
              if (e.data === window.YT.PlayerState.PLAYING) handlePlay(e);
              if (e.data === window.YT.PlayerState.PAUSED) handlePause(e);
            }}
            onPlaybackRateChange={handleSeek}
            onPlaybackQualityChange={handleSeek}
          />
          {!isHost && <div className="absolute inset-0 z-10 bg-transparent" />}
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="w-full md:w-1/3 flex flex-col border-l border-gray-700 bg-gray-800">
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-track-gray-700 scrollbar-thumb-indigo-500 scrollbar-thin">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="px-3 py-2 bg-gray-700 rounded-lg"
            >
              <span className="font-semibold text-indigo-300">{m.author}</span>: {m.message}
            </motion.div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-700 flex space-x-2">
          <input
            className="flex-1 border-2 border-gray-600 bg-gray-900 p-2 rounded focus:border-indigo-500 focus:outline-none transition-colors"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message…"
            onKeyPress={(e) => {
              if (e.key === 'Enter') sendChat();
            }}
          />
          <motion.button
            onClick={sendChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-all"
          >
            Send
          </motion.button>
        </div>
      </div>

      {/* Mute/Unmute button */}
      <motion.button
        onClick={toggleMic}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          absolute bottom-4 left-1/2 transform -translate-x-1/2
          px-4 py-2 rounded text-white transition-colors
          ${micOn ? 'bg-red-600' : 'bg-green-600'}
        `}
      >
        {micOn ? 'Mute Mic' : 'Unmute Mic'}
      </motion.button>

      {/* Render peer audio */}
      <div className="fixed bottom-0 left-0 w-0 h-0 overflow-hidden">
        {remoteAudio.map(({ peerID, stream }) => (
          <audio
            key={peerID}
            autoPlay
            ref={(el) => {
              if (el) el.srcObject = stream;
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}