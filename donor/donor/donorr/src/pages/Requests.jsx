import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Users, Search, MapPin, Calendar, AlertCircle, Clock } from 'lucide-react';

const Requests = () => {
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', priority: '', urgency: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchRequests(); }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      // Clean empty filters
      Object.keys(filters).forEach(key => !filters[key] && params.delete(key));
      
      const response = await api.get(`/requests?${params.toString()}`);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pastel Color Mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'emergency': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category) => {
    // Return simple emoji or icon component logic
    const icons = { food: '🍞', clothing: '👕', medical: '💊', shelter: '🏠', education: '📚' };
    return icons[category] || '📦';
  };

  const SelectInput = ({ value, onChange, options, defaultText }) => (
    <select
      value={value}
      onChange={onChange}
      className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
    >
      <option value="">{defaultText}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Help Requests</h1>
          <p className="mt-3 text-slate-500 text-lg">
            See what people in your community need and how you can help.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <SelectInput 
                value={filters.category} 
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                defaultText="All Categories"
                options={[
                  {value: 'food', label: 'Food'},
                  {value: 'clothing', label: 'Clothing'},
                  {value: 'medical', label: 'Medical'},
                  {value: 'shelter', label: 'Shelter'},
                  {value: 'education', label: 'Education'}
                ]}
              />
               <SelectInput 
                value={filters.priority} 
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                defaultText="All Priorities"
                options={[
                  {value: 'urgent', label: 'Urgent'},
                  {value: 'high', label: 'High'},
                  {value: 'medium', label: 'Medium'},
                  {value: 'low', label: 'Low'}
                ]}
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group flex flex-col">
                
                {/* Card Header */}
                <div className="p-8 border-b border-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-500 transition-colors">
                      {request.title}
                    </h3>
                    {request.isEmergency && (
                      <div className="bg-rose-50 p-2 rounded-full">
                         <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                    {request.description}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-8 pt-6 flex-1 flex flex-col">
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center text-sm text-slate-600 font-medium">
                      <span className="text-xl mr-3">{getCategoryIcon(request.category)}</span>
                      {request.quantity} {request.unit} needed
                    </div>
                    
                    {request.location && (
                      <div className="flex items-center text-sm text-slate-500">
                        <MapPin className="h-4 w-4 mr-3 text-indigo-300" />
                        {request.location.city}, {request.location.state}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="h-4 w-4 mr-3 text-indigo-300" />
                      {request.recipient?.name || 'Anonymous'}
                    </div>

                    {request.requiredBy && (
                      <div className="flex items-center text-sm text-rose-400">
                        <Clock className="h-4 w-4 mr-3" />
                        Needed by {new Date(request.requiredBy).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link
                      to={`/requests/${request._id}`}
                      className="flex-1 bg-slate-50 text-slate-600 text-center py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      Details
                    </Link>
                    {isAuthenticated && request.status === 'pending' && (
                      <button className="flex-1 bg-rose-400 text-white py-3 rounded-xl font-semibold hover:bg-rose-500 transition-colors shadow-sm shadow-rose-100">
                        Help
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredRequests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No requests found</h3>
            <p className="text-slate-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;