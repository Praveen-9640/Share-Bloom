import { Link } from 'react-router-dom';
import { Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

const EmergencyResponse = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-indigo-400 hover:text-indigo-600 font-medium">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <div className="inline-flex p-4 rounded-2xl bg-amber-50 text-amber-400 mb-6">
            <Calendar className="h-10 w-10" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-800 mb-6">Emergency Response</h1>
          
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            When disaster strikes, speed is critical. Our platform activates a dedicated emergency mode to 
            mobilize resources instantly for floods, fires, or other crises.
          </p>

          <div className="border-l-4 border-amber-400 pl-6 mb-10 py-2">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Rapid Mobilization</h3>
            <p className="text-slate-500">
              Emergency requests are pinned to the top of all dashboards. Notifications are sent to 
              nearby donors and logistics coordinators immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {['Food & Water', 'Medical Aid', 'Temporary Shelter'].map((item) => (
              <div key={item} className="bg-amber-50 rounded-xl p-4 text-center font-medium text-amber-600">
                {item}
              </div>
            ))}
          </div>

          <Link 
            to="/register" 
            className="inline-flex items-center px-8 py-4 bg-amber-400 text-white rounded-2xl font-semibold hover:bg-amber-500 transition-all shadow-lg shadow-amber-100"
          >
            Join Emergency Network
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponse;