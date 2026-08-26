import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang, useT } from '../i18n';
import { mapsHref, parseCoord, telHref, timeAgo } from '../lib/format';
import { needLabel, splitNeeds } from '../lib/labels';
import type { SheetRow } from '../lib/sheets';

/** Roughly the centre of Nepal, used until we have at least one pin to fit to. */
const NEPAL_CENTRE: [number, number] = [28.3949, 84.124];

/**
 * A CSS-drawn pin rather than Leaflet's default marker images: it saves two
 * image requests per map load and cannot break when the bundler rewrites paths.
 */
const pin = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#c62828;border:3px solid #fff;box-shadow:0 0 0 1px #8e1c1c"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function HelpMap({ rows }: { rows: SheetRow[] }) {
  const t = useT();
  const lang = useLang();

  const points = useMemo(
    () =>
      rows
        .map((row) => ({
          row,
          lat: parseCoord(row.values.latitude),
          lng: parseCoord(row.values.longitude),
        }))
        .filter((p): p is { row: SheetRow; lat: number; lng: number } => p.lat !== null && p.lng !== null),
    [rows],
  );

  const bounds = points.length > 0 ? L.latLngBounds(points.map((p) => [p.lat, p.lng])) : null;

  return (
    <div className="map-holder">
      <MapContainer
        center={NEPAL_CENTRE}
        zoom={7}
        bounds={bounds ?? undefined}
        boundsOptions={{ padding: [30, 30], maxZoom: 13 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={18}
        />
        {points.map(({ row, lat, lng }) => (
          <Marker key={row.id} position={[lat, lng]} icon={pin}>
            <Popup>
              <strong>{row.values.locationText || t.list.helpH1}</strong>
              <br />
              {splitNeeds(row.values.needs ?? '')
                .map((need) => needLabel(need, t))
                .join(', ')}
              <br />
              <span>{timeAgo(row.submittedAt, lang)}</span>
              <br />
              {row.values.reporterPhone && (
                <a href={telHref(row.values.reporterPhone)}>
                  {t.common.call} {row.values.reporterPhone}
                </a>
              )}
              <br />
              <a href={mapsHref(lat, lng)} rel="noreferrer noopener">
                {t.common.openInMaps}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
