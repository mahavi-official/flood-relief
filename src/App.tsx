import type { ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LANGS, LangProvider, type Lang } from './i18n';
import { PAGE_KEYS, pathFor, type PageKey } from './routes';
import Home from './pages/Home';
import ReportMissing from './pages/ReportMissing';
import ReportFound from './pages/ReportFound';
import Sos from './pages/Sos';
import BrowseMissing from './pages/BrowseMissing';
import BrowseFound from './pages/BrowseFound';
import BrowseHelp from './pages/BrowseHelp';
import Safety from './pages/Safety';
import About from './pages/About';
import NotFound from './pages/NotFound';
import './styles/global.css';

const COMPONENTS: Record<PageKey, ComponentType> = {
  home: Home,
  reportMissing: ReportMissing,
  reportFound: ReportFound,
  sos: Sos,
  missing: BrowseMissing,
  found: BrowseFound,
  help: BrowseHelp,
  safety: Safety,
  about: About,
};

/**
 * Every page exists twice — once at the root in Nepali, once under /en — so each
 * language has its own indexable URL and its own <title>.
 */
export function App() {
  return (
    <Routes>
      {LANGS.flatMap((lang: Lang) =>
        PAGE_KEYS.map((key) => {
          const Page = COMPONENTS[key];
          return (
            <Route
              key={`${lang}-${key}`}
              path={pathFor(key, lang)}
              element={
                <LangProvider lang={lang}>
                  <Page />
                </LangProvider>
              }
            />
          );
        }),
      )}
      <Route
        path="*"
        element={
          <LangProvider lang="ne">
            <NotFound />
          </LangProvider>
        }
      />
    </Routes>
  );
}
