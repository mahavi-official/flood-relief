import { Suspense, lazy, useState } from 'react';
import { useT } from '../i18n';
import { BrowsePage } from '../components/BrowsePage';
import { HelpCard } from '../components/cards';
import type { SheetRow } from '../lib/sheets';

// Leaflet plus its stylesheet is ~150 KB. It is downloaded the first time
// somebody taps "Map" and never on the list view, which is the default.
const HelpMap = lazy(() => import('../components/HelpMap'));

const SEARCH_FIELDS = ['locationText', 'district', 'needs', 'details'];

export default function BrowseHelp() {
  const t = useT();
  const [view, setView] = useState<'list' | 'map'>('list');

  return (
    <BrowsePage
      page="help"
      sheetKey="help"
      heading={t.list.helpH1}
      intro={t.list.helpIntro}
      searchFields={SEARCH_FIELDS}
      renderCard={(row) => <HelpCard row={row} />}
      toolbar={() => (
        <>
          <div className="tabs" role="group" aria-label={t.list.viewList + ' / ' + t.list.viewMap}>
            <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
              {t.list.viewList}
            </button>
            <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
              {t.list.viewMap}
            </button>
          </div>
          {view === 'list' && <p className="card-time">{t.list.mapHint}</p>}
        </>
      )}
    >
      {(rows: SheetRow[]) =>
        view === 'map' ? (
          <Suspense fallback={<p className="panel">{t.list.mapLoading}</p>}>
            <HelpMap rows={rows} />
          </Suspense>
        ) : rows.length === 0 ? (
          <p className="panel">{t.common.noResults}</p>
        ) : (
          <ul className="cards">
            {rows.map((row) => (
              <li key={row.id}>
                <HelpCard row={row} />
              </li>
            ))}
          </ul>
        )
      }
    </BrowsePage>
  );
}
