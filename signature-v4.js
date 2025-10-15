const crypto = require('crypto');

/**
 * 火山引擎 Signature V4 签名生成器
 * 参考文档: https://www.volcengine.com/docs/6348/69824
 */
class SignatureV4 {
  constructor(accessKeyId, secretAccessKey, options = {}) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    // 允许自定义服务类型和区域
    // cv: 视觉服务, tos: 对象存储
    this.service = options.service || 'cv';
    this.region = options.region || 'cn-north-1';
  }

  /**
   * 生成签名的主函数
   */
  sign(method, url, headers, body) {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const path = urlObj.pathname || '/';
    const queryString = urlObj.search.substring(1); // 去除 '?'
    
    // 获取当前时间
    const now = new Date();
    const timestamp = this.getTimestamp(now);
    const dateStamp = this.getDateStamp(now);
    
    // 根据服务类型决定算法名称
    // TOS使用AWS4-HMAC-SHA256，视觉服务使用HMAC-SHA256
    const algorithm = this.service === 'tos' ? 'AWS4-HMAC-SHA256' : 'HMAC-SHA256';
    
    // 确保headers包含必要的字段
    const signHeaders = {
      ...headers,
      'Host': host,
      'X-Date': timestamp
    };
    
    // 如果有body，添加Content-Type
    if (body && !signHeaders['Content-Type']) {
      signHeaders['Content-Type'] = 'application/json';
    }
    
    // Step 1: 创建规范请求
    const canonicalRequest = this.createCanonicalRequest(
      method,
      path,
      queryString,
      signHeaders,
      body
    );
    
    console.log('Canonical Request:', canonicalRequest);
    
    // Step 2: 创建待签名字符串
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/request`;
    const stringToSign = this.createStringToSign(
      algorithm,
      timestamp,
      credentialScope,
      canonicalRequest
    );
    
    console.log('String to Sign:', stringToSign);
    
    // Step 3: 计算签名
    const signature = this.calculateSignature(
      dateStamp,
      stringToSign
    );
    
    console.log('Signature:', signature);
    
    // Step 4: 构建Authorization头
    const signedHeaders = this.getSignedHeaders(signHeaders);
    const authorization = `${algorithm} Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    // 返回签名后的headers
    return {
      ...signHeaders,
      'Authorization': authorization
    };
  }

  /**
   * 创建规范请求
   */
  createCanonicalRequest(method, path, queryString, headers, body) {
    // 1. HTTP方法
    const httpMethod = method.toUpperCase();
    
    // 2. 规范URI
    const canonicalUri = this.getCanonicalUri(path);
    
    // 3. 规范查询字符串
    const canonicalQueryString = this.getCanonicalQueryString(queryString);
    
    // 4. 规范头部
    const canonicalHeaders = this.getCanonicalHeaders(headers);
    
    // 5. 已签名头部列表
    const signedHeaders = this.getSignedHeaders(headers);
    
    // 6. 请求体的哈希值
    const hashedPayload = this.hashPayload(body);
    
    // 组合规范请求
    return [
      httpMethod,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      hashedPayload
    ].join('\n');
  }

  /**
   * 创建待签名字符串
   */
  createStringToSign(algorithm, timestamp, credentialScope, canonicalRequest) {
    const hashedCanonicalRequest = this.sha256Hash(canonicalRequest);
    
    return [
      algorithm,
      timestamp,
      credentialScope,
      hashedCanonicalRequest
    ].join('\n');
  }

  /**
   * 计算签名
   */
  calculateSignature(dateStamp, stringToSign) {
    // 对于TOS（AWS S3兼容），密钥需要加上"AWS4"前缀
    const secretKey = this.service === 'tos' ? `AWS4${this.secretAccessKey}` : this.secretAccessKey;
    
    const kDate = this.hmacSha256(dateStamp, secretKey);
    const kRegion = this.hmacSha256(this.region, kDate);
    const kService = this.hmacSha256(this.service, kRegion);
    const kSigning = this.hmacSha256('request', kService);
    
    return this.hmacSha256Hex(stringToSign, kSigning);
  }

  /**
   * 获取规范URI
   */
  getCanonicalUri(path) {
    if (!path || path === '') return '/';
    // URI编码，但保留斜杠
    return encodeURI(path).replace(/%2F/g, '/');
  }

  /**
   * 获取规范查询字符串
   */
  getCanonicalQueryString(queryString) {
    if (!queryString) return '';
    
    // 解析查询参数
    const params = {};
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = value || '';
    });
    
    // 按键名排序并编码
    return Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * 获取规范头部
   */
  getCanonicalHeaders(headers) {
    const canonicalHeaders = {};
    
    // 转换为小写并排序
    Object.keys(headers).forEach(key => {
      const lowerKey = key.toLowerCase();
      // 去除前后空格，多个空格合并为一个
      const value = String(headers[key]).trim().replace(/\s+/g, ' ');
      canonicalHeaders[lowerKey] = value;
    });
    
    // 按键名排序并格式化
    return Object.keys(canonicalHeaders)
      .sort()
      .map(key => `${key}:${canonicalHeaders[key]}`)
      .join('\n') + '\n';
  }

  /**
   * 获取已签名头部列表
   */
  getSignedHeaders(headers) {
    return Object.keys(headers)
      .map(key => key.toLowerCase())
      .sort()
      .join(';');
  }

  /**
   * 计算请求体哈希
   */
  hashPayload(body) {
    if (!body) return this.sha256Hash('');
    
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    return this.sha256Hash(payload);
  }

  /**
   * SHA256哈希
   */
  sha256Hash(data) {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  /**
   * HMAC-SHA256 (返回Buffer)
   */
  hmacSha256(data, key) {
    return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
  }

  /**
   * HMAC-SHA256 (返回十六进制字符串)
   */
  hmacSha256Hex(data, key) {
    return crypto.createHmac('sha256', key).update(data, 'utf8').digest('hex');
  }

  /**
   * 获取ISO 8601时间戳
   */
  getTimestamp(date) {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  }

  /**
   * 获取日期戳 (YYYYMMDD)
   */
  getDateStamp(date) {
    return date.toISOString().substring(0, 10).replace(/-/g, '');
  }
}

module.exports = SignatureV4;

