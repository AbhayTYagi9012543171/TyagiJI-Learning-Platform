import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep diagnostics local; do not send learner data to an external service.
    if (import.meta.env.DEV) {
      console.error('TyagiJI render error:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="tj-fatal-error" role="alert">
          <span className="tj-fatal-error__icon"><AlertTriangle size={24} /></span>
          <h1>Something interrupted this page.</h1>
          <p>Your learning data has not been intentionally changed. Reload the page to try again.</p>
          <button type="button" className="btn primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Reload page
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
