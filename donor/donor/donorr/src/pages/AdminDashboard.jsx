import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStats } from "../api/admin";
import { Users, FileText, Activity, Package, Heart, Calendar } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchStats()
      .then((res) => {
        if (mounted) setStats(res.data);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const StatCard = ({ title, value, colorClass, icon: Icon, bgClass }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 transition-transform hover:-translate-y-1">
      <div className={`p-4 rounded-2xl ${bgClass}`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</div>
        <div className="text-3xl font-bold text-slate-800 mt-1">{value ?? "-"}</div>
      </div>
    </div>
  );

  const NavCard = ({ to, title, description, icon: Icon, colorClass, bgClass }) => (
    <Link 
      to={to} 
      className="group bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col items-start"
    >
      <div className={`p-4 rounded-2xl mb-6 ${bgClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`h-8 w-8 ${colorClass}`} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-500 transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 mt-3 leading-relaxed text-sm">
        {description}
      </p>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2">Overview of platform metrics and management tools.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Users" 
            value={stats?.totals?.users} 
            icon={Users}
            colorClass="text-indigo-400" 
            bgClass="bg-indigo-50"
          />
          <StatCard 
            title="Total Donations" 
            value={stats?.totals?.donations} 
            icon={Package}
            colorClass="text-emerald-400" 
            bgClass="bg-emerald-50"
          />
          <StatCard 
            title="Total Requests" 
            value={stats?.totals?.requests} 
            icon={Heart}
            colorClass="text-rose-400" 
            bgClass="bg-rose-50"
          />
          <StatCard 
            title="Active Drives" 
            value={stats?.totals?.activeDrives} 
            icon={Calendar}
            colorClass="text-amber-400" 
            bgClass="bg-amber-50"
          />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NavCard 
            to="/admin/users"
            title="Manage Users"
            description="View user database, search profiles, edit roles, and manage account permissions."
            icon={Users}
            colorClass="text-indigo-500"
            bgClass="bg-indigo-50"
          />

          <NavCard 
            to="/admin/reports"
            title="Reports"
            description="Generate detailed activity reports, view system logs, and export data for analysis."
            icon={FileText}
            colorClass="text-rose-500"
            bgClass="bg-rose-50"
          />

          <NavCard 
            to="/admin/system"
            title="System Overview"
            description="Monitor live operational metrics, system health, and recent critical activities."
            icon={Activity}
            colorClass="text-emerald-500"
            bgClass="bg-emerald-50"
          />
        </div>

        {loading && (
          <div className="mt-8 flex items-center justify-center text-slate-400 animate-pulse">
            Loading latest statistics...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;