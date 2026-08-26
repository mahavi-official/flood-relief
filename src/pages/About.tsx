import { useT } from '../i18n';
import { Layout } from '../components/Layout';

export default function About() {
  const t = useT();
  return (
    <Layout page="about">
      <div className="wrap prose">
        <h1>{t.about.h1}</h1>

        <h2>{t.about.flowHeading}</h2>
        <ol>
          <li>{t.about.step1}</li>
          <li>{t.about.step2}</li>
          <li>{t.about.step3}</li>
          <li>{t.about.step4}</li>
        </ol>

        <h2>{t.about.limitsHeading}</h2>
        <ul>
          <li>{t.about.limit1}</li>
          <li>{t.about.limit2}</li>
          <li>{t.about.limit3}</li>
          <li>{t.about.limit4}</li>
        </ul>

        <h2>{t.about.volunteerHeading}</h2>
        <p>{t.about.volunteerBody}</p>
      </div>
    </Layout>
  );
}
