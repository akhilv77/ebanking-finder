import { ExternalLink } from 'lucide-react';

export default function LoginUrlList({ loginUrls }) {
  if (!loginUrls || loginUrls.length === 0) {
    return <p className="text-sm italic text-gray-400">No additional login URLs found</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {loginUrls.map((url, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500 shrink-0">
            {i + 1}
          </span>
          <span className="font-mono text-sm text-gray-700 truncate flex-1" title={url}>
            {url}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${url} in new tab`}
            className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ))}
    </div>
  );
}
