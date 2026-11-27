import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PASSWORD_EXAMPLE, PASSWORD_HINT, validatePassword } from "../../utils/validators";

export default function SignupForm() {
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    rollno: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(form.password)) {
      return setError(PASSWORD_HINT);
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    signup(form);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        name="name"
        placeholder="Full Name"
        className="p-3 border rounded"
        onChange={handleChange}
      />

      <input
        name="rollno"
        placeholder="Roll Number"
        className="p-3 border rounded"
        onChange={handleChange}
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="p-3 border rounded"
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="p-3 border rounded"
        onChange={handleChange}
      />
      <p
        className="text-xs text-gray-500 -mt-3 cursor-help underline decoration-dotted"
        title={PASSWORD_EXAMPLE}
      >
        {PASSWORD_HINT}
      </p>

      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        className="p-3 border rounded"
        onChange={handleChange}
      />

      <button className="bg-teal-600 text-white p-3 rounded">
        Create Account
      </button>
    </form>
  );
}
