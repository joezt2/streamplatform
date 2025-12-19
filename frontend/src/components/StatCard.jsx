import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', suffix = '' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-lg text-gray-500 ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;