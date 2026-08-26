import { useT } from '../i18n';
import type { PageKey } from '../routes';
import type { FormStatus } from '../lib/useReportForm';
import { L } from './Link';

/**
 * Shown after a send. "Queued" is a genuinely different outcome from "sent" and
 * says so plainly, rather than pretending an offline report is already public.
 */
export function FormResult({
  status,
  listPage,
  onAnother,
  sentBody,
}: {
  status: Extract<FormStatus, 'sent' | 'queued'>;
  listPage: PageKey;
  onAnother: () => void;
  sentBody?: string;
}) {
  const t = useT();
  const queued = status === 'queued';

  return (
    <div className="wrap">
      <div className={'panel ' + (queued ? 'notice--warn' : 'notice--ok')}>
        <h1>{queued ? t.forms.queuedHeading : t.forms.successHeading}</h1>
        <p>{queued ? t.forms.queuedBody : (sentBody ?? t.forms.successBody)}</p>
        <div className="btn-row">
          <L page={listPage} className="btn btn--sm">
            {t.forms.viewList}
          </L>
          <button type="button" className="btn btn--sm btn--ghost" onClick={onAnother}>
            {t.forms.sendAnother}
          </button>
        </div>
      </div>
    </div>
  );
}
