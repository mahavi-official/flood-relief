import { useLang } from '../lib/i18n'

// Labels say "must fill" / "can skip" in words. An asterisk means nothing to
// someone using a website for the first time.
export function FieldLabel({ label, required, htmlFor }) {
  const { t } = useLang()
  return (
    <label className="field-label" htmlFor={htmlFor}>
      {label}
      <span className={`field-badge${required ? ' is-required' : ''}`}>
        {required ? t('required') : t('optional')}
      </span>
    </label>
  )
}

function wrap(Control) {
  return function FieldWrapper({ label, required, hint, ...props }) {
    return (
      <div className="field">
        <FieldLabel label={label} required={required} />
        <Control required={required} aria-label={label} {...props} />
        {hint && <p className="field-hint">{hint}</p>}
      </div>
    )
  }
}

export const TextField = wrap((props) => <input type="text" {...props} />)
export const TelField = wrap((props) => <input type="tel" inputMode="tel" {...props} />)
export const NumberField = wrap((props) => <input type="number" inputMode="numeric" {...props} />)
export const TextAreaField = wrap((props) => <textarea {...props} />)
export const DateTimeField = wrap((props) => <input type="datetime-local" {...props} />)

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
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}

export function PhotoField({ label, hint, onFile, fileName }) {
  return (
    <div className="field">
      <FieldLabel label={label} required={false} />
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || null)} aria-label={label} />
      {fileName && <p className="field-hint">{fileName}</p>}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}
