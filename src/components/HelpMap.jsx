import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLang } from '../lib/i18n'

const KATHMANDU = [27.7172, 85.324]

const needColor = {
  food: '#e8a33d',
  shelter: '#1e7a73',
  medicine: '#c8372e',
  other: '#6b6b70'
}

function pinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);transform:rotate(-45deg)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 14]
  })
}

export default function HelpMap({ rows }) {
  const { t } = useLang()
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    mapRef.current = L.map(mapEl.current, { attributionControl: true }).setView(KATHMANDU, 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current)
    layerRef.current = L.layerGroup().addTo(mapRef.current)
    return () => mapRef.current.remove()
  }, [])

  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.clearLayers()
    const points = rows.filter((r) => r.lat && r.lng)
    points.forEach((r) => {
      const marker = L.marker([Number(r.lat), Number(r.lng)], { icon: pinIcon(needColor[r.needType] || needColor.other) })
      marker.bindPopup(
        `<strong>${escapeHtml(t(needLabelKey(r.needType)))}</strong><br/>` +
          (r.numPeople ? `${escapeHtml(String(r.numPeople))} ${escapeHtml(t('peopleCount'))}<br/>` : '') +
          (r.details ? `${escapeHtml(r.details)}<br/>` : '') +
          (r.contactPhone ? `<a href="tel:${escapeHtml(r.contactPhone)}">${escapeHtml(r.contactPhone)}</a>` : '')
      )
      marker.addTo(layerRef.current)
    })
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((r) => [Number(r.lat), Number(r.lng)]))
      mapRef.current.fitBounds(bounds.pad(0.2), { maxZoom: 13 })
    }
  }, [rows, t])

  return <div className="map-wrap" ref={mapEl} />
}

function needLabelKey(needType) {
  if (needType === 'food') return 'needFood'
  if (needType === 'shelter') return 'needShelter'
  if (needType === 'medicine') return 'needMedicine'
  return 'needOther'
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
