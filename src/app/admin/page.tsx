'use client';

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Admin() {
  const [analytics, setAnalytics] = useState({ actions: {}, users: 0 });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const response = await fetch('/api/analytics');
    const data = await response.json();
    setAnalytics(data);
  };

  const data = {
    labels: Object.keys(analytics.actions),
    datasets: [{ label: 'Actions', data: Object.values(analytics.actions), backgroundColor: 'rgba(75, 192, 192, 0.6)' }],
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2>Total Users</h2>
          <p className="text-3xl">{analytics.users}</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2>Actions Overview</h2>
          <Bar data={data} />
        </div>
      </div>
    </div>
  );
}