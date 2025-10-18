#!/bin/bash

echo "🌋 启动火山AI创作工坊 Web版..."
echo ""

# 设置环境变量
export HOST=0.0.0.0
export PORT=3000
export BROWSER=none

# 停止旧进程
echo "📦 清理旧进程..."
killall -9 node 2>/dev/null
sleep 2

# 启动后端
echo "🚀 启动后端服务器 (端口 3001)..."
node server/index.js &
BACKEND_PID=$!
sleep 3

# 测试后端
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 后端启动成功"
else
    echo "❌ 后端启动失败"
    exit 1
fi

# 启动前端
echo "🚀 启动前端服务器 (端口 3000)..."
npm start &
FRONTEND_PID=$!

echo ""
echo "⏳ 等待前端编译..."
sleep 20

# 测试前端
if nc -z localhost 3000 2>/dev/null; then
    echo "✅ 前端启动成功"
    echo ""
    echo "🌐 访问地址:"
    echo "   http://localhost:3000"
    echo "   http://localhost:3001/api/health (后端)"
    echo ""
    
    # 打开浏览器
    sleep 2
    open http://localhost:3000
    
    echo "✨ 应用已启动！"
    echo ""
    echo "按 Ctrl+C 停止服务"
    
    # 等待用户中断
    wait
else
    echo "⚠️ 前端端口未监听，但可能仍可通过浏览器访问"
    echo "   请在浏览器中打开: http://localhost:3000"
    echo ""
fi

