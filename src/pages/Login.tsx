import React from 'react';
import Auth from '../components/Auth';

function Login() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to Windgear</h1>
      <Auth />
    </div>
  );
}

export default Login;