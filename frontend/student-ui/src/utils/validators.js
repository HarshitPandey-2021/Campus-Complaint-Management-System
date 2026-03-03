// src/utils/validators.js
export const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const PASSWORD_HINT =
  "At least 8 characters with 1 uppercase, 1 lowercase, and 1 special character.";

export const PASSWORD_EXAMPLE = "Example: Campus@2026";

export const validatePassword = (password) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$/.test(password || "");

export const validateComplaint = (data) => {
  if (!data.title || !data.description) return "Title and description required.";
  if (!data.category) return "Please select a category.";
  return null;
};
