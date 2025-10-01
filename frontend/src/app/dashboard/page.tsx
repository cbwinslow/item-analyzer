'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, avgRating: 0 });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setAnalyses([
      { id: 1, description: 'Vintage Watch', date: '2024-01-15', status: 'completed' },
      { id: 2, description: 'Antique Vase', date: '2024-01-10', status: 'completed' }
    ]);
    setStats({ total: 2, thisMonth: 2, avgRating: 4.5 });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Total Analyses</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">This Month</h3>
            <p className="text-2xl font-bold text-green-600">{stats.thisMonth}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Avg Rating</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}/5</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          <div className="space-y-4">
            {analyses.map(analysis => (
              <div key={analysis.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h3 className="font-medium">{analysis.description}</h3>
                  <p className="text-sm text-gray-600">{analysis.date}</p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  analysis.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {analysis.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}