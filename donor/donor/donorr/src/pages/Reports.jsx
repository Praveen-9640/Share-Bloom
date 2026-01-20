import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { FileText, Clock, Users, Package, Calendar, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const Reports = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: [],
    donations: [],
    drives: [],
  });

  // Pastel Colors for charts
  const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f472b6", "#60a5fa"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch real data from database
        // specific limits ensure we get a good dataset for the graphs
        const [usersRes, donationsRes, drivesRes, reportsRes] = await Promise.all([
          api.get('/admin/users?limit=1000').catch(() => ({ data: { users: [] } })),
          api.get('/donations?limit=1000').catch(() => ({ data: { donations: [] } })),
          api.get('/drives?limit=1000').catch(() => ({ data: { drives: [] } })),
          api.get('/admin/reports?limit=100').catch(() => ({ data: { reports: [] } }))
        ]);

        // 1. Process User Data from DB
        const users = usersRes.data?.users || [];
        const userCounts = users.reduce((acc, user) => {
          const role = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Other';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {});
        // Convert to array for Recharts
        const userStats = Object.keys(userCounts).map(key => ({ name: key, value: userCounts[key] }));

        // 2. Process Donation Trends from DB
        const donations = donationsRes.data?.donations || [];
        const monthCounts = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        months.forEach(m => monthCounts[m] = 0); // Init 0

        donations.forEach(d => {
          if (d.createdAt) {
            const date = new Date(d.createdAt);
            if (!isNaN(date.getTime())) {
               const monthName = months[date.getMonth()];
               monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
            }
          }
        });
        const donationStats = months.map(m => ({ name: m, amount: monthCounts[m] }));

        // 3. Process Drives from DB
        const drives = drivesRes.data?.drives || [];
        const driveCounts = drives.reduce((acc, d) => {
          const cat = d.category ? d.category.charAt(0).toUpperCase() + d.category.slice(1) : 'Uncategorized';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});
        const driveStats = Object.keys(driveCounts).map(key => ({ name: key, count: driveCounts[key] }));

        // Update State
        setStats({ users: userStats, donations: donationStats, drives: driveStats });
        setItems(reportsRes.data?.reports || []);

      } catch (error) {
        console.error("Error generating reports from database:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Analytics & Reports</h1>
        <p className="text-slate-500 mt-1">
          Real-time insights derived from database records.
        </p>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* User Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">User Roles</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 ml-1">Distribution by account type</p>
          
          <div className="h-64 w-full flex-1">
            {stats.users.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.users}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.users.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300">No user data found in DB</div>
            )}
          </div>
        </div>

        {/* User Count Bar Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Total Users</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 ml-1">Count by role</p>

          <div className="h-64 w-full flex-1">
            {stats.users.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.users} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{fill: 'transparent'}}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                    {stats.users.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300">No user data found in DB</div>
            )}
          </div>
        </div>

        {/* Donation Trends Line Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Donation Activity</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 ml-1">Items donated per month (based on creation date)</p>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.donations}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drives Organized Bar Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Active Drives by Category</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 ml-1">Distribution of drive types found in DB</p>

          <div className="h-72 w-full">
            {stats.drives.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.drives}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="count" fill="#fbbf24" radius={[8, 8, 0, 0]} barSize={60}>
                    {stats.drives.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300">No drive data found in DB</div>
            )}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">System Logs</h3>
          <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Latest {items.length} entries
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No system reports generated yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div
                key={r._id}
                className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 capitalize text-lg">
                      {r.title || r.type}
                    </h4>
                    <p className="text-slate-500 mt-1 leading-relaxed">{r.summary || r.message}</p>
                  </div>
                </div>
                <div className="flex items-center text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-4 py-2 rounded-xl">
                  <Clock className="h-3.5 w-3.5 mr-2" />
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;