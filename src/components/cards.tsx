import { localeNum, useLang, useT } from '../i18n';
import { mapsHref, parseCoord, telHref, timeAgo } from '../lib/format';
import { conditionLabel, districtLabel, genderLabel, needLabel, splitNeeds } from '../lib/labels';
import type { SheetRow } from '../lib/sheets';

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function CallButton({ phone }: { phone?: string }) {
  const t = useT();
  if (!phone) return null;
  return (
    <a className="btn btn--sm" href={telHref(phone)}>
      {t.common.call} {phone}
    </a>
  );
}

export function MissingCard({ row }: { row: SheetRow }) {
  const t = useT();
  const lang = useLang();
  const v = row.values;

  return (
    <article className="card card--missing">
      <h3>{v.personName || t.common.unknown}</h3>
      <p className="card-time">{timeAgo(row.submittedAt, lang)}</p>
      <dl>
        <Row label={t.common.district} value={districtLabel(v.district ?? '', lang)} />
        <Row label={t.list.lastSeen} value={v.lastSeenPlace} />
        <Row label={t.missing.lastSeenAt} value={v.lastSeenAt} />
        <Row label={t.forms.age} value={v.age ? localeNum(v.age, lang) : ''} />
        <Row label={t.forms.gender} value={v.gender ? genderLabel(v.gender, t) : ''} />
        <Row label={t.missing.description} value={v.description} />
        <Row label={t.forms.notes} value={v.notes} />
        <Row label={t.list.reportedBy} value={v.reporterName} />
      </dl>
      <div className="card-actions">
        <CallButton phone={v.reporterPhone} />
        {v.photoUrl && (
          <a className="btn btn--sm btn--ghost" href={v.photoUrl} rel="noreferrer noopener">
            {t.forms.photoUrl}
          </a>
        )}
      </div>
    </article>
  );
}

export function FoundCard({ row }: { row: SheetRow }) {
  const t = useT();
  const lang = useLang();
  const v = row.values;

  return (
    <article className="card card--found">
      <h3>{v.personName || t.common.unknown}</h3>
      <p className="card-time">{timeAgo(row.submittedAt, lang)}</p>
      {v.condition && (
        <div className="chips">
          <span className="chip chip--neutral">{conditionLabel(v.condition, t)}</span>
        </div>
      )}
      <dl>
        <Row label={t.common.district} value={districtLabel(v.district ?? '', lang)} />
        <Row label={t.list.foundAt} value={v.currentLocation} />
        <Row label={t.found.shelteredAt} value={v.shelteredAt} />
        <Row label={t.forms.age} value={v.age ? localeNum(v.age, lang) : ''} />
        <Row label={t.forms.gender} value={v.gender ? genderLabel(v.gender, t) : ''} />
        <Row label={t.forms.notes} value={v.notes} />
        <Row label={t.list.reportedBy} value={v.reporterName} />
      </dl>
      <div className="card-actions">
        <CallButton phone={v.reporterPhone} />
        {v.photoUrl && (
          <a className="btn btn--sm btn--ghost" href={v.photoUrl} rel="noreferrer noopener">
            {t.forms.photoUrl}
          </a>
        )}
      </div>
    </article>
  );
}

export function HelpCard({ row }: { row: SheetRow }) {
  const t = useT();
  const lang = useLang();
  const v = row.values;
  const lat = parseCoord(v.latitude);
  const lng = parseCoord(v.longitude);

  return (
    <article className="card card--help">
      <h3>
        {v.locationText || districtLabel(v.district ?? '', lang) || t.list.helpH1}
      </h3>
      <p className="card-time">{timeAgo(row.submittedAt, lang)}</p>

      <div className="chips">
        {splitNeeds(v.needs ?? '').map((need) => (
          <span className="chip" key={need}>
            {needLabel(need, t)}
          </span>
        ))}
        {v.peopleCount && (
          <span className="chip chip--neutral">{localeNum(v.peopleCount, lang)} 👤</span>
        )}
      </div>

      <dl>
        <Row label={t.common.district} value={districtLabel(v.district ?? '', lang)} />
        <Row label={t.forms.notes} value={v.details} />
      </dl>

      <div className="card-actions">
        <CallButton phone={v.reporterPhone} />
        {lat !== null && lng !== null ? (
          <a className="btn btn--sm btn--ghost" href={mapsHref(lat, lng)} rel="noreferrer noopener">
            {t.common.openInMaps}
          </a>
        ) : (
          <span className="card-time">{t.list.mapNoCoords}</span>
        )}
      </div>
    </article>
  );
}
