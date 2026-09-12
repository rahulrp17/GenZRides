import React from 'react';
import { motion as Motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <Motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6"
      >
        <Icon className="text-slate-400" size={32} />
      </Motion.div>
    )}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && (
      <p className="text-gray-400 mb-6 max-w-sm">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;
