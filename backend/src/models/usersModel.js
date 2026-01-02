// src/models/usersModel.js

const USERS_COLLECTION = "Users";

// Get Users collection
function getUsersCollection(db) {
  return db.collection(USERS_COLLECTION);
}

// Create indexes for Users
async function ensureUsersIndexes(db) {
  const users = getUsersCollection(db);

  // Unique email
  await users.createIndex({ email: 1 }, { unique: true });

  // Unique roll (only where roll exists)
  await users.createIndex({ roll: 1 }, { unique: true, sparse: true });
}

module.exports = {
  USERS_COLLECTION,
  getUsersCollection,
  ensureUsersIndexes,
};
