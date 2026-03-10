export default function ProviderBadge({ provider, large = false }) {
  const className = large
    ? 'inline-flex items-center px-5 py-2 text-base font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md border border-gray-200 bg-gray-50 text-gray-700';

  return (
    <span className={className}>
      {provider}
    </span>
  );
}
