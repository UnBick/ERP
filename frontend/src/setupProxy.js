const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const proxyConfig = {
    target: 'http://localhost:5000',
    changeOrigin: true,
    timeout: 120000, // Increased timeout
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Proxy error occurred' 
      }));
    }
  };

  app.use('/api', createProxyMiddleware({
    ...proxyConfig,
    pathRewrite: { '^/api': '/api' }
  }));

  app.use('/assets', createProxyMiddleware({
    ...proxyConfig,
    pathRewrite: { '^/assets': '/public/assets' }
  }));

  app.use('/uploads', createProxyMiddleware({
    ...proxyConfig,
    pathRewrite: { '^/uploads': '/uploads' }
  }));
};