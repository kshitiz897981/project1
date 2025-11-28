import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
      <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={`w-7 h-7 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{title}</p>
        {/* 'value' now contains the pre-formatted INR string (e.g., "₹1,50,000") */}
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;