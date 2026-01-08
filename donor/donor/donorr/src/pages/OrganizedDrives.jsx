import { Link } from 'react-router-dom';
import { Package, Truck, ArrowRight } from 'lucide-react';

const OrganizedDrives = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-indigo-400 hover:text-indigo-600 font-medium">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <div className="inline-flex p-4 rounded-2xl bg-emerald-50 text-emerald-400 mb-6">
            <Package className="h-10 w-10" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-800 mb-6">Organized Drives</h1>
          
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            Scale your impact by participating in or organizing donation drives. Whether it's a winter coat drive, 
            a food bank collection, or a back-to-school kit assembly, we provide the tools to manage it all.
          </p>

          <div className="bg-emerald-50 rounded-2xl p-8 mb-10 border border-emerald-100">
            <h3 className="text-xl font-bold text-emerald-800 mb-4">What you can do:</h3>
            <ul className="space-y-4 text-emerald-700">
              <li className="flex items-center"><div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>Set collection goals and track progress live.</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>Manage volunteer shifts and logistics.</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>Coordinate bulk transport and drop-off points.</li>
            </ul>
          </div>

          <Link 
            to="/drives" 
            className="inline-flex items-center px-8 py-4 bg-emerald-400 text-white rounded-2xl font-semibold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100"
          >
            Explore Active Drives
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizedDrives;