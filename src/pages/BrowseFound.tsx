import { useT } from '../i18n';
import { BrowsePage } from '../components/BrowsePage';
import { FoundCard } from '../components/cards';

const SEARCH_FIELDS = ['personName', 'currentLocation', 'district', 'shelteredAt', 'notes'];

export default function BrowseFound() {
  const t = useT();
  return (
    <BrowsePage
      page="found"
      sheetKey="found"
      heading={t.list.foundH1}
      intro={t.list.foundIntro}
      searchFields={SEARCH_FIELDS}
      renderCard={(row) => <FoundCard row={row} />}
    />
  );
}
