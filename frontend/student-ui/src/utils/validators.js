// src/utils/validators.js
export const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const validatePassword = (password) => password.length >= 6;

export const validateComplaint = (data) => {
  if (!data.title || !data.description) return "Title and description required.";
  if (!data.category) return "Please select a category.";
  return null;
};
