import React from 'react';

function Card({ title, children }) {
  return (
    <div className="w-full h-full p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-transform hover:scale-[1.02] border border-gray-200 cursor-pointer flex flex-col justify-between">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
      <div className="text-gray-600 text-sm">{children}</div>
    </div>
  );
}

export default Card;
