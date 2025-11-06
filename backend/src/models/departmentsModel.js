// src/models/departmentModel.js

class Department {
  constructor({ name, contactEmail, currentLoad }) {
    this.name = name;
    this.contactEmail = contactEmail;
    this.currentLoad = currentLoad || 0;
  }

  static fromDb(document) {
    return new Department({
      name: document.name,
      contactEmail: document.contactEmail,
      currentLoad: document.currentLoad
    });
  }
}

module.exports = Department;
