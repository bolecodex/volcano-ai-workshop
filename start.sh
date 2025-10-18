#!/bin/bash

# 火山AI创作工坊 Web版 - 启动脚本

echo ""
echo "🌋 ========================================"
echo "   火山AI创作工坊 Web版 - 启动脚本"
echo "======================================== 🌋"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js"
    echo "请先安装 Node.js (>= 14.0.0)"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f 2 | cut -d'.' -f 1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ 错误: Node.js 版本过低 (当前: v$(node -v))"
    echo "需要 Node.js >= 14.0.0"
    echo "请更新 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo ""
    echo "✅ 依赖安装完成"
    echo ""
fi

# 提示用户选择启动模式
echo "请选择启动模式:"
echo "  1) 开发模式 (推荐) - 前端热重载，端口 3000"
echo "  2) 生产模式 - 构建并启动，端口 3001"
echo "  3) 仅启动前端 (端口 3000)"
echo "  4) 仅启动后端 (端口 3001)"
echo ""
read -p "请输入选项 (1-4, 默认: 1): " choice

case $choice in
    2)
        echo ""
        echo "🚀 启动生产模式..."
        echo ""
        npm run prod
        ;;
    3)
        echo ""
        echo "🚀 启动前端服务器..."
        echo ""
        npm start
        ;;
    4)
        echo ""
        echo "🚀 启动后端服务器..."
        echo ""
        npm run server
        ;;
    *)
        echo ""
        echo "🚀 启动开发模式..."
        echo ""
        echo "📌 提示："
        echo "  - 前端地址: http://localhost:3000"
        echo "  - 后端地址: http://localhost:3001"
        echo "  - 按 Ctrl+C 停止服务"
        echo ""
        sleep 2
        npm run dev
        ;;
esac

