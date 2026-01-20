import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from "../utils/api";
import { 
  Package, Users, Calendar, Plus, TrendingUp,
  Heart, Truck, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ donations: 0, requests: 0, drives: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [donationsRes, requestsRes, drivesRes] = await Promise.all([
        api.get('/donations/user/my-donations'),
        api.get('/requests/user/my-requests'),
        api.get('/drives')
      ]);

      setStats({
        donations: donationsRes.data.length,
        requests: requestsRes.data.length,
        drives: drivesRes.data.drives.length,
        recentActivity: [
          ...donationsRes.data.slice(0, 3).map(item => ({
            type: 'donation', title: item.title, status: item.status, date: item.createdAt
          })),
          ...requestsRes.data.slice(0, 3).map(item => ({
            type: 'request', title: item.title, status: item.status, date: item.createdAt
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleSpecificContent = () => {
    // Colors mapped to soft pastels
    switch (user.role) {
      case 'donor':
        return {
          title: 'Donor Dashboard', description: 'Manage your donations and help those in need',
          primaryAction: { text: 'Create Donation', link: '/create-donation', icon: Plus },
          stats: [
            { label: 'My Donations', value: stats.donations, icon: Package, color: 'text-indigo-500 bg-indigo-50' },
            { label: 'Active Drives', value: stats.drives, icon: Calendar, color: 'text-emerald-500 bg-emerald-50' },
            { label: 'Items Donated', value: stats.donations, icon: Heart, color: 'text-rose-500 bg-rose-50' }
          ]
        };
      case 'recipient':
        return {
          title: 'Recipient Dashboard', description: 'Track your requests and find help',
          primaryAction: { text: 'Create Request', link: '/create-request', icon: Plus },
          stats: [
            { label: 'My Requests', value: stats.requests, icon: Users, color: 'text-sky-500 bg-sky-50' },
            { label: 'Available Drives', value: stats.drives, icon: Calendar, color: 'text-emerald-500 bg-emerald-50' },
            { label: 'Items Received', value: 0, icon: Package, color: 'text-rose-500 bg-rose-50' }
          ]
        };
      // ... (Keep other cases logic, just map colors similarly)
      default: return { title: 'Dashboard', description: 'Welcome', primaryAction: null, stats: [] };
    }
  };

  const roleContent = getRoleSpecificContent();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse rounded-full h-16 w-16 bg-rose-200"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{roleContent.title}</h1>
          <p className="mt-2 text-slate-500 text-lg">{roleContent.description}</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              {roleContent.primaryAction && (
                <Link to={roleContent.primaryAction.link} className="inline-flex items-center px-6 py-3 bg-rose-400 text-white rounded-2xl hover:bg-rose-500 transition-all shadow-sm hover:shadow-md font-medium">
                  <roleContent.primaryAction.icon className="h-5 w-5 mr-2" />
                  {roleContent.primaryAction.text}
                </Link>
              )}
              <Link to="/donations" className="inline-flex items-center px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-medium">
                <Package className="h-5 w-5 mr-2" /> Browse Donations
              </Link>
              <Link to="/requests" className="inline-flex items-center px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-medium">
                <Users className="h-5 w-5 mr-2" /> View Requests
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {roleContent.stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 transition-transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className={`p-4 rounded-2xl ${stat.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity & Emergency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h2>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-6">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                    <div className={`p-3 rounded-2xl ${activity.type === 'donation' ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'}`}>
                      {activity.type === 'donation' ? <Package className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.type} • {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">No recent activity</p>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Emergency Drives</h2>
            <div className="space-y-4">
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-rose-400" />
                  <h3 className="font-bold text-rose-900">Hurricane Relief</h3>
                </div>
                <p className="text-sm text-rose-700 mt-2 leading-relaxed">Urgent need for food, water, and clothing.</p>
                <div className="mt-4 text-xs font-semibold text-rose-400 uppercase tracking-wide">Ends in 2 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;