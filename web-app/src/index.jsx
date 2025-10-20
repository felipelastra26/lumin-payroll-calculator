import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import './styles/index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const root = document.getElementById('root');
if (root) {
  ReactDOM?.createRoot(root)?.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}