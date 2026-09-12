import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <AlertTriangle className="text-red-500" size={28} />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">Oops!</h3>
    <p className="text-gray-400 mb-4 max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <RefreshCw size={16} /> Try Again
      </button>
    )}
  </div>
);

export default ErrorState;
