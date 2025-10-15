# 动作模仿功能说明

## 功能状态
⚠️ **该功能当前处于开发中，暂时无法使用。**

## 问题说明

动作模仿功能使用的是火山引擎视觉服务API（`visual.volcengineapi.com`），该API使用**签名认证（Signature V4）**方式，而不是简单的Bearer Token认证。

### 认证差异

| API类型 | 端点 | 认证方式 |
|---------|------|----------|
| 图片生成 | `ark.cn-beijing.volces.com` | Bearer Token ✅ |
| 视频生成 | `ark.cn-beijing.volces.com` | Bearer Token ✅ |
| 动作模仿 | `visual.volcengineapi.com` | Signature V4 ❌ |

### 当前错误

当尝试使用Bearer Token访问视觉服务API时，会收到以下错误：
```
invalid json response body at https://visual.volcengineapi.com/?Action=CVSubmitTask&Version=2022-08-31 
reason: Unexpected token 'E', "Error when"... is not valid JSON
```

这表明API拒绝了请求，因为认证方式不正确。

## 解决方案

要使动作模仿功能正常工作，需要实现火山引擎的签名认证算法。

### 实现步骤

1. **获取AccessKey和SecretKey**
   - 在火山引擎控制台创建访问密钥
   - 获取AccessKeyId和SecretAccessKey

2. **实现签名算法**
   - 按照火山引擎Signature V4规范生成签名
   - 包括：
     - 创建规范请求
     - 创建待签名字符串
     - 计算签名
     - 添加签名到请求头

3. **更新API调用**
   - 在`api-service.js`中添加签名生成函数
   - 使用签名替代Bearer Token

### 参考文档

- [火山引擎签名机制 V4](https://www.volcengine.com/docs/6348/69824)
- [公共参数](https://www.volcengine.com/docs/6348/69825)
- [单图视频驱动API文档](docs/单图视频驱动.md)

## 临时解决方案

在签名认证功能开发完成之前，可以考虑：

1. **使用SDK**
   - 使用火山引擎官方提供的Node.js SDK
   - SDK内置了签名认证功能

2. **服务端代理**
   - 在服务器端实现签名认证
   - 客户端通过服务器代理调用API

3. **等待更新**
   - 等待开发者实现完整的签名认证功能

## 开发计划

- [ ] 实现Signature V4签名算法
- [ ] 添加AccessKey/SecretKey配置
- [ ] 测试动作模仿API调用
- [ ] 完善错误处理
- [ ] 添加使用文档

## 联系方式

如有问题或需要帮助，请联系开发团队。

---

**最后更新：** 2025-10-13
**版本：** v1.0.0
**状态：** 功能开发中

