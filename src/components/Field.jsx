import { useLang } from '../lib/i18n'

export function FieldLabel({ label, required, hint }) {
  const { t } = useLang()
  return (
    <>
      <label className="field-label">
        {label}
        <span className="field-badge">{required ? t('required') : t('optional')}</span>
      </label>
      {hint && <div className="field-hint">{hint}</div>}
    </>
  )
}

export function TextField({ label, required, hint, ...inputProps }) {
  return (
    <div className="field">
      <FieldLabel label={label} required={required} />
      <input type="text" required={required} {...inputProps} />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

export function TelField({ label, required, hint, ...inputProps }) {
  return (
    <div className="field">
      <FieldLabel label={label} required={required} />
      <input type="tel" required={required} inputMode="tel" {...inputProps} />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

export function NumberField({ label, required, hint, ...inputProps }) {
  return (
    <div className="field">
      <FieldLabel label={label} required={required} />
      <input type="number" required={required} inputMode="numeric" {...inputProps} />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

export function TextAreaField({ label, required, hint, ...inputProps }) {
  return (
    <div className="field">
      <FieldLabel label={label} required={required} />
      <textarea required={required} {...inputProps} />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

export function DateTimeField({ label, required, hint, ...inputProps }) {
  return (
    <div className="field">
      <FieldLabel label={label} required={required} />
      <input type="datetime-local" required={required} {...inputProps} />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

// Single-select rendered as tappable chips — bigger touch targets than a
// native <select>, which matters for panicked, one-handed phone use.
export function ChipField({ label, required, hint, options, value, onChange, name }) {
  return (
    <div className="field">
      <FieldLabel label={label} required={required} />
      <div className="radio-row" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <label key={opt.value} className={`radio-chip${value === opt.value ? ' checked' : ''}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

export function PhotoField({ label, hint, onFile, fileName }) {
  return (
    <div className="field">
      <FieldLabel label={label} required={false} />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      {fileName && <div className="field-hint">{fileName}</div>}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}
