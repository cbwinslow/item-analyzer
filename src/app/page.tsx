'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { config } from '../../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [report, setReport] = useState(null);
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUser({ token });
  }, []);

  const handleAuth = async (type: 'signup' | 'login', email: string, password: string) => {
    const response = await fetch(`/api/auth/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.data.user || data.data.session) {
      const token = data.data.session?.access_token;
      localStorage.setItem('token', token);
      setUser({ token, email });
    }
  };

  const loadItems = async () => {
    const response = await fetch('/api/items', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    setItems(data.data || []);
  };

  useEffect(() => {
    if (user) loadItems();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    setReport(data.report);
  };

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
      {!user ? (
        <div className="space-y-4">
          <input id="email" type="email" placeholder="Email" className="w-full p-2 border rounded" />
          <input id="password" type="password" placeholder="Password" className="w-full p-2 border rounded" />
          <button onClick={() => handleAuth('signup', (document.getElementById('email') as HTMLInputElement).value, (document.getElementById('password') as HTMLInputElement).value)} className="w-full p-2 bg-blue-500 text-white rounded">Signup</button>
          <button onClick={() => handleAuth('login', (document.getElementById('email') as HTMLInputElement).value, (document.getElementById('password') as HTMLInputElement).value)} className="w-full p-2 bg-green-500 text-white rounded">Login</button>
        </div>
      ) : (
        <>
          <button onClick={() => { localStorage.removeItem('token'); setUser(null); }} className="w-full p-2 bg-red-500 text-white rounded mb-4">Logout</button>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="images" type="file" multiple className="w-full p-2 border rounded" />
            <input name="description" type="text" placeholder="Description" className="w-full p-2 border rounded" />
            <input name="url" type="url" placeholder="Item URL" className="w-full p-2 border rounded" />
            <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" />
            <input name="phone" type="tel" placeholder="Phone" className="w-full p-2 border rounded" />
            <select name="format" className="w-full p-2 border rounded">
              <option value="text">Text</option>
              <option value="json">JSON</option>
            </select>
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Analyze</button>
            <button type="button" onClick={requestNotificationPermission} className="w-full p-2 bg-green-500 text-white rounded mt-2">Enable Notifications</button>
          </form>
          {report && (
            <motion.div initial={config.featureFlags.enableAnimations ? { y: 20 } : {}} animate={config.featureFlags.enableAnimations ? { y: 0 } : {}} className="mt-4 p-4 bg-gray-100 rounded">
              <h2>Report</h2>
              {config.featureFlags.enableCharts && <Bar data={data} />}
            </motion.div>
          )}
          <div className="mt-4">
            <h2>Your Items</h2>
            {items.map((item: any) => <div key={item.id}>{item.description}</div>)}
          </div>
        </>
      )}
    </motion.div>
  );
}
