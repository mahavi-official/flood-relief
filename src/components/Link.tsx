import { Link, type LinkProps } from 'react-router-dom';
import { useLang } from '../i18n';
import { pathFor, type PageKey } from '../routes';

type Props = Omit<LinkProps, 'to'> & { page: PageKey };

/** A link that always stays inside the reader's current language. */
export function L({ page, ...rest }: Props) {
  return <Link to={pathFor(page, useLang())} {...rest} />;
}
