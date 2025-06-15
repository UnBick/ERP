const setHeaders = (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  next();
};

module.exports = setHeaders;
