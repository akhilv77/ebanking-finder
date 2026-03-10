import { useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Play, Square, Download, ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, Link2, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProviderBadge from '@/components/ProviderBadge';
import LoginUrlList from '@/components/LoginUrlList';
import MatchedPatternsTable from '@/components/MatchedPatternsTable';
import { lookupBank } from '@/lib/api';

function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{completed} of {total} completed</span>
        <span className="text-gray-500 font-medium">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === 'pending') return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />;
  if (status === 'success') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === 'error') return <XCircle className="h-4 w-4 text-red-500" />;
  return <div className="h-4 w-4 rounded-full border-2 border-gray-200" />;
}

function exportResults(rows) {
  const csvRows = [['bank_name', 'url', 'provider', 'all_providers', 'login_url', 'status']];
  for (const row of rows) {
    csvRows.push([
      row.bank_name,
      row.url,
      row.result?.provider || '',
      row.result?.all_providers || '',
      row.result?.login_url || '',
      row.status,
    ]);
  }
  const csv = csvRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'banktech_results.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkLookupPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [rows, setRows] = useState(() =>
    (state?.rows || []).map((r) => ({ ...r, status: 'idle', result: null, error: null }))
  );
  const [phase, setPhase] = useState('preview'); // preview | processing | complete
  const [expandedIdx, setExpandedIdx] = useState(null);
  const abortRef = useRef(false);

  const completed = rows.filter((r) => r.status === 'success' || r.status === 'error').length;
  const succeeded = rows.filter((r) => r.status === 'success').length;
  const failed = rows.filter((r) => r.status === 'error').length;

  const startLookup = useCallback(async () => {
    setPhase('processing');
    abortRef.current = false;

    for (let i = 0; i < rows.length; i++) {
      if (abortRef.current) break;

      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'pending' } : r)));

      try {
        const result = await lookupBank(rows[i].url);
        setRows((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: 'success', result } : r))
        );
      } catch (err) {
        setRows((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: 'error', error: err.message } : r))
        );
      }
    }

    setPhase('complete');
  }, [rows.length]);

  function stopLookup() {
    abortRef.current = true;
  }

  if (!state?.rows || state.rows.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
            <AlertCircle className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">No CSV data</p>
            <p className="text-sm text-gray-400 mt-1">Upload a CSV from the home page first.</p>
          </div>
          <Button onClick={() => navigate('/')} className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-[#0f1729] text-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            {phase === 'complete' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportResults(rows)}
                className="gap-1.5 text-slate-300 hover:text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
            {phase === 'preview' && <div className="w-20" />}
            {phase === 'processing' && <div className="w-20" />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6 space-y-5">
        {/* Summary Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
            <FileSpreadsheet className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Bulk Lookup</h2>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-gray-200/80 px-1.5 text-xs font-medium text-gray-600">
              {rows.length}
            </span>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {phase === 'preview' && <>{rows.length} bank{rows.length !== 1 ? 's' : ''} loaded from CSV — ready to process.</>}
                  {phase === 'processing' && <>Processing lookups…</>}
                  {phase === 'complete' && <>All lookups finished.</>}
                </p>
                {phase === 'complete' && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-emerald-700">{succeeded} succeeded</span>
                    </span>
                    {failed > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600">{failed} failed</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {phase === 'preview' && (
                  <Button onClick={startLookup} className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800">
                    <Play className="h-4 w-4" />
                    Start Lookup
                  </Button>
                )}
                {phase === 'processing' && (
                  <Button onClick={stopLookup} variant="outline" className="gap-2 text-red-600 border-red-300 hover:bg-red-50">
                    <Square className="h-3.5 w-3.5" />
                    Stop
                  </Button>
                )}
                {phase === 'complete' && (
                  <Button onClick={() => exportResults(rows)} variant="outline" className="gap-2 text-gray-700 border-gray-300 hover:bg-gray-50">
                    <Download className="h-4 w-4" />
                    Export Results
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        {phase !== 'preview' && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
            </div>
            <div className="px-6 py-4">
              <ProgressBar completed={completed} total={rows.length} />
            </div>
          </div>
        )}

        {/* Results Table Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">
                {phase === 'preview' ? 'Preview' : 'Results'}
              </h3>
            </div>
            {phase !== 'preview' && completed > 0 && (
              <span className="text-xs text-gray-400">Click a completed row to expand details</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  {phase !== 'preview' && (
                    <>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="w-10 px-3 py-3" />
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <RowGroup
                    key={i}
                    row={row}
                    index={i}
                    isExpanded={expandedIdx === i}
                    canExpand={row.status === 'success' && !!row.result}
                    phase={phase}
                    onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function RowGroup({ row, index, isExpanded, canExpand, phase, onToggle }) {
  const allProviders = row.result?.all_providers
    ? row.result.all_providers.split(', ').map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <>
      <tr
        className={`transition-colors ${canExpand ? 'cursor-pointer hover:bg-gray-50/80' : ''} ${isExpanded ? 'bg-emerald-50/40' : ''}`}
        onClick={canExpand ? onToggle : undefined}
      >
        <td className="px-6 py-3.5 text-gray-400 text-xs font-medium">{index + 1}</td>
        <td className="px-4 py-3.5 text-gray-800 font-medium">{row.bank_name || '—'}</td>
        <td className="px-4 py-3.5">
          <span className="font-mono text-xs text-gray-500 truncate block max-w-[300px]" title={row.url}>
            {row.url}
          </span>
        </td>
        {phase !== 'preview' && (
          <>
            <td className="px-4 py-3.5 text-center">
              <div className="flex items-center justify-center">
                <StatusIcon status={row.status} />
              </div>
            </td>
            <td className="px-4 py-3.5">
              {row.status === 'success' && row.result?.provider && (
                <ProviderBadge provider={row.result.provider} />
              )}
              {row.status === 'error' && (
                <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-0.5">
                  {row.error || 'Failed'}
                </span>
              )}
            </td>
            <td className="px-3 py-3.5 text-right">
              {canExpand && (
                isExpanded
                  ? <ChevronDown className="h-4 w-4 text-gray-400 inline-block" />
                  : <ChevronRight className="h-4 w-4 text-gray-400 inline-block" />
              )}
            </td>
          </>
        )}
      </tr>

      {isExpanded && row.result && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="bg-[#f5f6f8] border-y border-gray-200 px-8 py-5">
              <div className="space-y-4 max-w-3xl">
                {/* Primary Provider */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-8">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Primary Provider</p>
                        <ProviderBadge provider={row.result.provider || 'unknown'} large />
                      </div>
                      {allProviders.length > 1 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">All Detected</p>
                          <div className="flex flex-wrap gap-1.5">
                            {allProviders.map((p) => <ProviderBadge key={p} provider={p} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Login URLs */}
                {row.result.login_urls?.length > 0 && (
                  <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-3.5 w-3.5 text-gray-400" />
                        <h4 className="text-xs font-semibold text-gray-700">Login URLs</h4>
                      </div>
                      <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-500">
                        {row.result.login_urls.length}
                      </span>
                    </div>
                    <div className="px-5 py-3">
                      <LoginUrlList loginUrls={row.result.login_urls} />
                    </div>
                  </div>
                )}

                {/* Matched Patterns */}
                {row.result.matched_patterns && (
                  <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100">
                      <Shield className="h-3.5 w-3.5 text-gray-400" />
                      <h4 className="text-xs font-semibold text-gray-700">Detection Patterns</h4>
                    </div>
                    <div className="px-5 py-3">
                      <MatchedPatternsTable matchedPatterns={row.result.matched_patterns} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
