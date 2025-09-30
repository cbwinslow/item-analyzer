'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [report, setReport] = useState(null);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Item Analyzer', { body: 'Notifications enabled!' });
        }
      });
    }
  };

  const data = {
    labels: ['eBay', 'Facebook', 'Mercari'],
    datasets: [{ label: 'Similar Items', data: [10, 5, 8], backgroundColor: 'rgba(75, 192, 192, 0.6)' }],
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Item Analyzer</h1>
      <form className="space-y-4">
        <input type="file" multiple className="w-full p-2 border rounded" />
        <input type="text" placeholder="Description" className="w-full p-2 border rounded" />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Analyze</button>
        <button onClick={requestNotificationPermission} className="w-full p-2 bg-green-500 text-white rounded mt-2">Enable Notifications</button>
      </form>
      {report && (
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="mt-4 p-4 bg-gray-100 rounded">
          <h2>Report</h2>
          <Bar data={data} />
        </motion.div>
      )}
    </motion.div>
  );
}
