const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理图片生成API到火山方舟
  app.use(
    '/api/v3',
    createProxyMiddleware({
      target: 'https://ark.cn-beijing.volces.com',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying image API request to:', proxyReq.path);
        // Ensure proper headers are forwarded
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if (req.headers['content-type']) {
          proxyReq.setHeader('Content-Type', req.headers['content-type']);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Image API proxy response status:', proxyRes.statusCode);
        // Add CORS headers to the response
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      },
      onError: (err, req, res) => {
        console.error('Image API proxy error:', err);
        res.status(500).json({ error: 'Image API proxy error: ' + err.message });
      }
    })
  );

  // 代理视频生成API到本地服务器
  app.use(
    '/api/video',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying video API request to:', proxyReq.path);
        // Ensure proper headers are forwarded
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if (req.headers['content-type']) {
          proxyReq.setHeader('Content-Type', req.headers['content-type']);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Video API proxy response status:', proxyRes.statusCode);
        // Add CORS headers to the response
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      },
      onError: (err, req, res) => {
        console.error('Video API proxy error:', err);
        res.status(500).json({ error: 'Video API proxy error: ' + err.message });
      }
    })
  );

  // 代理健康检查和其他API到本地服务器
  app.use(
    '/api/health',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );
};
