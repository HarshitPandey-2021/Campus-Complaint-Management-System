import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import { FileText, Search, ShieldCheck, CheckCircle, Star } from "lucide-react";
import { getLandingStatsApi } from "../api";

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    resolved: "1200+",
    responseTime: "24 Hrs",
    satisfaction: "95%",
    loading: true
  });

  useEffect(() => {
    // Update page title
    document.title = "Campus Grievance Portal | University of Lucknow";
    
    // Fetch dynamic stats
    fetchStats();
    
    // Smooth reveal on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((element) => {
      element.classList.add("opacity-0", "transition-opacity", "duration-700");
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Fetch real stats from backend
  const fetchStats = async () => {
    try {
      const data = await getLandingStatsApi();
      setStats({
        resolved: `${data.totalResolved}+`,
        responseTime: data.avgResponseTime,
        satisfaction: `${data.satisfactionRate}%`,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Keep fallback values
      setStats({
        resolved: "1200+",
        responseTime: "24 Hrs",
        satisfaction: "95%",
        loading: false
      });
    }
  };

  return (
    <div className="bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="relative bg-cover bg-center h-[75vh] flex flex-col justify-center items-center text-center"
        style={{
          backgroundImage:
            "url('https://www.lkouniv.ac.in/site/writereaddata/HomePage/Header/H_202403191545264198.jpg')",
          marginTop: "-1px"
        }}
      >
        <div className="bg-gradient-to-b from-black/60 via-black/50 to-black/40 absolute inset-0" />
        <div className="relative z-10 text-white px-4 space-y-6 animate-on-scroll">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-2xl leading-tight">
            Campus Grievance <span className="text-yellow-400">Redressal</span> Portal
          </h1>

          <p className="text-xl md:text-2xl mb-8 font-light max-w-3xl mx-auto leading-relaxed">
            A transparent, responsive and student-centric system empowering students to raise and track concerns.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="bg-yellow-400 text-gray-900 px-8 py-4 text-lg font-bold rounded-full shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
          >
            Report & Track Complaints →
          </button>
        </div>
      </section>

      {/* MAIN FEATURES */}
      <section className="py-16 px-6 md:px-20">
        <div className="grid md:grid-cols-3 gap-8 text-center animate-on-scroll">
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
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              style={{ border: "3px solid transparent", backgroundClip: "padding-box", borderImage: card.border }}
            >
              {card.icon}
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {card.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS + STATS */}
      <section className="px-6 md:px-20 py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center animate-on-scroll">
          
          {/* HOW IT WORKS */}
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200 hover:shadow-2xl transition-all duration-300 h-full">
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
                <p key={i} className="flex items-start gap-3 hover:translate-x-2 transition-transform duration-200 cursor-pointer group">
                  <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-indigo-600 transition-colors">{step}</span>
                </p>
              ))}
            </div>
          </div>

          {/* QUICK INSIGHTS - NOW DYNAMIC! */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-10 text-white text-center hover:scale-[1.02] transition-transform duration-300 h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-10">Quick Insights</h2>

            {stats.loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-yellow-300 text-5xl font-extrabold block animate-pulse">
                    {stats.resolved}
                  </span>
                  <p className="text-lg mt-2">Complaints Resolved</p>
                </div>
                <div className="hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-green-300 text-5xl font-extrabold block animate-pulse">
                    {stats.responseTime}
                  </span>
                  <p className="text-lg mt-2">Average Response Time</p>
                </div>
                <div className="hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-pink-300 text-5xl font-extrabold block animate-pulse">
                    {stats.satisfaction}
                  </span>
                  <p className="text-lg mt-2">Student Satisfaction</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section className="px-6 md:px-20 py-20 text-center bg-white">
        <div className="animate-on-scroll">
          <h2 className="text-4xl font-bold mb-6 text-indigo-700">About Us</h2>
          <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed text-lg mb-12">
            The University of Lucknow's Campus Grievance Redressal Portal is dedicated to ensuring transparency, faster processing, accountability and student empowerment through a modern and fully digital platform. We combine clear workflows, timely action, and user-friendly reporting to improve campus life for students, faculty and staff.
          </p>

          {/* TESTIMONIALS - 5 TESTIMONIALS */}
          <h3 className="text-2xl font-semibold text-indigo-700 mb-8">
            Student Testimonials
          </h3>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 justify-center max-w-7xl mx-auto">
            {[
              { name: "Priya Sharma", msg: "Extremely fast response and supportive staff!" },
              { name: "Rahul Verma", msg: "My issue was resolved within a single day!" },
              { name: "Anjali Singh", msg: "Very transparent and easy to use interface." },
              { name: "Vikram Yadav", msg: "The tracking system is brilliant and simple!" },
              { name: "Neha Gupta", msg: "Finally, a system that actually listens to students!" },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-yellow-400"
              >
                <div className="flex gap-1 justify-center mb-3">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-700 mb-3 text-sm leading-relaxed">"{t.msg}"</p>
                <h4 className="font-bold text-indigo-700 text-sm">– {t.name}</h4>
              </div>
            ))}
          </div>

          {/* TEAM SECTION */}
          <h3 className="text-2xl font-semibold text-indigo-700 mt-16 mb-8">
            Our Development Team
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 justify-items-center max-w-6xl mx-auto">
            {[
              { img: "shakti", fallback: "team1", name: "Shakti", role: "Frontend & UI Design" },
              { img: "harshit", fallback: "team2", name: "Harshit", role: "Dashboard Development" },
              { img: "somu", fallback: "team3", name: "Somesh", role: "Backend & APIs" },
              { img: "shiva", fallback: "team4", name: "Shiva", role: "Database & Integration" },
            ].map((member, idx) => (
              <div className="flex flex-col items-center group" key={idx}>
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-indigo-200 group-hover:border-indigo-500 transition-all duration-300 group-hover:scale-110">
                  <img
                    src={`/images/${member.img}.jpeg`}
                    className="w-full h-full object-cover object-top"
                    alt={member.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/images/${member.fallback}.jpg`;
                    }}
                  />
                </div>
                <p className="font-bold text-indigo-700 mt-4 text-lg">{member.name}</p>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 text-white text-center">
        <div className="animate-on-scroll">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <p className="max-w-2xl mx-auto text-lg mb-10">
            Have a concern or need help? Our support team is here to assist you!
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-72 hover:bg-white/30 transition-all duration-300 hover:scale-105">
              <h3 className="font-semibold text-xl mb-2">📍 Main Campus</h3>
              <p className="text-sm">University Road, Babuganj, Hasanganj</p>
              <p className="text-sm">Lucknow - 226007</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-72 hover:bg-white/30 transition-all duration-300 hover:scale-105">
              <h3 className="font-semibold text-xl mb-2">📧 Support Email</h3>
              <p className="text-sm">General: info@lkouniv.ac.in</p>
              <p className="text-sm">Technical: lu.support@otpl.co.in</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-72 hover:bg-white/30 transition-all duration-300 hover:scale-105">
              <h3 className="font-semibold text-xl mb-2">📞 Helpline</h3>
              <p className="text-sm">Office: 0522-2740467</p>
              <p className="text-sm">Support: +91-7991200503</p>
            </div>
          </div>
          
          <p className="mt-7 text-white/90 text-sm text-base font-medium">
            Technical Support Available: Monday - Friday (10 AM - 6 PM)
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-indigo-900 text-white py-6 text-center -mt-8">
        <p>© {new Date().getFullYear()} University of Lucknow | Campus Complaint Portal</p>
      </footer>
    </div>
  );
}