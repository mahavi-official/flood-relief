import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { TextField, TelField, NumberField, TextAreaField, DateTimeField, ChipField, PhotoField } from '../components/Field'
import SuccessPanel from '../components/SuccessPanel'
import { submitReport, HONEYPOT_FIELD, ApiError } from '../lib/api'
import { compressImage } from '../lib/compressImage'
import { APPS_SCRIPT_URL } from '../lib/config'

const initial = {
  name: '',
  district: '',
  location: '',
  reporterName: '',
  reporterPhone: '',
  age: '',
  gender: '',
  lastSeenAt: '',
  description: '',
  notes: ''
}

export default function MissingForm() {
  const { t } = useLang()
  const [form, setForm] = useState(initial)
  const [photo, setPhoto] = useState(null)
  const [photoName, setPhotoName] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handlePhoto(file) {
    if (!file) {
      setPhoto(null)
      setPhotoName('')
      return
    }
    setPhotoName(file.name)
    const b64 = await compressImage(file)
    setPhoto(b64)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.district || !form.location || !form.reporterName || !form.reporterPhone) {
      setStatus('error')
      setErrorMsg(t('errorRequired'))
      return
    }
    setStatus('submitting')
    setErrorMsg('')
    try {
      await submitReport('missing', { ...form, photo, [HONEYPOT_FIELD]: honeypot })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof ApiError && err.message === 'NOT_CONFIGURED' ? t('notConfigured') : t('errorGeneric'))
    }
  }

  if (status === 'done') {
    return (
      <div>
        <SuccessPanel
          descriptionKey="successMissing"
          listPath="/missing/list"
          onReset={() => {
            setForm(initial)
            setPhoto(null)
            setPhotoName('')
            setStatus('idle')
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">{t('missingTitle')}</h1>
      <p className="page-subtitle">{t('missingDesc')}</p>

      {!APPS_SCRIPT_URL && <div className="config-warning">{t('notConfigured')}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        {status === 'error' && <div className="form-error">{errorMsg}</div>}

        <TextField label={t('fldFullName')} required value={form.name} onChange={set('name')} />
        <TextField label={t('fldLastSeenDistrict')} required value={form.district} onChange={set('district')} />
        <TextAreaField label={t('fldLastSeenLocation')} required value={form.location} onChange={set('location')} />
        <TextField label={t('fldReporterName')} required value={form.reporterName} onChange={set('reporterName')} />
        <TelField label={t('fldReporterPhone')} required value={form.reporterPhone} onChange={set('reporterPhone')} />

        <NumberField label={t('fldAge')} value={form.age} onChange={set('age')} min="0" max="120" />
        <ChipField
          label={t('fldGender')}
          name="gender"
          value={form.gender}
          onChange={(v) => setForm((f) => ({ ...f, gender: v }))}
          options={[
            { value: 'male', label: t('fldGenderMale') },
            { value: 'female', label: t('fldGenderFemale') },
            { value: 'other', label: t('fldGenderOther') }
          ]}
        />
        <DateTimeField label={t('fldLastSeenDateTime')} value={form.lastSeenAt} onChange={set('lastSeenAt')} />
        <TextAreaField label={t('fldDescription')} value={form.description} onChange={set('description')} />
        <PhotoField label={t('fldPhoto')} hint={t('fldPhotoHint')} onFile={handlePhoto} fileName={photoName} />
        <TextAreaField label={t('fldNotes')} value={form.notes} onChange={set('notes')} />

        {/* Honeypot: hidden from real users, tempting to bots */}
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
          <button className="btn btn-primary tone-marigold" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
