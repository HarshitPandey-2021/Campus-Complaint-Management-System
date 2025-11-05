import React from "react";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import LoginForm from "../components/auth/loginform";

const LoginPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-pink-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">
            Login to Continue
          </h2>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
