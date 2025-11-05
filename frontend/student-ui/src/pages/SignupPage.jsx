import React from "react";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import SignupForm from "../components/auth/signupform";

const SignupPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-teal-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
            Create Your Account
          </h2>
          <SignupForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;
