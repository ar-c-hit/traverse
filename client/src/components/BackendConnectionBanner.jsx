import React, { useState, useEffect } from 'react';
import { Server, Check, X, ExternalLink } from 'lucide-react';
import { API_BASE_URL, setApiBaseUrl } from '../utils/apiConfig';

const BackendConnectionBanner = () => {
  const [show, setShow] = useState(false);
  const [renderUrl, setRenderUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Only prompt on remote domains (like vercel.app) when no API URL is configured or when backend is missing
    const isRemote = typeof window !== 'undefined' && 
      !window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('127.0.0.1');

    if (isRemote && !API_BASE_URL) {
      setShow(true);
    }

    const handleMissing = () => {
      setShow(true);
    };

    window.addEventListener('traverse:backend_missing', handleMissing);
    return () => {
      window.removeEventListener('traverse:backend_missing', handleMissing);
    };
  }, []);

  if (!show) return null;

  const handleConnect = (e) => {
    e.preventDefault();
    if (!renderUrl.trim()) return;

    let clean = renderUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }

    setApiBaseUrl(clean);
    setSaved(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border-b border-amber-500/40 px-4 py-2.5 text-xs text-amber-200 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span>
            <strong className="text-amber-300">Connect Render Backend:</strong> Paste your Render Web Service URL to enable live database & chat:
          </span>
        </div>

        <form onSubmit={handleConnect} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            required
            placeholder="https://your-backend.onrender.com"
            value={renderUrl}
            onChange={(e) => setRenderUrl(e.target.value)}
            className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 w-full sm:w-64"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{saved ? 'Connected!' : 'Connect'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BackendConnectionBanner;

