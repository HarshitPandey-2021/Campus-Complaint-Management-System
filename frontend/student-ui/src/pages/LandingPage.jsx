import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import LoginModal from "../components/auth/LoginModal";
import SignupModal from "../components/auth/SignupModal";

import {
  FileText,
  Search,
  ShieldCheck,
  CheckCircle,
  Star,
} from "lucide-react";

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  /* ----------------------- TESTIMONIAL CAROUSEL STATE ----------------------- */
  const testimonials = [
    { name: "Andrew Sans", msg: "Fast response and supportive staff!" },
    { name: "Eric Rocks", msg: "Issue resolved within a day!" },
    { name: "Raveric", msg: "Transparent and easy to use!" },
  ];

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <Navbar
        onLoginOpen={() => setLoginOpen(true)}
        onSignupOpen={() => setSignupOpen(true)}
      />

      <div className="min-h-screen flex flex-col bg-gray-50 pt-20">

        {/* HERO SECTION */}
        <section
          className="relative bg-cover bg-center h-[70vh] flex flex-col justify-center items-center text-center group transition-all"
          style={{
            backgroundImage:
              "url('https://www.lkouniv.ac.in/site/writereaddata/HomePage/Header/H_202403191545264198.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-500" />

          <div className="relative z-10 text-white px-4 transform group-hover:scale-[1.02] transition duration-500">
            <h1 className="text-4xl md:text-6xl font-bold mb-3 drop-shadow-md tracking-wide">
              Campus Grievance Redressal Portal
            </h1>

            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              A transparent, responsive and student-centric system empowering students to raise and track concerns efficiently.
            </p>

            <button
              onClick={() => setLoginOpen(true)}
              className="bg-yellow-400 text-gray-900 px-8 py-3 font-semibold rounded-xl shadow-lg hover:bg-yellow-300 hover:scale-105 transition"
            >
              Report & Track Complaints
            </button>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 px-6 md:px-20 grid md:grid-cols-3 gap-10 text-center">
          {[
            {
              title: "Lodge Complaints Effortlessly",
              desc: "Submit detailed concerns through an intuitive and student-friendly interface.",
              icon: <FileText className="mx-auto w-16 h-16 text-pink-600 mb-4" />,
            },
            {
              title: "Real-Time Status Tracking",
              desc: "Monitor your complaint status with live updates and clear timelines.",
              icon: <Search className="mx-auto w-16 h-16 text-teal-600 mb-4" />,
            },
            {
              title: "Ensured Transparency",
              desc: "A fair, responsible and accountable grievance redressal system.",
              icon: (
                <ShieldCheck className="mx-auto w-16 h-16 text-blue-700 mb-4" />
              ),
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition border border-gray-200"
            >
              {card.icon}
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {card.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </section>

        {/* HOW IT WORKS + STATS (Equal Height Fix Applied) */}
        <section className="px-6 md:px-20 py-20 bg-gray-100">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-stretch">

            {/* LEFT CARD (Equal height) */}
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-200 hover:shadow-2xl transition h-full">
              <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center">
                How It Works
              </h2>

              <div className="space-y-6 text-gray-700 text-lg">
                {[
                  "Login securely using your credentials.",
                  "Submit your complaint with full details.",
                  "Track real-time updates on your dashboard.",
                  "Receive notifications until resolution.",
                ].map((step, i) => (
                  <p key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-7 h-7 text-teal-600 mt-1" />
                    {step}
                  </p>
                ))}
              </div>
            </div>

            {/* RIGHT CARD (Equal height) */}
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-200 text-center hover:shadow-2xl transition h-full">
              <h2 className="text-3xl font-bold text-indigo-700 mb-8">
                Quick Insights
              </h2>

              <div className="space-y-8 text-gray-800 text-xl font-semibold">
                <p>
                  <span className="text-teal-600 text-5xl font-bold">1200+</span>
                  <br /> Complaints Resolved
                </p>
                <p>
                  <span className="text-pink-600 text-5xl font-bold">24 Hrs</span>
                  <br /> Avg Response Time
                </p>
                <p>
                  <span className="text-purple-600 text-5xl font-bold">95%</span>
                  <br /> Student Satisfaction
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT US */}
        <section className="px-6 md:px-20 py-20 text-center bg-white">
          <h2 className="text-4xl font-bold mb-6 text-indigo-700">About Us</h2>
          <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed mb-12">
            The University of Lucknow, over a century old centre of higher learning, has always upheld a tradition of academic excellence, integrity, and service to society. Carrying forward this rich legacy pertaining to the digital age, this Campus Grievance Redressal Portal is an initiative, a dedicated platform to strengthen communication between the University community and the University administration.

This portal attempts to reflect the University’s commitment to transparency, responsiveness, and community welfare. Designed with modern technological standards, it ensures faster complaint processing, clear accountability, and seamless tracking—allowing one to voice concerns with confidence and clarity.

Beyond its technical efficiency, the portal symbolizes a more humane approach to problem-solving within the campus community. It is to provide not just students, but faculty and staff with a space to be heard and supported, reinforcing the University’s belief that meaningful dialogue is essential for a healthy academic environment.

By integrating our time-honoured values with contemporary digital innovation, this Campus Grievance Redressal Portal stands as a testament to the University of Lucknow’s ongoing mission: to empower students, uphold fairness, and continuously evolve in service of its vibrant academic community.</p>

          {/* TESTIMONIAL CAROUSEL (Enhancement 4) */}
          <h3 className="text-2xl font-semibold text-indigo-700 mb-8">
            Student Testimonials
          </h3>

          <div className="relative w-full max-w-3xl mx-auto overflow-hidden">
            <div
              className="flex transition-all duration-700"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="min-w-full px-6">
                  <div className="bg-gray-50 p-10 rounded-xl shadow-lg hover:shadow-2xl transition border">
                    <Star className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                    <p className="italic text-gray-700 mb-3">“{t.msg}”</p>
                    <h4 className="font-semibold text-indigo-700">– {t.name}</h4>
                  </div>
                </div>
              ))}
            </div>

            {/* CAROUSEL DOTS */}
            <div className="flex justify-center gap-3 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`h-3 w-3 rounded-full transition ${
                    slide === i ? "bg-indigo-700" : "bg-gray-400"
                  }`}
                  onClick={() => setSlide(i)}
                ></button>
              ))}
            </div>
          </div>

          {/* TEAM */}
          <h3 className="text-2xl font-semibold text-indigo-700 mt-16 mb-8">
            Our Team
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
            {["team1", "team2", "team3", "team4"].map((img, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border hover:scale-105 transition">
                  <img
                    src={`/images/${img}.jpg`}
                    className="w-full h-full object-cover"
                    alt={`team-${idx + 1}`}
                  />
                </div>
                <p className="font-semibold text-indigo-700 mt-3">Team Member</p>
                <p className="text-gray-600 text-sm">Administration</p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section className="bg-gradient-to-r from-teal-500 via-pink-500 to-blue-700 py-20 text-white text-center">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <p className="max-w-2xl mx-auto text-lg mb-10">
            Have a concern or need help? Our team is here to support you.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-10">
            <div className="bg-white/20 p-6 rounded-xl shadow-lg w-64 hover:scale-105 transition">
              <h3 className="font-semibold text-xl mb-2">📍 Address</h3>
              <p>University of Lucknow</p>
            </div>

            <div className="bg-white/20 p-6 rounded-xl shadow-lg w-64 hover:scale-105 transition">
              <h3 className="font-semibold text-xl mb-2">📧 Email</h3>
              <p>example@abc.edu.in</p>
            </div>

            <div className="bg-white/20 p-6 rounded-xl shadow-lg w-64 hover:scale-105 transition">
              <h3 className="font-semibold text-xl mb-2">📞 Phone</h3>
              <p>+91 9988776655</p>
            </div>
          </div>
        </section>

        <footer className="bg-indigo-700 text-white py-6 text-center">
          <p>© 2025 University of Lucknow | Campus Complaint Portal</p>
        </footer>
      </div>

      {/* MODALS */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignupOpen={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
      />
    </>
  );
}
