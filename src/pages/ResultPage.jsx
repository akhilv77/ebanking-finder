import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink, Search, Building2, Globe, Link2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProviderBadge from '@/components/ProviderBadge';
import LoginUrlList from '@/components/LoginUrlList';
import MatchedPatternsTable from '@/components/MatchedPatternsTable';

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const data = state?.data;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
            <Search className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">No result to display</p>
            <p className="text-sm text-gray-400 mt-1">Run a lookup first to see provider details.</p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            New Search
          </Button>
        </div>
      </div>
    );
  }

  const allProviders = data.all_providers
    ? data.all_providers.split(', ').map((p) => p.trim()).filter(Boolean)
    : [];

  function copyReport() {
    const loginUrlsText = data.login_urls?.length
      ? data.login_urls.map((u, i) => `  ${i + 1}. ${u}`).join('\n')
      : '  None detected';

    let patternsText = '';
    if (data.matched_patterns) {
      const segments = data.matched_patterns.split(' | ');
      patternsText = segments.map((s) => `  ${s}`).join('\n');
    } else {
      patternsText = '  None';
    }

    const text = `BankTech Finder — Provider Report
==================================
Bank URL:          ${data.bank_url || 'N/A'}
Primary Provider:  ${data.provider || 'Unknown'}
All Providers:     ${data.all_providers || 'N/A'}

Primary Login URL:
  ${data.login_url || 'None detected'}

All Login URLs:
${loginUrlsText}

Matched Patterns:
${patternsText}

Generated: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-[#0f1729] text-white">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            New Search
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-emerald-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">BankTech Finder</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyReport}
            className="gap-1.5 text-slate-300 hover:text-white hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Report
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6 space-y-5">
        {/* Provider Hero */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Bank URL bar */}
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
            <Globe className="h-4 w-4 text-gray-400" />
            <a
              href={data.bank_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-gray-600 hover:text-emerald-700 transition-colors truncate"
            >
              {data.bank_url}
            </a>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Primary Provider</p>
                  <ProviderBadge provider={data.provider || 'unknown'} large />
                </div>
                {allProviders.length > 1 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">All Detected</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allProviders.map((p) => (
                        <ProviderBadge key={p} provider={p} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Login URL */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100">
            <Link2 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Primary Login URL</h3>
          </div>
          <div className="px-6 py-4">
            {data.login_url ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-gray-700 truncate flex-1" title={data.login_url}>
                  {data.login_url}
                </span>
                <a
                  href={data.login_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${data.login_url} in new tab`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    Open <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No primary login URL detected</p>
            )}
          </div>
        </div>

        {/* All Login URLs */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">All Detected Login URLs</h3>
            </div>
            {data.login_urls?.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-500">
                {data.login_urls.length}
              </span>
            )}
          </div>
          <div className="px-6 py-4">
            <LoginUrlList loginUrls={data.login_urls} />
          </div>
        </div>

        {/* Detection Patterns */}
        {data.matched_patterns && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100">
              <Shield className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Detection Patterns</h3>
            </div>
            <div className="px-6 py-4">
              <MatchedPatternsTable matchedPatterns={data.matched_patterns} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
