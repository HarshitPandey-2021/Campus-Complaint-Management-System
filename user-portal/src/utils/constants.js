// src/utils/constants.js

export const CATEGORIES = [
  'Fan',
  'Light',
  'Projector',
  'Furniture',
  'Washroom',
  'Water',
  'Internet',
  'Other'
];

export const PRIORITIES = ['Low', 'Medium', 'High'];

export const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

export const STATUS_COLORS = {
  'Pending': 'blue',
  'In Progress': 'yellow',
  'Resolved': 'green',
  'Rejected': 'red'
};

export const PRIORITY_COLORS = {
  'Low': 'green',
  'Medium': 'yellow',
  'High': 'red'
};

export const MAX_IMAGES = 3;
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_PDF_TYPE = 'application/pdf';