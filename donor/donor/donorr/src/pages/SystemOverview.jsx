import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import { Activity, Database, Server, Calendar, Clock } from "lucide-react";

const SystemOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats directly using api instance
    api.get('/admin/stats')
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch system stats:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const MetricCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4 transition-transform hover:-translate-y-1">
      <div className={`p-4 rounded-2xl bg-${color}-50`}>
        <Icon className={`h-6 w-6 text-${color}-500`} />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold text-slate-800 mt-1">
          {loading ? "..." : (value ?? "-")}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">System Overview</h1>
        <p className="text-slate-500 mt-1">Live status of platform operations.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          label="Pending Requests" 
          value={stats?.pendingRequests} 
          icon={Server} 
          color="amber" 
        />
        <MetricCard 
          label="Available Donations" 
          value={stats?.availableDonations} 
          icon={Database} 
          color="emerald" 
        />
        <MetricCard 
          label="Active Drives" 
          value={stats?.totals?.activeDrives} 
          icon={Activity} 
          color="indigo" 
        />
      </div>

      {/* Recent Drives Section */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Recent Drives</h3>
        </div>

        {stats?.recentDrives?.length ? (
          <ul className="space-y-4">
            {stats.recentDrives.map((d) => (
              <li 
                key={d._id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <span className={`w-2 h-2 rounded-full ${d.status === 'active' ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                  <span className="font-semibold text-slate-700 text-lg">{d.title}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm capitalize">
                    {d.category}
                  </span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 text-slate-400" />
                    {new Date(d.startDate || d.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Calendar className="h-10 w-10 mb-3 opacity-20" />
            <p>No recent drives recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemOverview;