# 应用打包问题修复说明

## 问题描述

首次打包应用后运行时出现错误：

```
A JavaScript error occurred in the main process

Uncaught Exception:
Error: Cannot find module './signature-v4'
Require stack:
- .../app.asar/api-service.js
- .../app.asar/build/electron.js
```

## 问题原因

在 `package.json` 的打包配置中，`signature-v4.js` 文件没有被包含在打包文件列表中。

`api-service.js` 需要引用 `signature-v4.js` 来实现火山引擎 API 的签名认证，但该文件在打包时被遗漏了。

## 解决方案

### 修改 package.json

在 `build.files` 数组中添加 `signature-v4.js`：

```json
{
  "build": {
    "files": [
      "build/**/*",
      "desktop-app.js",
      "api-service.js",
      "signature-v4.js",        // ← 添加这一行
      "public/preload.js",
      "public/logo.svg",
      "node_modules/**/*"
    ]
  }
}
```

### 重新打包

```bash
npm run dist-mac
```

## 验证修复

打包完成后，运行应用程序：

```bash
open "/Applications/火山AI创作工坊.app"
```

应用应该正常启动，不再出现模块找不到的错误。

## 相关文件

- `signature-v4.js` - 火山引擎 Signature V4 签名实现
- `api-service.js` - API 服务层，依赖 signature-v4
- `package.json` - 打包配置

## 经验总结

### 打包清单检查

在打包 Electron 应用时，需要确保所有依赖的本地模块都包含在 `build.files` 中：

✅ **应包含的文件类型**：
- 主进程 JS 文件（desktop-app.js, api-service.js 等）
- 所有被主进程引用的本地模块（signature-v4.js）
- Preload 脚本（public/preload.js）
- 静态资源（logo.svg, icon.png 等）
- 构建后的前端代码（build/**/*）
- 依赖包（node_modules/**/*）

❌ **容易遗漏的文件**：
- 工具类模块（utils, helpers）
- 配置文件
- 自定义的 Node.js 模块

### 调试技巧

如果打包后出现模块找不到错误：

1. **查看错误堆栈**，确定缺少哪个模块
2. **检查 package.json 的 build.files**，确认该文件是否包含
3. **查看 .asar 包内容**（可选）：
   ```bash
   npm install -g asar
   asar list app.asar
   ```
4. **重新打包并测试**

### 最佳实践

1. **开发时测试打包**：不要等到最后才打包测试
2. **使用通配符**：如 `*.js` 包含所有 JS 文件（但要小心）
3. **记录依赖关系**：文档化主进程依赖的所有本地模块
4. **自动化测试**：编写脚本验证打包后的应用能正常启动

## 其他常见打包问题

### 1. Native 模块问题

```
Error: The module was compiled against a different Node.js version
```

**解决方案**：使用 electron-rebuild 重新编译原生模块

```bash
npm install --save-dev electron-rebuild
npx electron-rebuild
```

### 2. 环境变量问题

打包后环境变量可能不同，需要在代码中处理：

```javascript
const isDev = process.env.NODE_ENV === 'development' || 
              !app.isPackaged;
```

### 3. 路径问题

打包后使用 `__dirname` 可能指向 .asar 包内部，需要使用：

```javascript
const path = require('path');
const appPath = app.isPackaged
  ? path.dirname(app.getPath('exe'))
  : __dirname;
```

### 4. 文件读写问题

.asar 包内文件是只读的，需要写入的文件应放在用户目录：

```javascript
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');
```

## 参考资料

- [Electron Builder 文档](https://www.electron.build/)
- [Electron 打包指南](https://www.electronjs.org/docs/latest/tutorial/application-distribution)
- [ASAR 归档格式](https://github.com/electron/asar)

---

修复日期：2025-10-15  
修复版本：v1.0.0

