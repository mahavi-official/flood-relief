import { useCallback, useRef, useState } from 'react';
import { useT } from '../i18n';
import { filledTooFast, honeypotTripped, rateLimited, recordSubmission } from './antispam';
import { enqueue, isFormConfigured, submitToGoogleForm } from './submit';
import type { FormKey } from '../site.config';

export type FormStatus = 'idle' | 'sending' | 'sent' | 'queued';

export function useReportForm(key: FormKey) {
  const t = useT();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const openedAt = useRef(Date.now());

  const send = useCallback(
    async (form: HTMLFormElement, values: Record<string, string>, opts?: { skipTimeTrap?: boolean }) => {
      setError(null);

      // Show a bot the same success screen a person gets: no feedback, no tuning.
      if (honeypotTripped(form)) {
        setStatus('sent');
        return;
      }
      if (!opts?.skipTimeTrap && filledTooFast(openedAt.current)) {
        setError(t.forms.errorTooFast);
        openedAt.current = 0;
        return;
      }
      if (rateLimited()) {
        setError(t.forms.errorRateLimit);
        return;
      }
      if (!isFormConfigured(key)) {
        setError(t.forms.notConfigured);
        return;
      }

      setStatus('sending');

      // Offline: keep it locally and let the connection come back to us.
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        enqueue(key, values);
        setStatus('queued');
        return;
      }

      try {
        await submitToGoogleForm(key, values);
        recordSubmission();
        setStatus('sent');
      } catch {
        // A failed send is never dropped — the report is worth more than the error.
        enqueue(key, values);
        setStatus('queued');
      }
    },
    [key, t],
  );

  const reset = useCallback(() => {
    openedAt.current = Date.now();
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, setError, send, reset };
}
