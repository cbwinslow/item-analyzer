'use client';

import { useState } from 'react';

export default function Prototype() {
  const [components, setComponents] = useState([]);

  const addComponent = (type) => {
    setComponents([...components, { type, id: Date.now() }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Rapid Prototyping Tool</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Components</h2>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => addComponent('button')} className="px-4 py-2 bg-blue-500 text-white rounded">Button</button>
            <button onClick={() => addComponent('input')} className="px-4 py-2 bg-green-500 text-white rounded">Input</button>
            <button onClick={() => addComponent('card')} className="px-4 py-2 bg-purple-500 text-white rounded">Card</button>
            <button onClick={() => addComponent('text')} className="px-4 py-2 bg-red-500 text-white rounded">Text</button>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 p-6 min-h-64">
          <h3 className="text-lg font-medium mb-4">Prototype Canvas</h3>
          {components.map(comp => (
            <div key={comp.id} className="mb-4 p-4 border rounded">
              {comp.type === 'button' && <button className="px-4 py-2 bg-blue-500 text-white rounded">Sample Button</button>}
              {comp.type === 'input' && <input type="text" placeholder="Sample Input" className="p-2 border rounded w-full" />}
              {comp.type === 'card' && <div className="p-4 bg-gray-100 rounded">Sample Card Content</div>}
              {comp.type === 'text' && <p>Sample Text Block</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}