import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Users, Upload, MapPin, Calendar, AlertCircle, Locate, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateRequest = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [showMap, setShowMap] = useState(false);

  // Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setValue, // Added for map auto-fill
    formState: { errors },
    watch
  } = useForm();

  const category = watch('category');

  // --- Map Initialization Logic (Same as CreateDonation) ---
  useEffect(() => {
    if (showMap) {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else if (window.L) {
        initMap();
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap]);

  const initMap = () => {
    if (mapInstanceRef.current || !mapContainerRef.current || !window.L) return;

    const map = window.L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 15);
        window.L.circle([latitude, longitude], { color: 'blue', radius: 200 }).addTo(map);
      });
    }

    // Click Handler
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      else markerRef.current = window.L.marker([lat, lng]).addTo(map);

      // Reverse Geocode
      try {
        toast.loading("Fetching address...", { id: "geoLoad" });
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        toast.dismiss("geoLoad");

        if (data && data.address) {
          const addr = data.address;
          setValue('address', addr.road || "");
          setValue('city', addr.city || addr.town || "");
          setValue('state', addr.state || "");
          setValue('zipCode', addr.postcode || "");
          toast.success("Address filled!");
        }
      } catch (err) {
        toast.error("Could not fetch address details.");
      }
    });
  };
  // -----------------------------------------------------

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const requestData = {
        ...data,
        images: images.map(img => img.url),
        location: {
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        }
      };

      await api.post('/requests', requestData);
      toast.success('Request created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, { file, url: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getSubcategories = (category) => {
    switch (category) {
      case 'food':
        return ['Canned Goods', 'Fresh Produce', 'Dairy', 'Grains', 'Beverages', 'Snacks'];
      case 'clothing':
        return ['Shirts', 'Pants', 'Dresses', 'Jackets', 'Shoes', 'Accessories'];
      case 'medical':
        return ['Medications', 'First Aid', 'Medical Equipment', 'Supplies'];
      case 'shelter':
        return ['Furniture', 'Bedding', 'Kitchen Items', 'Home Decor'];
      case 'education':
        return ['Books', 'School Supplies', 'Electronics', 'Art Supplies'];
      default:
        return ['Other'];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Create Request</h1>
          <p className="mt-2 text-slate-500">
            Let the community know what you need
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Section 1: Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 h-7 w-7 rounded-full flex items-center justify-center mr-3 text-xs font-bold border border-indigo-200">1</span>
                Item Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                    Item Title *
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g., Winter Jacket"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Select category</option>
                    <option value="food">Food</option>
                    <option value="clothing">Clothing</option>
                    <option value="medical">Medical</option>
                    <option value="shelter">Shelter</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-rose-400">{errors.category.message}</p>
                  )}
                </div>

                {category && (
                  <div>
                    <label htmlFor="subcategory" className="block text-sm font-semibold text-slate-700 mb-2">
                      Subcategory *
                    </label>
                    <select
                      {...register('subcategory', { required: 'Subcategory is required' })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Select subcategory</option>
                      {getSubcategories(category).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="quantity" className="block text-sm font-semibold text-slate-700 mb-2">
                    Quantity Needed *
                  </label>
                  <input
                    {...register('quantity', { 
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="unit" className="block text-sm font-semibold text-slate-700 mb-2">
                    Unit *
                  </label>
                  <input
                    {...register('unit', { required: 'Unit is required' })}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g., pieces"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  placeholder="Describe what you need..."
                />
              </div>
            </div>

            {/* Section 2: Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 h-7 w-7 rounded-full flex items-center justify-center mr-3 text-xs font-bold border border-indigo-200">2</span>
                Images
              </h3>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors text-center cursor-pointer group">
                <div className="text-center">
                  <Upload className="mx-auto h-10 w-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  <div className="mt-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-slate-700 hover:text-indigo-500 transition-colors">
                        Upload images
                      </span>
                      <span className="mt-1 block text-sm text-slate-400">
                        PNG, JPG up to 10MB each
                      </span>
                    </label>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative h-20 w-20 flex-shrink-0">
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover rounded-xl border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Location (Updated with Map) */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 h-7 w-7 rounded-full flex items-center justify-center mr-3 text-xs font-bold border border-indigo-200">3</span>
                  Location
                </h3>
                <button type="button" onClick={() => setShowMap(!showMap)} className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 flex items-center transition-colors">
                  <Locate className="h-4 w-4 mr-1.5" />
                  {showMap ? 'Hide Map' : 'Use Map'}
                </button>
              </div>

              {showMap && (
                <div ref={mapContainerRef} className="h-64 w-full rounded-2xl border border-slate-200 shadow-inner z-0 relative" />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input {...register('address')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="Street Address" />
                </div>
                <input {...register('city', { required: true })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="City" />
                <input {...register('state', { required: true })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="State" />
                <input {...register('zipCode')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="ZIP Code" />
              </div>
            </div>

            {/* Section 4: Urgency */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 h-7 w-7 rounded-full flex items-center justify-center mr-3 text-xs font-bold border border-indigo-200">4</span>
                Priority & Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority Level</label>
                  <select {...register('priority', { required: true })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Urgency Type</label>
                  <select {...register('urgency', { required: true })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Select...</option>
                    <option value="normal">Normal</option>
                    <option value="emergency">Emergency</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Required By</label>
                  <input type="date" {...register('requiredBy')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
            </div>

            {/* Emergency Checkbox */}
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center">
              <input
                {...register('isEmergency')}
                type="checkbox"
                id="isEmergency"
                className="h-5 w-5 text-rose-500 focus:ring-rose-400 border-rose-200 rounded"
              />
              <label htmlFor="isEmergency" className="ml-3 block text-sm font-medium text-rose-700">
                This is an emergency request (for urgent situations)
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-100 transition-all flex items-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                {loading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;