import React from "react";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import { FileText, Search, ShieldCheck, CheckCircle, Users, Star } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="relative bg-cover bg-center h-[70vh] flex flex-col justify-center items-center text-center"
        style={{
          backgroundImage:
            "url('https://www.lkouniv.ac.in/site/writereaddata/HomePage/Header/H_202403191545264198.jpg')",
        }}
      >
        <div className="bg-black bg-opacity-40 absolute inset-0" />
        <div className="relative z-10 text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-md">
            Campus Grievance Redressal Portal
          </h1>

          <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl mx-auto">
            A transparent, responsive and student-centric system empowering students to raise and track concerns.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="bg-yellow-400 text-gray-900 px-6 py-3 font-semibold rounded-lg shadow hover:bg-yellow-300 transition"
          >
            Report & Track Complaints
          </button>
        </div>
      </section>

      {/* MAIN FEATURES */}
      <section className="py-16 px-6 md:px-20 grid md:grid-cols-3 gap-8 text-center">
        {[
          {
            title: "Lodge Complaints Effortlessly",
            desc: "Submit detailed concerns with an intuitive and student-friendly interface.",
            icon: <FileText className="mx-auto w-14 h-14 text-pink-600 mb-4" />,
            border: "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080) 1",
          },
          {
            title: "Real-Time Status Tracking",
            desc: "Monitor your complaint status with live updates and clear timelines.",
            icon: <Search className="mx-auto w-14 h-14 text-teal-600 mb-4" />,
            border: "linear-gradient(90deg,#008080,#0ea5e9,#c026d3,#ec4899) 1",
          },
          {
            title: "Ensured Transparency",
            desc: "A fair, responsible and accountable grievance redressal process.",
            icon: <ShieldCheck className="mx-auto w-14 h-14 text-blue-700 mb-4" />,
            border: "linear-gradient(90deg,#0ea5e9,#008080,#ec4899,#c026d3) 1",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
            style={{ border: "3px solid transparent", backgroundClip: "padding-box", borderImage: card.border }}
          >
            {card.icon}
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {card.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS + STATS */}
      <section className="px-6 md:px-20 py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* HOW IT WORKS */}
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
            <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center">
              How It Works
            </h2>

            <div className="space-y-6 text-gray-700 text-lg">
              {[
                "Login securely using your credentials.",
                "Submit your complaint with full details.",
                "Track real-time updates on your dashboard.",
                "Receive transparent notifications until resolution."
              ].map((step, i) => (
                <p key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-teal-600 mt-1" />
                  {step}
                </p>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200 text-center">
            <h2 className="text-3xl font-bold text-indigo-700 mb-8">
              Quick Insights
            </h2>

            <div className="space-y-5 text-gray-800 text-xl font-semibold">
              <p>
                <span className="text-teal-600 text-4xl font-bold">1200+</span>
                <br /> Complaints Resolved
              </p>
              <p>
                <span className="text-pink-600 text-4xl font-bold">24 Hrs</span>
                <br /> Average Response Time
              </p>
              <p>
                <span className="text-purple-600 text-4xl font-bold">95%</span>
                <br /> Student Satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section className="px-6 md:px-20 py-20 text-center bg-white">
        <h2 className="text-4xl font-bold mb-6 text-indigo-700">About Us</h2>
        <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed text-lg mb-12">
          The University of Lucknow’s Campus Grievance Redressal Portal is dedicated to ensuring transparency, faster processing, accountability and student empowerment through a modern and fully digital platform. We combine clear workflows, timely action, and user-friendly reporting to improve campus life for students, faculty and staff.
        </p>

        {/* TESTIMONIALS */}
        <h3 className="text-2xl font-semibold text-indigo-700 mb-8">
          Student Testimonials
        </h3>

        <div className="grid md:grid-cols-3 gap-8 justify-center max-w-6xl mx-auto">
          {[
            { name: "Andrew Sans", msg: "Extremely fast response and supportive staff!" },
            { name: "Eric Rocks", msg: "My issue was resolved within a single day!" },
            { name: "Raveric", msg: "Very transparent and easy to use interface." },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition border"
            >
              <Star className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <p className="italic text-gray-700 mb-4">“{t.msg}”</p>
              <h4 className="font-semibold text-indigo-700">– {t.name}</h4>
            </div>
          ))}
        </div>

        {/* TEAM SECTION */}
        <h3 className="text-2xl font-semibold text-indigo-700 mt-16 mb-8">
          Our Team
        </h3>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 justify-items-center max-w-6xl mx-auto">
          {["team1", "team2", "team3", "team4"].map((img, idx) => (
            <div className="flex flex-col items-center" key={idx}>
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border">
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

      {/* CONTACT SECTION */}
      <section
        className="bg-gradient-to-r from-teal-500 via-pink-500 to-blue-700 bg-opacity-90 py-20 text-white text-center"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <p className="max-w-2xl mx-auto text-lg mb-10">
          Have a concern or need help? Our team is here to support you!
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-64">
            <h3 className="font-semibold text-xl mb-2">📍 Address</h3>
            <p>University of Lucknow</p>
          </div>

          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-64">
            <h3 className="font-semibold text-xl mb-2">📧 Email</h3>
            <p>example@abc.edu.in</p>
          </div>

          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-64">
            <h3 className="font-semibold text-xl mb-2">📞 Phone</h3>
            <p>+91 9988776655</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-indigo-700 text-white py-6 text-center">
        <p>© 2025 University of Lucknow | Campus Complaint Portal</p>
      </footer>
    </div>
  );
}
