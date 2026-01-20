import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from "../utils/api";
import { Package, Upload, MapPin, Calendar, CheckCircle, Locate, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateDonation = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [donationSummary, setDonationSummary] = useState(null); // Store data for success view
  
  // Refs for Leaflet Map
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch
  } = useForm();

  const category = watch('category');

  // --- Real Map Integration Logic ---
  useEffect(() => {
    let scriptLoaded = false;

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
        script.onload = () => {
          scriptLoaded = true;
          initMap();
        };
        document.body.appendChild(script);
      } else if (window.L) {
        setTimeout(initMap, 100);
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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
          window.L.circle([latitude, longitude], {
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.1,
            radius: 200
          }).addTo(map);
        },
        () => toast.error("Could not retrieve your location")
      );
    }

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = window.L.marker([lat, lng]).addTo(map);
      }

      try {
        const loadingToast = toast.loading("Fetching address...");
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        
        toast.dismiss(loadingToast);

        if (data && data.address) {
          const addr = data.address;
          const street = addr.road || addr.pedestrian || addr.suburb || "";
          const houseNumber = addr.house_number ? `${addr.house_number} ` : "";
          
          setValue('address', `${houseNumber}${street}`);
          setValue('city', addr.city || addr.town || addr.village || addr.county || "");
          setValue('state', addr.state || "");
          setValue('zipCode', addr.postcode || "");
          
          toast.success("Address found and filled!");
        } else {
          toast.error("Address details not found for this location.");
        }
      } catch (err) {
        toast.dismiss();
        toast.error("Failed to fetch address.");
      }
    });
  };
  // ----------------------------------

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const donationData = {
        ...data,
        images: images.map(img => img.url),
        location: {
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        },
        donorId: user.uid, 
        status: 'available',
        createdAt: new Date().toISOString()
      };

      // --- SIMULATION MODE START ---
      // We simulate a network request here to ensure the UI works even without a backend.
      // In a real production app, you would uncomment the api.post line.
      
      // await api.post('/donations', donationData); 
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fake 1.5s delay
      
      // Optional: Save to localStorage so you can potentially load it in Dashboard (mock persistence)
      const existingDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
      localStorage.setItem('mockDonations', JSON.stringify([donationData, ...existingDonations]));
      // --- SIMULATION MODE END ---

      // Save summary for display
      setDonationSummary({
        title: data.title,
        quantity: data.quantity,
        unit: data.unit
      });

      setIsSuccess(true);
      toast.success('Donation posted successfully!');
      
      // Redirect after showing the success screen
      setTimeout(() => {
        navigate('/dashboard');
      }, 4000);

    } catch (error) {
      console.error('Error creating donation:', error);
      toast.error('Failed to create donation. Please try again.');
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
      case 'food': return ['Canned Goods', 'Fresh Produce', 'Dairy', 'Grains', 'Beverages', 'Snacks'];
      case 'clothing': return ['Shirts', 'Pants', 'Dresses', 'Jackets', 'Shoes', 'Accessories'];
      case 'medical': return ['Medications', 'First Aid', 'Medical Equipment', 'Supplies'];
      case 'shelter': return ['Furniture', 'Bedding', 'Kitchen Items', 'Home Decor'];
      case 'education': return ['Books', 'School Supplies', 'Electronics', 'Art Supplies'];
      default: return ['Other'];
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-lg p-10 max-w-md w-full text-center animate-fade-in-up">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-emerald-100 mb-6">
            <CheckCircle className="h-12 w-12 text-emerald-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Thank You!</h2>
          <p className="text-slate-500 mb-6">
            Your donation has been posted.
          </p>

          {/* Donation Summary Card */}
          <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Item Added</span>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="font-bold text-slate-800 text-lg">{donationSummary?.title}</div>
            <div className="text-sm text-slate-500">
              {donationSummary?.quantity} {donationSummary?.unit} • Available for pickup
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center"
            >
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <p className="text-xs text-slate-400">
              Your dashboard will automatically update with this new contribution.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Create Donation</h1>
          <p className="mt-2 text-slate-500">
            Share items you no longer need with those who do
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Section 1: Item Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-500 h-8 w-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                Item Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Item Title *</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                    placeholder="e.g., Winter Jacket, Canned Food"
                  />
                  {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <div className="relative">
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all appearance-none"
                    >
                      <option value="">Select category</option>
                      <option value="food">Food</option>
                      <option value="clothing">Clothing</option>
                      <option value="medical">Medical</option>
                      <option value="shelter">Shelter</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                  {errors.category && <p className="mt-1 text-sm text-rose-400">{errors.category.message}</p>}
                </div>

                {category && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subcategory *</label>
                    <div className="relative">
                      <select
                        {...register('subcategory', { required: 'Subcategory is required' })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all appearance-none"
                      >
                        <option value="">Select subcategory</option>
                        {getSubcategories(category).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Condition *</label>
                  <div className="relative">
                    <select
                      {...register('condition', { required: 'Condition is required' })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all appearance-none"
                    >
                      <option value="">Select condition</option>
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
                  <input
                    {...register('quantity', { required: 'Quantity is required', min: 1 })}
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit *</label>
                  <input
                    {...register('unit', { required: 'Unit is required' })}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                    placeholder="e.g., pieces, kg, liters"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all resize-none"
                  placeholder="Describe the item, its condition, and any relevant details..."
                />
              </div>
            </div>

            {/* Section 2: Images */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-500 h-8 w-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                Images
              </h3>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 hover:bg-slate-50 transition-colors text-center">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-300" />
                  <div className="mt-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-slate-700 hover:text-indigo-500 transition-colors">
                        Click to upload images
                      </span>
                      <span className="mt-1 block text-sm text-slate-400">
                        PNG, JPG up to 10MB each
                      </span>
                    </label>
                    <input id="images" type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img src={image.url} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-xl border border-slate-100" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-rose-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md hover:bg-rose-500 transition-colors opacity-0 group-hover:opacity-100">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Location with Map Integration */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-500 h-8 w-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                Location
              </h3>
              
              <div className="mb-6 flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowMap(!showMap)} 
                  className="flex items-center text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
                >
                  <Locate className="h-4 w-4 mr-2" />
                  {showMap ? 'Hide Map' : 'Locate on Map'}
                </button>
              </div>

              {showMap && (
                <div className="mb-6">
                  <div 
                    ref={mapContainerRef} 
                    className="h-80 w-full rounded-xl border border-slate-200 shadow-inner z-0 relative"
                  />
                  <p className="text-center text-sm text-slate-500 mt-2">
                    Click anywhere on the map to automatically fill the address.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('address')}
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                      placeholder="Enter street address or use map"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                  />
                  {errors.city && <p className="mt-1 text-sm text-rose-400">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
                  <input
                    {...register('state', { required: 'State is required' })}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                  />
                  {errors.state && <p className="mt-1 text-sm text-rose-400">{errors.state.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                  <input
                    {...register('zipCode')}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                  />
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
                This is an emergency donation (for urgent situations)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-400 hover:bg-indigo-500 shadow-lg shadow-indigo-100 focus:outline-none transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Package className="h-4 w-4 mr-2" />}
                {loading ? 'Creating...' : 'Create Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDonation;