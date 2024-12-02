import React from 'react';
import { useTranslation } from 'react-i18next';
import Auth from '../components/Auth';

function Login() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">{t('auth.welcomeToWindgear')}</h1>
      <Auth />
    </div>
  );
}

export default Login;