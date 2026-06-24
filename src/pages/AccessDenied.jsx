import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[color:var(--surface-primary,var(--kz-bg))]">
      <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-lg text-center bg-[color:var(--surface-primary,var(--kz-surface))] border border-[color:var(--border-color,var(--kz-border))]">
        <div>
          <h2 className="mt-6 text-center text-5xl font-extrabold text-red-600">
            403
          </h2>
          <p className="mt-2 text-center text-xl font-bold text-[color:var(--text-primary,var(--kz-text-primary))]">
            Access Denied
          </p>
          <p className="mt-4 text-center text-sm text-[color:var(--text-secondary,var(--kz-text-secondary))]">
            You do not have permission to access this module. If you believe this is a mistake, please contact your administrator.
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="kz-btn-primary w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
