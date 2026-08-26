import { localeNum, useLang, useT } from '../i18n';
import { EMERGENCY_NUMBERS } from '../site.config';
import { telHref } from '../lib/format';
import { Layout } from '../components/Layout';
import { L } from '../components/Link';

export default function Home() {
  const t = useT();
  const lang = useLang();

  return (
    <Layout page="home">
      <div className="wrap">
        <h1>{t.home.h1}</h1>
        <p className="lede">{t.home.intro}</p>

        <div className="actions">
          {/* SOS sits first and largest: it is the only action with a clock on it. */}
          <L page="sos" className="action action--sos">
            <strong>{t.home.sosTitle}</strong>
            <span>{t.home.sosDesc}</span>
          </L>
          <L page="reportMissing" className="action action--missing">
            <strong>{t.home.missingTitle}</strong>
            <span>{t.home.missingDesc}</span>
          </L>
          <L page="reportFound" className="action action--found">
            <strong>{t.home.foundTitle}</strong>
            <span>{t.home.foundDesc}</span>
          </L>
        </div>

        <section className="panel">
          <h2>{t.home.browseHeading}</h2>
          <p>{t.home.browseIntro}</p>
          <div className="btn-row">
            <L page="missing" className="btn btn--sm btn--ghost">
              {t.nav.browseMissing}
            </L>
            <L page="found" className="btn btn--sm btn--ghost">
              {t.nav.browseFound}
            </L>
            <L page="help" className="btn btn--sm btn--ghost">
              {t.nav.browseHelp}
            </L>
          </div>
          <p className="card-time" style={{ marginTop: 10, marginBottom: 0 }}>
            {t.home.lastUpdated}
          </p>
        </section>

        <section className="panel">
          <h2>{t.home.emergencyHeading}</h2>
          <p>{t.home.emergencyNote}</p>
          <ul className="emergency-list">
            {EMERGENCY_NUMBERS.map((item) => (
              <li key={item.number}>
                <a href={telHref(item.number)}>
                  <span>{item.label[lang]}</span>
                  <b>{localeNum(item.number, lang)}</b>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
}
