import { useMutation } from '@tanstack/react-query';
import { lookupBank } from '../lib/api';

export function useBankLookup() {
  return useMutation({ mutationFn: lookupBank });
}
