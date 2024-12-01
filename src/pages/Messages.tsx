import React from 'react';
import { useStore } from '../store/useStore';

function Messages() {
  const { user } = useStore();

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Please sign in to view your messages</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-center">No messages yet</p>
        </div>
      </div>
    </div>
  );
}

export default Messages;