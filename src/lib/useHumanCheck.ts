import { useCallback, useEffect, useState } from 'react';
import { makeChallenge, type MathChallenge } from './antispam';

/**
 * The sum has to be generated in the browser, not while prerendering: a random
 * number baked into the static HTML would differ from the one React generates on
 * hydration, and it would be identical for every visitor served that file.
 * Null means "not ready yet", which lasts only until the first effect runs.
 */
export function useHumanCheck() {
  const [challenge, setChallenge] = useState<MathChallenge | null>(null);

  useEffect(() => setChallenge(makeChallenge()), []);

  const regenerate = useCallback(() => setChallenge(makeChallenge()), []);

  return { challenge, regenerate };
}
