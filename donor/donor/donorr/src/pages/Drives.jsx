import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Sparkles, Search, MapPin, UsersRound, Timer, AlertTriangle, TrendingUp, Filter, Check, X, Calendar, Info, Plus, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Drives = () => {
  const { isAuthenticated, user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', isEmergency: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [joinedDrives, setJoinedDrives] = useState(new Set());
  
  // Modals State
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // New Drive Form State
  const [newDrive, setNewDrive] = useState({
    title: '',
    description: '',
    category: 'food',
    targetRecipients: '',
    endDate: '',
    city: '',
    state: '',
    address: '',
    isEmergency: false
  });

  useEffect(() => { fetchDrives(); }, [filters]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      // Construct query params
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.isEmergency) params.append('isEmergency', filters.isEmergency);

      const response = await api.get(`/drives?${params.toString()}`);
      
      // If backend returns empty or error, we might fall back to empty array 
      // (Removed mock data overwrite to ensure we see DB data)
      setDrives(response.data.drives || []); 
    } catch (error) {
      console.error(error);
      // Fallback for demo if API fails
      setDrives([]); 
      toast.error("Failed to load drives from database");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      toast.error("Unauthorized action");
      return;
    }

    try {
      setCreating(true);
      
      const driveData = {
        title: newDrive.title,
        description: newDrive.description,
        category: newDrive.category,
        targetRecipients: Number(newDrive.targetRecipients),
        endDate: newDrive.endDate,
        isEmergency: newDrive.isEmergency,
        location: {
          city: newDrive.city,
          state: newDrive.state,
          address: newDrive.address
        },
        status: 'active',
        organizer: user.name || 'Admin',
        progress: { totalDonations: 0 }
      };

      // --- Store in Database ---
      const res = await api.post('/drives', driveData);
      
      // Update UI
      setDrives(prev => [res.data.drive || driveData, ...prev]);
      setShowCreateModal(false);
      setNewDrive({ title: '', description: '', category: 'food', targetRecipients: '', endDate: '', city: '', state: '', address: '', isEmergency: false });
      toast.success("Drive created successfully!");

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create drive");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinDrive = async (driveId) => {
    if (!isAuthenticated) {
      toast.error("Please login to join a drive");
      return;
    }
    try {
      // await api.post(`/drives/${driveId}/join`); // Uncomment for real API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulation
      setJoinedDrives(prev => new Set(prev).add(driveId));
      
      setDrives(current => current.map(d => 
        d._id === driveId ? { ...d, volunteers: [...(d.volunteers || []), 'me'] } : d
      ));
      
      if (selectedDrive && selectedDrive._id === driveId) {
        setSelectedDrive(prev => ({ ...prev, volunteers: [...(prev.volunteers || []), 'me'] }));
      }

      toast.success("Successfully joined the drive!");
    } catch (error) {
      toast.error("Failed to join drive");
    }
  };

  const filteredDrives = drives.filter(drive =>
    drive.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'upcoming': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'completed': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 py-12 animate-fade-in relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-12 relative">
          <div className="text-center animate-slide-down">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <h1 className="text-5xl font-light text-slate-800 tracking-tight">Donation Drives</h1>
              <Sparkles className="h-6 w-6 text-blue-400" />
            </div>
            <p className="mt-4 text-slate-400 text-lg font-light">Join organized drives and make a collective impact</p>
          </div>

          {/* Admin Create Button */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-8 px-8 py-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-full font-semibold shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Create New Drive
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100/50 p-8 mb-12 transition-all duration-500 hover:shadow-md">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
              <input
                type="text"
                placeholder="Search for drives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-purple-50/50 border border-purple-100/50 rounded-2xl focus:ring-2 focus:ring-purple-200/50 focus:border-purple-200 outline-none transition-all duration-300 text-slate-600 placeholder:text-slate-300"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select onChange={(e) => setFilters({...filters, category: e.target.value})} className="px-6 py-4 border border-blue-100/50 rounded-2xl bg-blue-50/50 text-slate-600 outline-none transition-all duration-300 hover:bg-blue-50 cursor-pointer">
                <option value="">All Categories</option>
                <option value="food">Food</option>
                <option value="clothing">Clothing</option>
                <option value="medical">Medical</option>
                <option value="shelter">Shelter</option>
                <option value="education">Education</option>
              </select>
              <select onChange={(e) => setFilters({...filters, status: e.target.value})} className="px-6 py-4 border border-purple-100/50 rounded-2xl bg-purple-50/50 text-slate-600 outline-none transition-all duration-300 hover:bg-purple-50 cursor-pointer">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
              <select onChange={(e) => setFilters({...filters, isEmergency: e.target.value})} className="px-6 py-4 border border-rose-100/50 rounded-2xl bg-rose-50/50 text-slate-600 outline-none transition-all duration-300 hover:bg-rose-50 cursor-pointer">
                <option value="">Any Priority</option>
                <option value="true">Emergency Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
          {loading ? (
             <div className="col-span-full flex justify-center py-20 text-slate-400">
               <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
             </div>
          ) : filteredDrives.map((drive) => {
            const daysLeft = getDaysRemaining(drive.endDate);
            const progress = Math.min((drive.progress?.totalDonations || 0) / (drive.targetRecipients || 1) * 100, 100);
            const isJoined = joinedDrives.has(drive._id);

            return (
              <div key={drive._id} className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100/50 overflow-hidden flex flex-col group hover:-translate-y-2">
                <div className="p-8 border-b border-slate-50/50 bg-gradient-to-br from-purple-50/20 to-blue-50/20">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-700 line-clamp-2 group-hover:text-purple-500 transition-all duration-300">
                      {drive.title}
                    </h3>
                    {drive.isEmergency && <AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse flex-shrink-0" />}
                  </div>
                  <div className="flex gap-2 mb-5 flex-wrap">
                    <span className={`px-4 py-1.5 text-xs font-medium rounded-full border ${getStatusColor(drive.status)}`}>{drive.status}</span>
                    <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-slate-50 text-slate-500 border border-slate-100 capitalize">{drive.category}</span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{drive.description}</p>
                </div>

                <div className="p-8 pt-6 flex-1 flex flex-col">
                  <div className="space-y-4 mb-6">
                    {drive.location && (
                      <div className="flex items-center text-sm text-slate-400 bg-purple-50/30 px-4 py-2.5 rounded-xl">
                        <MapPin className="h-4 w-4 mr-3 text-purple-400" />
                        {drive.location.city}, {drive.location.state}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-slate-400 bg-blue-50/30 px-4 py-2.5 rounded-xl">
                      <UsersRound className="h-4 w-4 mr-3 text-blue-400" />
                      {drive.volunteers?.length || 0} joined
                    </div>
                    <div className="flex items-center text-sm text-slate-400 bg-pink-50/30 px-4 py-2.5 rounded-xl">
                      <Timer className="h-4 w-4 mr-3 text-pink-400" />
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> <span>Progress</span>
                      </div>
                      <span className="text-purple-500 font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-2.5 shadow-inner">
                      <div className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => setSelectedDrive(drive)}
                      className="flex-1 bg-purple-50 text-purple-600 py-3.5 rounded-2xl font-medium border border-purple-100 hover:bg-purple-100 hover:shadow-md transition-all duration-300"
                    >
                      Details
                    </button>
                    {isAuthenticated && drive.status === 'active' && (
                      <button 
                        onClick={() => handleJoinDrive(drive._id)}
                        disabled={isJoined}
                        className={`flex-1 py-3.5 rounded-2xl font-medium transition-all duration-300 shadow-sm hover:shadow-lg flex items-center justify-center ${isJoined ? 'bg-emerald-500 text-white cursor-default' : 'bg-gradient-to-r from-purple-400 to-blue-400 text-white hover:from-purple-500 hover:to-blue-500'}`}
                      >
                        {isJoined ? <><Check className="h-4 w-4 mr-2" /> Joined</> : 'Join'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {!loading && filteredDrives.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            {user?.role === 'admin' ? "No drives found. Create one!" : "No drives available at the moment."}
          </div>
        )}
      </div>

      {/* CREATE DRIVE MODAL (ADMIN ONLY) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Create New Drive</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drive Title</label>
                <input 
                  required
                  value={newDrive.title} 
                  onChange={(e) => setNewDrive({...newDrive, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none"
                  placeholder="e.g. Winter Clothing Collection"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    value={newDrive.category}
                    onChange={(e) => setNewDrive({...newDrive, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="food">Food</option>
                    <option value="clothing">Clothing</option>
                    <option value="medical">Medical</option>
                    <option value="shelter">Shelter</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
                  <input 
                    type="number" 
                    required
                    value={newDrive.targetRecipients} 
                    onChange={(e) => setNewDrive({...newDrive, targetRecipients: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. 500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  rows="3"
                  value={newDrive.description} 
                  onChange={(e) => setNewDrive({...newDrive, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  placeholder="Describe the drive..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={newDrive.endDate} 
                    onChange={(e) => setNewDrive({...newDrive, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input 
                    required
                    value={newDrive.city} 
                    onChange={(e) => setNewDrive({...newDrive, city: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. New York"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input 
                    required
                    value={newDrive.state} 
                    onChange={(e) => setNewDrive({...newDrive, state: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                  <input 
                    required
                    value={newDrive.address} 
                    onChange={(e) => setNewDrive({...newDrive, address: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    placeholder="Drop-off location"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100 cursor-pointer" onClick={() => setNewDrive(p => ({...p, isEmergency: !p.isEmergency}))}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${newDrive.isEmergency ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-300'}`}>
                  {newDrive.isEmergency && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm font-medium text-rose-700">Mark as Emergency Drive</span>
              </div>

              <button 
                type="submit" 
                disabled={creating}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
              >
                {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Publish Drive
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-up border border-white/50">
            <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 p-8 flex flex-col justify-end">
              <button 
                onClick={() => setSelectedDrive(null)} 
                className="absolute top-6 right-6 p-2 rounded-full bg-white/50 hover:bg-white text-slate-500 hover:text-rose-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-white/80 text-slate-600`}>
                  {selectedDrive.category}
                </span>
                {selectedDrive.isEmergency && (
                  <span className="px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-rose-500 text-white flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Emergency
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-slate-800">{selectedDrive.title}</h2>
            </div>
            
            <div className="p-10">
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-2"><MapPin className="h-4 w-4"/> Location</div>
                    <div className="font-semibold text-slate-700">{selectedDrive.location.address}</div>
                    <div className="text-sm text-slate-500">{selectedDrive.location.city}, {selectedDrive.location.state}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-2"><Calendar className="h-4 w-4"/> Deadline</div>
                    <div className="font-semibold text-slate-700">{new Date(selectedDrive.endDate).toLocaleDateString()}</div>
                    <div className="text-sm text-slate-500">{getDaysRemaining(selectedDrive.endDate)} days remaining</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-400" /> About this Drive
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{selectedDrive.description}</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-purple-600 uppercase tracking-wide">Goal Progress</span>
                      <span className="text-3xl font-bold text-purple-800">{selectedDrive.progress.totalDonations} <span className="text-lg font-normal text-purple-400">/ {selectedDrive.targetRecipients} items</span></span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="w-full bg-white rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-blue-400 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((selectedDrive.progress.totalDonations / (selectedDrive.targetRecipients || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {selectedDrive.organizer ? selectedDrive.organizer[0] : 'O'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase">Organized by</span>
                      <span className="font-medium text-slate-700">{selectedDrive.organizer || 'Community Org'}</span>
                    </div>
                  </div>
                  
                  {isAuthenticated && selectedDrive.status === 'active' && (
                    <button 
                      onClick={() => handleJoinDrive(selectedDrive._id)}
                      disabled={joinedDrives.has(selectedDrive._id)}
                      className={`px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${joinedDrives.has(selectedDrive._id) ? 'bg-emerald-500 cursor-default' : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'}`}
                    >
                      {joinedDrives.has(selectedDrive._id) ? 'Joined Successfully' : 'Join Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drives;