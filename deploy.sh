#!/bin/bash

# 部署脚本
# 用于快速部署生产版本

set -e  # 遇到错误立即退出

echo "🚀 开始部署 火山AI创作工坊..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 检查 Node.js
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 Node.js${NC}"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js 版本: $NODE_VERSION${NC}"

# 2. 检查依赖
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 安装依赖..."
    npm install
fi

# 3. 构建前端
echo ""
echo "🔨 构建前端..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 前端构建成功${NC}"
else
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi

# 4. 检查构建文件
if [ ! -f "build/index.html" ]; then
    echo -e "${RED}❌ 错误: 构建文件不存在${NC}"
    exit 1
fi

# 5. 显示构建统计
echo ""
echo "📊 构建统计:"
echo "   输出目录: build/"
BUILD_SIZE=$(du -sh build/ | awk '{print $1}')
echo "   总大小: $BUILD_SIZE"

# 6. 询问是否启动服务器
echo ""
read -p "是否启动生产服务器? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 启动生产服务器..."
    echo ""
    echo -e "${GREEN}访问地址: http://localhost:3001${NC}"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    
    # 启动服务器
    npm run prod
else
    echo ""
    echo "📝 手动启动服务器:"
    echo "   npm run prod"
    echo ""
    echo "或:"
    echo "   node server/index.js"
fi

echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"

