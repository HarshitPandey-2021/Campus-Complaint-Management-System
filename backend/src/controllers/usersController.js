// src/controllers/usersController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

// 🚫 Removed getAllUsers (Admin cannot view user details)

// 🔍 Get user by ID (User-only access)
async function getUserById(req, res) {
  try {
    const db = req.app.locals.db;
    const userId = req.params.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // ✅ Allow user to view only their own profile
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
    }

    const user = await db.collection('Users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Hide password
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// 🧾 Register new user
async function createUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = req.app.locals.db;
    const { name, email, role, password } = req.body;

    // Check for duplicate email
    const existingUser = await db.collection('Users').findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      name,
      email,
      role,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('Users').insertOne(newUser);

    // Create JWT
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { _id: result.insertedId, name, email, role },
      token
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// 🔐 Login user
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

    // Remove password before sending user info
    const { password: _, ...safeUser } = user;
    res.status(200).json({ message: 'Login successful', user: safeUser, token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getUserById, createUser, loginUser };
