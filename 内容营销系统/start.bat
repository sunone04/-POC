@echo off
chcp 65001 >nul 2>&1
title 亚细亚内容营销系统 - 启动器
color 0A

echo.
echo  ==========================================
echo    亚细亚内容营销系统 - 一键启动
echo  ==========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [错误] 未检测到 Node.js，请先安装 Node.js 18+
    echo  下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo  [信息] Node.js 版本:
node -v
echo.

:: 安装后端依赖
if not exist "server\node_modules" (
    echo  [安装] 正在安装后端依赖...
    cd server
    call npm install
    cd ..
    echo.
)

:: 安装前端依赖
if not exist "node_modules" (
    echo  [安装] 正在安装前端依赖...
    call npm install
    echo.
)

:: 检查 .env 配置
if not exist "server\.env" (
    echo  [配置] 创建默认配置文件...
    (
        echo # 亚细亚内容营销系统 - 配置文件
        echo # 请根据实际情况修改以下配置
        echo.
        echo # 服务端口
        echo PORT=3001
        echo.
        echo # AI模型配置（支持OpenAI兼容接口，如通义千问Qwen、DeepSeek等）
        echo AI_API_BASE=https://dashscope.aliyuncs.com/compatible-mode/v1
        echo AI_API_KEY=your-api-key-here
        echo AI_MODEL=qwen-plus
        echo.
        echo # 图片生成模型（可选）
        echo IMAGE_MODEL=wanx-v1
        echo.
        echo # 数据库
        echo DB_PATH=./db/yaxiya.db
    ) > server\.env
    echo.
    echo  ==========================================
    echo   重要：请编辑 server\.env 文件，填入AI API Key
    echo   推荐使用通义千问Qwen:
    echo   https://dashscope.console.aliyun.com/
    echo  ==========================================
    echo.
    notepad server\.env
)

echo  [启动] 正在启动后端服务...
start "亚细亚后端服务 (端口3001)" cmd /c "cd /d %~dp0server && node index.js"
echo  [成功] 后端服务已启动
echo.

echo  [启动] 正在启动前端服务...
start "亚细亚前端服务 (端口3000)" cmd /c "cd /d %~dp0 && npx vite --host"
echo  [成功] 前端服务已启动
echo.

timeout /t 3 >nul
echo  ==========================================
echo   系统已启动！请在浏览器中访问：
echo   http://localhost:3000
echo.
echo   后端API地址: http://localhost:3001/api
echo   API健康检查: http://localhost:3001/api/health
echo.
echo   关闭此窗口不会停止服务
echo   需停止请关闭对应的命令行窗口
echo  ==========================================
echo.
pause
