import { Link } from 'react-router-dom';
import { Heart, CheckCircle, ArrowRight } from 'lucide-react';

const EasyDonations = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-indigo-400 hover:text-indigo-600 font-medium">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <div className="inline-flex p-4 rounded-2xl bg-rose-50 text-rose-400 mb-6">
            <Heart className="h-10 w-10" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-800 mb-6">Easy Donations</h1>
          
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            We've simplified the process of giving back. Whether you have food, clothing, medical supplies, 
            or household items, donating is now as easy as taking a photo and clicking a button.
          </p>

          <div className="space-y-6 mb-10">
            {[
              "Create a listing in under 2 minutes.",
              "Upload photos directly from your phone.",
              "Coordinate pickup or drop-off seamlessly.",
              "Track the impact of your donation in real-time."
            ].map((item, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600 text-lg">{item}</span>
              </div>
            ))}
          </div>

          <Link 
            to="/register" 
            state={{ role: 'donor' }}
            className="inline-flex items-center px-8 py-4 bg-rose-400 text-white rounded-2xl font-semibold hover:bg-rose-500 transition-all shadow-lg shadow-rose-100"
          >
            Start Donating
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EasyDonations;