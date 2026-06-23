import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <div>
          <h2 className="mt-6 text-center text-5xl font-extrabold text-red-600">
            403
          </h2>
          <p className="mt-2 text-center text-xl font-bold text-gray-900">
            Access Denied
          </p>
          <p className="mt-4 text-center text-sm text-gray-600">
            You do not have permission to access this module. If you believe this is a mistake, please contact your administrator.
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
