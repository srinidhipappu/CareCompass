const bcrypt = require('bcrypt');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json(errorResponse('Missing fields'));
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json(errorResponse('Email already in use'));
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, email, passwordHash: hash });
    const out = { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
    res.json(successResponse(out, 'User created'));
  } catch (err) {
    res.status(500).json(errorResponse('Registration failed'));
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json(errorResponse('Missing fields'));
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json(errorResponse('Invalid credentials'));
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json(errorResponse('Invalid credentials'));
    const out = { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
    res.json(successResponse(out, 'Login successful'));
  } catch (err) {
    res.status(500).json(errorResponse('Login failed'));
  }
};
