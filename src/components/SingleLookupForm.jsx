import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBankLookup } from '@/hooks/useBankLookup';

export default function SingleLookupForm() {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  const mutation = useBankLookup();

  useEffect(() => {
    if (mutation.isSuccess) {
      navigate('/result', { state: { data: mutation.data } });
    }
  }, [mutation.isSuccess, mutation.data, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setValidationError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('Please enter a valid URL including https://');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setValidationError('Please enter a valid URL including https://');
      return;
    }

    mutation.mutate(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="bank-url" className="text-sm font-medium text-gray-700">
          Bank Website URL
        </Label>
        <div className="flex gap-2">
          <Input
            id="bank-url"
            type="text"
            placeholder="https://www.examplebank.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={mutation.isPending}
            className="flex-1 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="h-10 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg px-5 font-medium shadow-sm"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Provider
              </>
            )}
          </Button>
        </div>
        {validationError && (
          <p className="text-sm text-red-600" role="alert">{validationError}</p>
        )}
      </div>

      {mutation.isPending && (
        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <div>
            <p className="text-sm font-medium text-emerald-900">Analyzing bank website...</p>
            <p className="text-xs text-emerald-600 animate-pulse">Detecting login pages and provider fingerprints</p>
          </div>
        </div>
      )}

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Lookup Failed</AlertTitle>
          <AlertDescription>
            {mutation.error?.message || 'Something went wrong. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
