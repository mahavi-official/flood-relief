import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { TelField, NumberField, TextAreaField, ChipField, TextField } from '../components/Field'
import SuccessPanel from '../components/SuccessPanel'
import { submitReport, HONEYPOT_FIELD, ApiError } from '../lib/api'
import { APPS_SCRIPT_URL } from '../lib/config'

const initial = {
  needType: '',
  contactPhone: '',
  locationText: '',
  numPeople: '',
  details: ''
}

export default function HelpForm() {
  const { t } = useLang()
  const [form, setForm] = useState(initial)
  const [coords, setCoords] = useState(null) // { lat, lng }
  const [geoState, setGeoState] = useState('locating') // locating | ok | failed
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    locate()
  }, [])

  function locate() {
    if (!navigator.geolocation) {
      setGeoState('failed')
      return
    }
    setGeoState('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoState('ok')
      },
      () => setGeoState('failed'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    )
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.needType || !form.contactPhone || (!coords && !form.locationText)) {
      setStatus('error')
      setErrorMsg(t('errorRequired'))
      return
    }
    setStatus('submitting')
    setErrorMsg('')
    try {
      await submitReport('help', {
        ...form,
        lat: coords?.lat ?? '',
        lng: coords?.lng ?? '',
        [HONEYPOT_FIELD]: honeypot
      })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof ApiError && err.message === 'NOT_CONFIGURED' ? t('notConfigured') : t('errorGeneric'))
    }
  }

  if (status === 'done') {
    return (
      <SuccessPanel
        descriptionKey="successHelp"
        listPath="/help/list"
        onReset={() => {
          setForm(initial)
          setStatus('idle')
          locate()
        }}
      />
    )
  }

  return (
    <div>
      <h1 className="page-title">{t('helpTitle')}</h1>
      <p className="page-subtitle">{t('helpUrgentNote')}</p>

      {!APPS_SCRIPT_URL && <div className="config-warning">{t('notConfigured')}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        {status === 'error' && <div className="form-error">{errorMsg}</div>}

        <div className={`geo-status${geoState === 'ok' ? ' is-ok' : ''}`}>
          {geoState === 'locating' && (
            <>
              <span className="spinner" />
              {t('fldLocationAuto')}
            </>
          )}
          {geoState === 'ok' && coords && <span>✓ {t('fldLocationOk')}</span>}
          {geoState === 'failed' && (
            <>
              <span>{t('fldLocationFailed')}</span>
              <button type="button" className="btn btn-outline btn-small" onClick={locate}>
                {t('fldLocationRetry')}
              </button>
            </>
          )}
        </div>

        <ChipField
          label={t('fldNeedType')}
          required
          name="needType"
          value={form.needType}
          onChange={(v) => setForm((f) => ({ ...f, needType: v }))}
          options={[
            { value: 'food', label: t('needFood') },
            { value: 'shelter', label: t('needShelter') },
            { value: 'medicine', label: t('needMedicine') },
            { value: 'other', label: t('needOther') }
          ]}
        />

        <TelField
          label={t('fldContactPhone')}
          hint={t('fldContactPhoneHint')}
          required
          value={form.contactPhone}
          onChange={set('contactPhone')}
        />

        {geoState === 'failed' && (
          <TextField
            label={t('fldLocation')}
            hint={t('fldLocationHint')}
            required
            value={form.locationText}
            onChange={set('locationText')}
          />
        )}

        <NumberField label={t('fldNumPeople')} value={form.numPeople} onChange={set('numPeople')} min="1" />
        <TextAreaField label={t('fldDetails')} value={form.details} onChange={set('details')} />

        <div className="honeypot-field" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary tone-crimson" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? t('submitting') : t('sosBtn')}
          </button>
        </div>
      </form>

      <Link to="/" className="page-back">
        {t('backHome')}
      </Link>
    </div>
  )
}
