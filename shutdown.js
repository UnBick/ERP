const { exec } = require('child_process');

console.log('Shutting down development servers...');

// Find and kill processes on ports 3000 and 5000
const commands = {
  win32: {
    find: 'netstat -ano | findstr :PORT',
    kill: 'taskkill /PID PID /F'
  },
  linux: {
    find: 'lsof -i :PORT -t',
    kill: 'kill -9 PID'
  }
};

const ports = [3000, 5000];
const platform = process.platform;
const cmd = commands[platform === 'win32' ? 'win32' : 'linux'];

ports.forEach(port => {
  const findCommand = cmd.find.replace('PORT', port);
  
  exec(findCommand, (error, stdout) => {
    if (error) {
      console.log(`No process found on port ${port}`);
      return;
    }

    // Extract PID based on platform
    let pid;
    if (platform === 'win32') {
      pid = stdout.split('\r\n')[0].split(' ').filter(Boolean).pop();
    } else {
      pid = stdout.trim();
    }

    if (pid) {
      const killCommand = cmd.kill.replace('PID', pid);
      exec(killCommand, (error) => {
        if (error) {
          console.log(`Error killing process on port ${port}`);
        } else {
          console.log(`Successfully killed process on port ${port}`);
        }
      });
    }
  });
});
