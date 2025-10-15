#!/usr/bin/env node

/**
 * AI 图片生成器桌面应用启动脚本
 * 
 * 这个脚本会：
 * 1. 检查是否已经构建了 React 应用
 * 2. 如果没有构建，自动执行构建
 * 3. 启动 Electron 桌面应用
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 AI 图片生成器桌面应用启动器');
console.log('=====================================');

// 检查 build 目录是否存在
const buildPath = path.join(__dirname, 'build');
const buildExists = fs.existsSync(buildPath);

if (!buildExists) {
  console.log('📦 未找到构建文件，正在构建 React 应用...');
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ React 应用构建完成');
      startElectronApp();
    } else {
      console.error('❌ React 应用构建失败');
      process.exit(1);
    }
  });
  
  buildProcess.on('error', (err) => {
    console.error('❌ 构建过程出错:', err);
    process.exit(1);
  });
} else {
  console.log('📦 找到现有构建文件，直接启动应用');
  startElectronApp();
}

function startElectronApp() {
  console.log('🖥️  正在启动 Electron 桌面应用...');
  
  // 使用 npx electron . 来启动应用（推荐方式）
  const electronProcess = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  electronProcess.on('close', (code) => {
    if (code === 0) {
      console.log('🏁 应用正常关闭');
    } else {
      console.log(`🏁 应用已关闭 (退出码: ${code})`);
    }
  });
  
  electronProcess.on('error', (err) => {
    console.error('❌ Electron 启动失败:', err);
    console.log('💡 请确保已安装 Electron: npm install electron');
    console.log('💡 或者尝试: npm run desktop-quick');
    process.exit(1);
  });
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭应用...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 正在关闭应用...');
  process.exit(0);
});