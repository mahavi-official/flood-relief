import { useT } from '../i18n';
import { SITE } from '../site.config';
import { Layout } from '../components/Layout';

export default function Safety() {
  const t = useT();
  return (
    <Layout page="safety">
      <div className="wrap prose">
        <h1>{t.safety.h1}</h1>

        <h2>{t.safety.publicHeading}</h2>
        <p>{t.safety.publicBody}</p>

        <h2>{t.safety.risksHeading}</h2>
        <ul>
          <li>{t.safety.risk1}</li>
          <li>{t.safety.risk2}</li>
          <li>{t.safety.risk3}</li>
          <li>{t.safety.risk4}</li>
        </ul>

        <h2>{t.safety.accuracyHeading}</h2>
        <p>{t.safety.accuracyBody}</p>

        <h2>{t.safety.childrenHeading}</h2>
        <p>{t.safety.childrenBody}</p>

        <h2>{t.safety.removeHeading}</h2>
        <p>
          {t.safety.removeBody}
          {SITE.moderatorContact && ' '}
          {SITE.moderatorContact && <a href={`mailto:${SITE.moderatorContact}`}>{SITE.moderatorContact}</a>}
        </p>
      </div>
    </Layout>
  );
}
