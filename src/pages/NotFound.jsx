import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { THEME_COLORS } from '../constants/colors';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"
          style={{ backgroundColor: THEME_COLORS.deepBlue }}
        ></div>
        <div 
          className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"
          style={{ backgroundColor: THEME_COLORS.cyan }}
        ></div>
        <div 
          className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"
          style={{ backgroundColor: THEME_COLORS.gold }}
        ></div>
      </div>

      <div className="max-w-lg w-full space-y-8 text-center relative z-10 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center justify-center">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-md transform -rotate-6"
            style={{ 
              background: `linear-gradient(135deg, ${THEME_COLORS.deepBlue}, ${THEME_COLORS.deepBlueDark})` 
            }}
          >
            <FileQuestion size={40} className="text-white" strokeWidth={2} />
          </div>
          
          <h1 
            className="text-8xl font-black tracking-tighter mb-2"
            style={{ 
              color: THEME_COLORS.deepBlue,
              textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
            }}
          >
            404
          </h1>
          
          <h2 
            className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-3"
          >
            Page Not Found
          </h2>
          
          <p className="text-base text-gray-500 max-w-sm mx-auto mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="kz-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base w-full sm:w-auto"
            >
              <Home className="h-5 w-5" />
              Return Home
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="kz-btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base w-full sm:w-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-xs text-gray-400 font-medium tracking-wide">
        KAIZEN PLATFORM
      </div>
    </div>
  );
};

export default NotFound;
