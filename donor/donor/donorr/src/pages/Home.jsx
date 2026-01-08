import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight,
  PlayCircle,
  Camera,
  Globe,
  Megaphone,
  Zap,
  Heart,
  Package,
  MapPin,
  Sliders
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Camera, 
      title: 'Easy Donations',
      description: 'Donate essential items with just a few clicks. Snap a photo, list it, and help.',
      color: 'text-rose-400 bg-rose-50',
      path: '/easy-donations'
    },
    {
      icon: Globe, 
      title: 'Community Support',
      description: 'Connect with your community network and make a real difference in people\'s lives.',
      color: 'text-indigo-400 bg-indigo-50',
      path: '/community-support'
    },
    {
      icon: Megaphone, 
      title: 'Organized Drives',
      description: 'Participate in organized donation campaigns for maximum collective impact.',
      color: 'text-emerald-400 bg-emerald-50',
      path: '/organized-drives'
    },
    {
      icon: Zap, 
      title: 'Emergency Response',
      description: 'Quick response system for emergency situations. Speed is our priority.',
      color: 'text-amber-400 bg-amber-50',
      path: '/emergency-response'
    }
  ];

  const roles = [
    {
      id: 'donor', 
      icon: Heart, 
      title: 'Donor',
      description: 'List items for donation, track donations, and participate in emergency drives.',
      color: 'border-rose-100 bg-rose-50/50 text-rose-500'
    },
    {
      id: 'recipient',
      icon: Package, 
      title: 'Recipient',
      description: 'Request necessary items, track delivery, and provide feedback on donations.',
      color: 'border-indigo-100 bg-indigo-50/50 text-indigo-500'
    },
    {
      id: 'logistics',
      icon: MapPin, 
      title: 'Logistics Coordinator',
      description: 'Organize transportation, manage inventory, and ensure timely delivery.',
      color: 'border-emerald-100 bg-emerald-50/50 text-emerald-500'
    },
    {
      id: 'admin',
      icon: Sliders, 
      title: 'Admin',
      description: 'Oversee platform operations, manage donation drives, and ensure transparency.',
      color: 'border-violet-100 bg-violet-50/50 text-violet-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-indigo-50 opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-rose-100 text-rose-500 mb-8 animate-fade-in-up">
            <Heart className="h-4 w-4 mr-2 fill-current" />
            <span className="text-sm font-medium">Connecting Hearts, Changing Lives</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-slate-800 tracking-tight">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">Share With ShareBloom</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-slate-500 font-light leading-relaxed">
            Connect donors with those in need. Make a difference in your community through 
            organized donation drives and emergency response.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-rose-400 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-rose-200 hover:shadow-xl hover:bg-rose-500 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  Get Started
                </Link>
                
                <a 
                  href="https://youtu.be/O11qqYQI-YI?si=2WlfN7bix6JcD2ip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 text-slate-600 bg-white border border-slate-200 px-8 py-4 rounded-2xl font-semibold hover:bg-slate-50 hover:text-rose-500 transition-all duration-300 w-full sm:w-auto group"
                >
                  <PlayCircle className="h-5 w-5 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span>Why should we donate food</span>
                </a>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-all duration-300 inline-flex items-center"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section (Clickable Links) */}
      <section className="py-24 bg-white rounded-t-[3rem] shadow-sm -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Our platform makes it easy to donate, request, and coordinate essential items.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link 
                  to={feature.path}
                  key={index} 
                  className="text-center p-8 rounded-3xl border border-slate-50 hover:border-slate-100 hover:shadow-lg transition-all duration-300 group block cursor-pointer"
                >
                  <div className={`inline-flex p-4 rounded-2xl mb-6 ${feature.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section (Clickable Cards with Creative Icons) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Join Our Community
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Choose your role and start making a difference today.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <Link 
                  to="/register" 
                  state={{ role: role.id }}
                  key={index} 
                  className={`block p-8 rounded-[2rem] border ${role.color} hover:shadow-xl transition-all duration-300 bg-white cursor-pointer transform hover:-translate-y-1`}
                >
                  <div className="flex items-center mb-4">
                    <Icon className="h-7 w-7 mr-3" />
                    <h3 className="text-lg font-bold">
                      {role.title}
                    </h3>
                  </div>
                  <p className="text-sm opacity-80 leading-relaxed">
                    {role.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Motivation & Mission Section */}
      <section className="py-24 bg-slate-800 text-white rounded-3xl mx-4 lg:mx-8 mb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 w-64 h-64 bg-rose-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block p-4 rounded-full bg-slate-700/50 mb-8 backdrop-blur-sm">
            <Heart className="h-8 w-8 text-rose-400 fill-current" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight tracking-tight">
            Driven by <span className="text-rose-300">Compassion</span>,<br/> 
            Powered by <span className="text-indigo-300">Community</span>.
          </h2>
          
          <div className="space-y-6 text-lg md:text-xl text-slate-300 leading-relaxed font-light">
            <p>
              This project was born from a simple observation: <strong>abundance and need often exist side by side</strong>, separated only by the lack of a connection. We realized that kindness doesn't need to be complicated—it just needs a path.
            </p>
            <p>
              Our motivation is to build that path. To turn "I have extra" into "I have enough" for someone else. By streamlining the logistics of goodwill, we aim to ensure that no resource goes to waste and no plea for help goes unheard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;