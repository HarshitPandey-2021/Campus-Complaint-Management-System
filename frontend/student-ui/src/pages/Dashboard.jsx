import React from "react";
import { Link } from "react-router-dom";
import StatsCard from "../components/dashboard/StatsCard";
import RecentComplaints from "../components/dashboard/RecentComplaints";
import { PlusCircle, ClipboardList, BarChart3 } from "lucide-react";

export default function Dashboard() {
  return (
    <div
      className="min-h-screen p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(192,38,211,0.10), rgba(236,72,153,0.10), rgba(14,165,233,0.10), rgba(0,128,128,0.10))",
      }}
    >
      {/* ================= HEADER ================= */}
      <header className="mb-12">
        <div className="flex justify-between items-center">
          <h1
            className="text-4xl font-extrabold tracking-tight"
            style={{
              background:
                "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Dashboard
          </h1>

          <Link
            to="/"
            className="px-4 py-2 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition"
            style={{
              background: "linear-gradient(90deg,#ec4899,#c026d3)",
            }}
          >
            ← Back to Home
          </Link>
        </div>

        <div
          className="w-full h-[3px] mt-4 rounded-full"
          style={{
            background:
              "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
          }}
        ></div>
      </header>

      {/* ================= USER STATS ================= */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-5 text-gray-900">
          Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard label="Total Complaints" value="12" highlight="#0ea5e9" />
          <StatsCard label="Pending Issues" value="4" highlight="#ec4899" />
          <StatsCard label="Resolved Cases" value="8" highlight="#22c55e" />
        </div>
      </section>

      {/* ================= ACTION CARDS ================= */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-5 text-gray-900">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Submit Complaint */}
          <Link
            to="/submit-complaint"
            className="p-8 rounded-2xl shadow-xl border hover:shadow-2xl 
            hover:-translate-y-1 transition bg-white"
          >
            <div className="flex flex-col items-center text-center">
              <PlusCircle className="w-14 h-14 text-teal-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Submit New Complaint
              </h3>
              <p className="text-gray-600">
                Register a new complaint with complete details.
              </p>
            </div>
          </Link>

          {/* My Complaints */}
          <Link
            to="/my-complaints"
            className="p-8 rounded-2xl shadow-xl border hover:shadow-2xl 
            hover:-translate-y-1 transition bg-white"
          >
            <div className="flex flex-col items-center text-center">
              <ClipboardList className="w-14 h-14 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                My Complaints
              </h3>
              <p className="text-gray-600">
                View all your complaints and track progress.
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <div
            className="p-8 rounded-2xl shadow-xl border hover:shadow-2xl 
            hover:-translate-y-1 transition bg-white"
          >
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="w-14 h-14 text-purple-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analytics
              </h3>
              <p className="text-gray-600">
                Admin analytics dashboard coming soon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RECENT COMPLAINTS ================= */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-5 text-gray-900">
          Recent Complaints
        </h2>
        <RecentComplaints />
      </section>
    </div>
  );
}
