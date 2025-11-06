// src/models/usersModel.js
const bcrypt = require('bcrypt');

class User {
  constructor({ name, email, password, role, createdAt, updatedAt }) {
    if (!email || !email.includes('@')) throw new Error('Invalid email');
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role || 'user';
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  async hashPassword() {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  static fromDb(document) {
    return new User({
      name: document.name,
      email: document.email,
      password: document.password,
      role: document.role,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}

module.exports = User;
