import React from 'react';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased">
      <header className="bg-indigo-600 text-white p-6 shadow-lg mb-6">
        <h1 className="heading text-3xl">Campus Complaint Management System</h1>
      </header>

      <main className="container">
        <p className="paragraph mb-6">Welcome! This is your dashboard preview.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">Student Complaint Card</div>
          <div className="card">Faculty Complaint Card</div>
        </div>

        <div className="mt-6 space-x-4">
          <button className="button-primary">Sign Up</button>
          <button className="button-secondary">Login</button>
        </div>
      </main>
    </div>
  );
}

export default App;
