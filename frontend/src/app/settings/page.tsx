'use client';

import { useState, useEffect } from 'react';

export default function Settings() {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    aiModel: 'claude-3-haiku',
    reportFormat: 'text'
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('userPreferences');
    if (saved) setPreferences(JSON.parse(saved));
  }, []);

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    alert('Preferences saved!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">User Preferences</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                className="mr-2"
              />
              Enable Notifications
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Default AI Model</label>
            <select
              value={preferences.aiModel}
              onChange={(e) => setPreferences({...preferences, aiModel: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="claude-3-haiku">Claude 3 Haiku</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="llama2">Llama 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Report Format</label>
            <select
              value={preferences.reportFormat}
              onChange={(e) => setPreferences({...preferences, reportFormat: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
          <button
            onClick={savePreferences}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}