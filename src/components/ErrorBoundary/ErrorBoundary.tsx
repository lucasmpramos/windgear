import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md w-full">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Something went wrong</h2>
            <p className="text-gray-600 text-center mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Reload Page
              </button>
              <Link
                to="/"
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition text-center"
              >
                Back to Home
              </Link>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              If the problem persists, please contact support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;