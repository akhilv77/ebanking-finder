import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ProviderBadge from './ProviderBadge';

function parseMatchedPatterns(str) {
  if (!str) return [];

  return str.split(' | ').map((segment) => {
    const colonIdx = segment.indexOf(': ');
    if (colonIdx === -1) {
      return { provider: segment.trim(), pattern: '' };
    }

    const provider = segment.slice(0, colonIdx).trim();
    const detail = segment.slice(colonIdx + 2);

    const arrowIdx = detail.indexOf(' -> ');
    const pattern = arrowIdx === -1 ? detail.trim() : detail.slice(0, arrowIdx).trim();

    return { provider, pattern };
  });
}

export default function MatchedPatternsTable({ matchedPatterns }) {
  const rows = parseMatchedPatterns(matchedPatterns);
  if (rows.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</TableHead>
          <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pattern</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i} className="border-gray-100">
            <TableCell className="py-3">
              <ProviderBadge provider={row.provider} />
            </TableCell>
            <TableCell className="py-3">
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                {row.pattern}
              </code>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
