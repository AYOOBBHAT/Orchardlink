const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
}

function userPayload(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'password is required (min 6 characters)' });
    }

    let nextRole = 'adopter';
    if (role !== undefined && role !== null && role !== '') {
      if (!['farmer', 'adopter'].includes(role)) {
        return res.status(400).json({ message: "role must be 'farmer' or 'adopter'" });
      }
      nextRole = role;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: nextRole,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: userPayload(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }
    if (err.message === 'JWT_SECRET is not configured') {
      return res.status(500).json({ message: 'Server auth configuration error' });
    }
    res.status(500).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'email is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'password is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.status(200).json({
      token,
      user: userPayload(user),
    });
  } catch (err) {
    if (err.message === 'JWT_SECRET is not configured') {
      return res.status(500).json({ message: 'Server auth configuration error' });
    }
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  register,
  login,
};
