import { useCallback, useEffect, useState } from 'react';
import { loadSheet, type SheetKey, type SheetResult } from './sheets';

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: SheetResult }
  | { status: 'error'; error: string };

export function useSheet(key: SheetKey) {
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = useCallback(
    (force = false) => {
      let cancelled = false;
      setState({ status: 'loading' });
      loadSheet(key, force)
        .then((data) => {
          if (!cancelled) setState({ status: 'ready', data });
        })
        .catch((error: unknown) => {
          if (!cancelled) setState({ status: 'error', error: String(error) });
        });
      return () => {
        cancelled = true;
      };
    },
    [key],
  );

  useEffect(() => load(), [load]);

  return { state, refresh: () => load(true) };
}
