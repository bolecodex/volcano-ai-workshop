#!/bin/bash

echo "🚀 启动Electron桌面应用..."
echo ""
echo "📋 启动步骤："
echo "1. 构建React应用"
echo "2. 启动Electron桌面应用"
echo ""

# 构建React应用
echo "🔨 正在构建React应用..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ React应用构建完成"
    echo ""
    
    # 启动Electron应用
    echo "🖥️ 正在启动Electron桌面应用..."
    npx electron .
else
    echo "❌ React应用构建失败"
    exit 1
fi
