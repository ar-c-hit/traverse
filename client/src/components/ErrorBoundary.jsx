import React from 'react';
import { Compass, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Traverse ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-6 shadow-xl shadow-brand-500/10">
            <Compass className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Something took an unexpected turn
          </h1>
          <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
            We encountered a temporary interface hiccup. Click below to return safely to your journey.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {this.state.error && (
            <details className="mt-6 text-left max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs text-rose-300 font-mono">
              <summary className="cursor-pointer text-slate-400 font-bold hover:text-slate-200">
                Diagnostic Details
              </summary>
              <p className="whitespace-pre-wrap break-all mt-2 text-[11px] text-rose-400">
                {this.state.error.toString()}
              </p>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

