// Admin middleware checks for a shared secret in `x-admin-secret` header
module.exports = (req, res, next) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return res.status(500).json({ success: false, error: 'Admin secret not configured' });
  const provided = req.headers['x-admin-secret'] || req.headers['admin-secret'];
  if (!provided || provided !== secret) return res.status(403).json({ success: false, error: 'Forbidden: invalid admin secret' });
  next();
};
