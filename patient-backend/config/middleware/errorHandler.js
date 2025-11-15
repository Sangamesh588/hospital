// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'development' ? (err.message || 'Server error') : 'Server error';
  res.status(status).json({ message });
};
