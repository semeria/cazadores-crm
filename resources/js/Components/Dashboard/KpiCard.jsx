import React from 'react';

export default function KpiCard({ title, value, icon, colorClass }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-full ${colorClass} text-white mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}
