export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type GeoError = 'denied' | 'unavailable' | 'timeout' | 'unsupported';

/**
 * One-shot location read. The timeout is generous because a phone with a weak
 * GPS lock in a flooded valley can take a while, and a slow fix is far better
 * than making someone type their location by hand.
 */
export function getPosition(timeoutMs = 20_000): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject('unsupported' as GeoError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) reject('denied' as GeoError);
        else if (err.code === err.TIMEOUT) reject('timeout' as GeoError);
        else reject('unavailable' as GeoError);
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30_000 },
    );
  });
}

/** Six decimals is roughly 10 cm — more than enough, and keeps the Sheet tidy. */
export function formatCoord(value: number): string {
  return value.toFixed(6);
}
