import React from "react";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import StatsCard from "../components/dashboard/statscard";
import RecentComplaints from "../components/dashboard/recentComplaint";

const Dashboard = () => {
  const complaints = [
    { id: 1, title: "Leaking tap in hostel", category: "Hostel", status: "Resolved" },
    { id: 2, title: "WiFi not working", category: "Infrastructure", status: "In Progress" },
    { id: 3, title: "Canteen hygiene issue", category: "Canteen", status: "Pending" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-pink-50">
      <Header />
      <main className="flex-grow px-8 py-10">
        <h1 className="text-3xl font-bold text-teal-700 mb-8 text-center">
          Dashboard
        </h1>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <StatsCard title="Total Complaints" value="18" color="blue" />
          <StatsCard title="Resolved" value="9" color="teal" />
          <StatsCard title="Pending" value="9" color="magenta" />
        </div>

        {/* Recent Complaints */}
        <RecentComplaints complaints={complaints} />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
