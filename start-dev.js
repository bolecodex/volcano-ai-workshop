const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development environment...');
console.log('📡 Backend server will run on http://localhost:3001');
console.log('🌐 Frontend server will run on http://localhost:3000');
console.log('');

// 启动后端服务器
const backend = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

// 等待一秒后启动前端服务器
setTimeout(() => {
  const frontend = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  // 处理进程退出
  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });
}, 1000);

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// 处理 Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development servers...');
  backend.kill();
  process.exit(0);
});
