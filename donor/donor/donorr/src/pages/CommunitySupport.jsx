import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';

const CommunitySupport = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-indigo-400 hover:text-indigo-600 font-medium">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-50 text-indigo-400 mb-6">
            <Users className="h-10 w-10" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-800 mb-6">Community Support</h1>
          
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            Building a resilient community starts with connection. Our platform bridges the gap between neighbors,
            local organizations, and volunteers to create a safety net for everyone.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Verified Recipients</h3>
              <p className="text-slate-500">Ensure your help reaches those who genuinely need it through our verification system.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Local Focus</h3>
              <p className="text-slate-500">Connect with people in your immediate vicinity to minimize logistics and maximize impact.</p>
            </div>
          </div>

          <Link 
            to="/register" 
            className="inline-flex items-center px-8 py-4 bg-indigo-400 text-white rounded-2xl font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100"
          >
            Join the Community
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunitySupport;