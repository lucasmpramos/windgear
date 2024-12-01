import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './components/AuthProvider';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Footer from './components/Footer';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ProductListPage = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const EditProduct = lazy(() => import('./pages/EditProduct'));
const CreateProduct = lazy(() => import('./pages/CreateProduct'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Messages = lazy(() => import('./pages/Messages'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Admin = lazy(() => import('./pages/Admin'));
const AuthCallback = lazy(() => import('./components/AuthCallback'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ErrorBoundary>
          <AuthProvider>
            <div className="flex flex-col min-h-screen bg-gray-100 pt-16">
              <ScrollToTop />
              <Navbar />
              
              {/* Main content area */}
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-24">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />

                  {/* Protected routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/new"
                    element={
                      <ProtectedRoute>
                        <CreateProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/:id/edit"
                    element={
                      <ProtectedRoute>
                        <EditProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <Messages />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 route */}
                  <Route
                    path="*"
                    element={
                      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                        <p className="text-gray-600 mb-8">Page not found</p>
                        <a
                          href="/"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Go back home
                        </a>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
              </main>

              <Footer />

              {/* Toast notifications */}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
}

export default App;