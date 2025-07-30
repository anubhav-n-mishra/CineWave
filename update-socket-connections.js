// Script to update Socket.IO connections in frontend
// Run this after deployment to update all socket connections

const fs = require('fs');
const path = require('path');

// Files that likely contain socket connections
const filesToCheck = [
  'frontend/src/components/groupwatch/GroupWatchModal.jsx',
  'frontend/src/components/groupwatch/ChatPanel.jsx',
  'frontend/src/pages/GroupWatch.jsx',
  'frontend/src/pages/GroupRoom.jsx'
];

console.log('🔍 Checking for Socket.IO connections...');

filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains socket.io imports
    if (content.includes('socket.io-client') || content.includes('io(')) {
      console.log(`📁 Found socket connections in: ${filePath}`);
      
      // Update socket connection to use environment variable
      content = content.replace(
        /io\(['"]http:\/\/localhost:3000['"]\)/g,
        'io(import.meta.env.VITE_BACKEND_URL)'
      );
      
      content = content.replace(
        /io\(['"]http:\/\/localhost:3001['"]\)/g,
        'io(import.meta.env.VITE_BACKEND_URL)'
      );
      
      // Add import if not present
      if (content.includes('io(') && !content.includes('import { io }')) {
        content = content.replace(
          /import.*from.*['"]socket\.io-client['"]/,
          'import { io } from \'socket.io-client\''
        );
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  }
});

console.log('🎉 Socket connection update complete!');
console.log('📝 Remember to set VITE_BACKEND_URL in your environment variables'); 