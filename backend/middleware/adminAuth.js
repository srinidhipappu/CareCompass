module.exports = (req, res, next) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return res.status(500).json({ success: false, error: 'Admin secret not configured' });

  // Accept header 'x-admin-secret' or Authorization: Bearer <secret>
  const headerSecret = req.headers['x-admin-secret'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!headerSecret || headerSecret !== adminSecret) {
    return res.status(403).json({ success: false, error: 'Forbidden: invalid admin secret' });
  }
  next();
};
