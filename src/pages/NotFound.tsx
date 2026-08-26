import { useT } from '../i18n';
import { Layout } from '../components/Layout';
import { L } from '../components/Link';

export default function NotFound() {
  const t = useT();
  return (
    <Layout page="home">
      <div className="wrap prose">
        <h1>{t.notFound.h1}</h1>
        <p>{t.notFound.body}</p>
        <L page="home" className="btn">
          {t.notFound.cta}
        </L>
      </div>
    </Layout>
  );
}
