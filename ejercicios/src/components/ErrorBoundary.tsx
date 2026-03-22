import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center bg-gray-900'
      }, React.createElement('div', {
        className: 'max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg text-center border border-gray-700'
      }, [
        React.createElement(AlertCircle, {
          key: 'icon',
          className: 'w-16 h-16 text-red-400 mx-auto mb-4'
        }),
        React.createElement('h2', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-100 mb-2'
        }, 'Algo salió mal'),
        React.createElement('p', {
          key: 'message',
          className: 'text-gray-300 mb-4'
        }, this.state.error?.message || 'Ha ocurrido un error inesperado'),
        React.createElement('button', {
          key: 'button',
          className: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors',
          onClick: () => window.location.href = '/'
        }, 'Volver al Inicio')
      ]));
    }

    return this.props.children;
  }
}

export default ErrorBoundary;