import React, { useState } from "react";
import Button from "../common/button";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.name && formData.email && formData.password) {
      alert("Account created successfully!");
      navigate("/login");
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-8 mt-10">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
        Create New Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your university email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magenta-600 focus:outline-none"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" label="Sign Up" color="secondary" />
        </div>
      </form>

      <p className="text-center text-sm mt-6">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-magenta-600 font-medium cursor-pointer hover:underline"
        >
          Login here
        </span>
      </p>
    </div>
  );
};

export default SignupForm;
