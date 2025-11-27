const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

async function createUser(req, res) {
  try {
    const db = req.app.locals.db;
    const { name, email, role, password, roll } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    const existingUser = await db.collection('Users').findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = {
      name, email, role, ...(roll && { roll }),
      password: hashedPassword, createdAt: new Date(), updatedAt: new Date()
    };
    const result = await db.collection('Users').insertOne(newUser);
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    res.status(201).json({
      message: 'User registered successfully',
      user: { _id: result.insertedId, name, email, role, ...(roll && { roll }) },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  try {
    const db = req.app.locals.db;
    const user = await db.collection('Users').findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    const { password: _, ...safeUser } = user;
    res.status(200).json({ message: 'Login successful', user: safeUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { createUser, loginUser };
