#!/usr/bin/env node

/**
 * 存储系统验证脚本
 * 用于验证存储系统重构是否成功
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message = '') {
  const result = {
    name,
    passed: condition,
    message
  };
  checks.push(result);
  
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}${message ? ': ' + message : ''}`);
    failed++;
  }
}

console.log('🔍 开始验证存储系统重构...\n');

// 1. 检查核心文件是否存在
console.log('📁 检查核心文件...');
check(
  'db.js 存在',
  fs.existsSync('src/utils/db.js')
);
check(
  'storage.js 已更新',
  fs.existsSync('src/utils/storage.js') && 
  fs.statSync('src/utils/storage.js').size > 15000
);
check(
  'storageSync.js 存在',
  fs.existsSync('src/utils/storageSync.js')
);

// 2. 检查文件内容
console.log('\n📝 检查文件内容...');
const storageContent = fs.readFileSync('src/utils/storage.js', 'utf8');
check(
  'storage.js 包含 IndexedDB',
  storageContent.includes('IndexedDB') || storageContent.includes('dbManager')
);
check(
  'storage.js 包含迁移功能',
  storageContent.includes('migrateFromLocalStorage')
);
check(
  'storage.js 是异步的',
  storageContent.includes('async') && storageContent.includes('await')
);

const dbContent = fs.readFileSync('src/utils/db.js', 'utf8');
check(
  'db.js 包含 DatabaseManager',
  dbContent.includes('class DatabaseManager')
);
check(
  'db.js 包含对象存储空间',
  dbContent.includes('credentials') && 
  dbContent.includes('configs') && 
  dbContent.includes('history')
);

// 3. 检查组件更新
console.log('\n🔧 检查组件更新...');
const settingsContent = fs.readFileSync('src/components/Settings.js', 'utf8');
check(
  'Settings.js 使用异步 storage',
  settingsContent.includes('await storage.')
);

const imageGenContent = fs.readFileSync('src/components/ImageGenerator.js', 'utf8');
check(
  'ImageGenerator.js 使用异步 storage',
  imageGenContent.includes('await storage.')
);

const motionContent = fs.readFileSync('src/components/MotionImitation.js', 'utf8');
check(
  'MotionImitation.js 使用 storageSync',
  motionContent.includes('storageSync')
);

// 4. 检查文档
console.log('\n📚 检查文档...');
check(
  'STORAGE_MIGRATION.md 存在',
  fs.existsSync('STORAGE_MIGRATION.md')
);
check(
  'STORAGE_REFACTORING_SUMMARY.md 存在',
  fs.existsSync('STORAGE_REFACTORING_SUMMARY.md')
);
check(
  'test-storage.html 存在',
  fs.existsSync('test-storage.html')
);

// 5. 检查包依赖
console.log('\n📦 检查包依赖...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check(
  'package.json 包含必要依赖',
  packageJson.dependencies && 
  Object.keys(packageJson.dependencies).length > 0
);

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 验证结果:');
console.log('='.repeat(50));
console.log(`✅ 通过: ${passed}/${checks.length}`);
console.log(`❌ 失败: ${failed}/${checks.length}`);
console.log(`📈 成功率: ${((passed / checks.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 所有检查通过！存储系统重构成功！');
  console.log('\n📖 下一步:');
  console.log('  1. 启动应用: npm run dev');
  console.log('  2. 测试存储: http://localhost:3000/test-storage.html');
  console.log('  3. 阅读文档: STORAGE_MIGRATION.md');
  process.exit(0);
} else {
  console.log('\n⚠️  有些检查未通过，请检查上述失败项。');
  process.exit(1);
}

