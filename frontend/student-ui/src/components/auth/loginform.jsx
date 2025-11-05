import React, { useState } from "react";
import Button from "../common/button";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate login success for now
    if (formData.email && formData.password) {
      alert("Login successful!");
      navigate("/dashboard");
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-8 mt-10">
      <h2 className="text-2xl font-semibold text-teal-700 mb-6 text-center">
        Student / Faculty Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your university email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" label="Login" color="primary" />
        </div>
      </form>

      <p className="text-center text-sm mt-6">
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/signup")}
          className="text-magenta-600 font-medium cursor-pointer hover:underline"
        >
          Register here
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
