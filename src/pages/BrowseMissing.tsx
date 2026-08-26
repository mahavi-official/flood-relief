import { useT } from '../i18n';
import { BrowsePage } from '../components/BrowsePage';
import { MissingCard } from '../components/cards';

const SEARCH_FIELDS = ['personName', 'lastSeenPlace', 'district', 'description', 'notes'];

export default function BrowseMissing() {
  const t = useT();
  return (
    <BrowsePage
      page="missing"
      sheetKey="missing"
      heading={t.list.missingH1}
      intro={t.list.missingIntro}
      searchFields={SEARCH_FIELDS}
      renderCard={(row) => <MissingCard row={row} />}
    />
  );
}
