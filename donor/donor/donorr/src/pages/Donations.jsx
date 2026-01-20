import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from "../utils/api";
import { Package, Search, MapPin, Calendar, User, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Donations = () => {
  const { isAuthenticated, user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', location: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showMyDonations, setShowMyDonations] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [filters, showMyDonations]); 

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      
      // Determine Endpoint: User specific vs Public
      let endpoint = '/donations';
      if (showMyDonations && user) {
        // Fetches data specific to the logged-in user from the database
        endpoint = '/donations/user/my-donations'; 
      } else {
        // Fetches all available public donations from the database
        endpoint = `/donations?${params.toString()}`;
      }
      
      const response = await api.get(endpoint);
      
      // Handle response structure (API usually returns { donations: [] } or just [])
      const data = response.data.donations || response.data; 
      setDonations(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error("Failed to load donations from database.");
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation =>
    donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'reserved': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'donated': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            {showMyDonations ? 'My Donations' : 'Available Donations'}
          </h1>
          <p className="mt-3 text-slate-500 text-lg">
            {showMyDonations 
              ? 'Manage the items you have listed.' 
              : 'Browse items shared by the community.'}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Search */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select 
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="food">Food</option>
                <option value="clothing">Clothing</option>
                <option value="medical">Medical</option>
                <option value="shelter">Shelter</option>
                <option value="education">Education</option>
              </select>

              {/* My Donations Toggle (Only for Donors) */}
              {isAuthenticated && user?.role === 'donor' && (
                <button
                  onClick={() => setShowMyDonations(!showMyDonations)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all border ${
                    showMyDonations 
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                      : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  {showMyDonations ? 'Show All' : 'My Donations'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20 text-slate-400">Loading donations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDonations.map((donation) => (
              <div key={donation._id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group flex flex-col">
                
                {/* Image Area */}
                <div className="h-56 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  {donation.images && donation.images.length > 0 ? (
                    <img 
                      src={donation.images[0]} 
                      alt={donation.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-4xl opacity-50">📦</div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-white ${
                      donation.status === 'available' ? 'text-emerald-600 border-emerald-200' : 
                      donation.status === 'reserved' ? 'text-amber-600 border-amber-200' : 'text-slate-500 border-slate-200'
                    }`}>
                      {donation.status}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-500 transition-colors">
                      {donation.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">{donation.description}</p>
                  </div>

                  <div className="space-y-3 mb-6 mt-auto">
                    <div className="flex items-center text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                      <MapPin className="h-4 w-4 mr-3 text-indigo-400" />
                      <span className="truncate">{donation.location?.city || 'Location'}, {donation.location?.state}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                      <User className="h-4 w-4 mr-3 text-indigo-400" />
                      <span className="truncate">{donation.donor?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-400 px-2">
                      <Calendar className="h-3.5 w-3.5 mr-2" />
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      to={`/donations/${donation._id}`} 
                      className="flex-1 bg-white border border-slate-200 text-slate-600 text-center py-3 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      Details
                    </Link>
                    
                    {/* Action Button Logic */}
                    {isAuthenticated ? (
                      showMyDonations ? (
                        // If viewing own donations (e.g., Edit)
                        <button className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition-colors">
                          Edit
                        </button>
                      ) : (
                        // If viewing public donations
                        donation.status === 'available' && donation.donor?._id !== user._id && (
                          <button className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-100 transition-all">
                            Request
                          </button>
                        )
                      )
                    ) : (
                      // Guest View
                      <Link to="/login" className="flex-1 bg-indigo-500 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all">
                        Login to Request
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDonations.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Package className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">No donations found</h3>
            <p className="text-slate-400">Try adjusting your filters or search terms.</p>
            {showMyDonations && (
              <Link to="/create-donation" className="mt-6 inline-block px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                Create First Donation
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;