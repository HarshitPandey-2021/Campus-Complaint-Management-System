// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import Loading from '../components/Loading';
import { useToast } from '../hooks/useToast';
import useCountUp from '../hooks/useCountUp';
import { getAllComplaints, getStats } from '../api';
import {
  RiFileListLine,
  RiTimeLine,
  RiLoader4Line,
  RiCheckLine,
  RiArrowRightLine,
  RiBarChartBoxLine,
  RiCalendarLine,
  RiUserLine
} from 'react-icons/ri';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const { info, success } = useToast();

  const totalCount = useCountUp(stats.total, 1200);
  const pendingCount = useCountUp(stats.pending, 1200);
  const inProgressCount = useCountUp(stats.inProgress, 1200);
  const resolvedCount = useCountUp(stats.resolved, 1200);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const allComplaints = await getAllComplaints(token);
        setRecentComplaints(allComplaints.slice(0, 5));

        const statsData = await getStats(token);
        setStats(statsData);
      } catch (err) {
        console.error("❌ Error loading dashboard data:", err);
        info("⚠️ Failed to fetch complaints from the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [info]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('dashboard-welcome-seen');
    if (!hasSeenWelcome && stats.total > 0) {
      setTimeout(() => {
        if (stats.pending > 0) {
          info(`👋 Welcome back! You have ${stats.pending} pending complaints.`, 4000);
        } else {
          success(`🎉 Great work! All complaints are handled.`, 4000);
        }
        localStorage.setItem('dashboard-welcome-seen', 'true');
      }, 1000);
    }
  }, [stats, info, success]);

  const handleStatClick = (status) => {
    navigate('/complaints', { state: { filterStatus: status } });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 page-enter">
        {/* ... (skeleton loading code as before) ... */}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-enter">
      {/* ... (the rest of your Dashboard UI as before) ... */}
    </div>
  );
};

export default Dashboard;
