import type { ReactNode } from 'react';
import { useLang, useT } from '../i18n';
import { DISTRICTS } from '../data/districts';
import { HONEYPOT_NAME } from '../lib/antispam';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

/** Label + hint + error, wired up for screen readers. */
export function Field({ id, label, hint, required, error, children }: FieldProps) {
  const t = useT();
  return (
    <div className={'field' + (error ? ' field--error' : '')}>
      <label htmlFor={id}>
        {label}
        <span className={'tag' + (required ? ' tag--req' : '')}>
          {required ? t.common.required : t.common.optional}
        </span>
      </label>
      {hint && (
        <span className="hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {children}
      {error && (
        <p className="error-text" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Points a control at both its hint and its error message, when each exists. */
function describedBy({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

interface InputProps extends FieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'tel' | 'number' | 'url' | 'datetime-local';
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'numeric';
  autoComplete?: string;
  maxLength?: number;
}

export function TextField({
  value,
  onChange,
  type = 'text',
  placeholder,
  inputMode,
  autoComplete,
  maxLength = 300,
  children: _children,
  ...field
}: Omit<InputProps, 'children'> & { children?: ReactNode }) {
  return (
    <Field {...field}>
      <input
        id={field.id}
        name={field.id}
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={field.required}
        aria-describedby={describedBy(field)}
        aria-invalid={field.error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({
  value,
  onChange,
  maxLength = 1200,
  ...field
}: Omit<FieldProps, 'children'> & {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <Field {...field}>
      <textarea
        id={field.id}
        name={field.id}
        value={value}
        maxLength={maxLength}
        required={field.required}
        aria-describedby={describedBy(field)}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  ...field
}: Omit<FieldProps, 'children'> & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <Field {...field}>
      <select
        id={field.id}
        name={field.id}
        value={value}
        required={field.required}
        aria-describedby={describedBy(field)}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * The district is stored in English no matter which language it was picked in,
 * so a Nepali reporter and an English volunteer filter on the same value.
 */
export function DistrictField(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}) {
  const t = useT();
  const lang = useLang();
  return (
    <SelectField
      {...props}
      label={t.common.district}
      hint={t.forms.districtHelp}
      placeholder={t.common.choose}
      options={DISTRICTS.map((d) => ({ value: d.en, label: lang === 'ne' ? d.ne : d.en }))}
    />
  );
}

export function GenderField(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useT();
  return (
    <SelectField
      {...props}
      label={t.forms.gender}
      placeholder={t.common.unknown}
      options={[
        { value: 'Male', label: t.forms.genderMale },
        { value: 'Female', label: t.forms.genderFemale },
        { value: 'Other', label: t.forms.genderOther },
      ]}
    />
  );
}

/** Big tap-target checkboxes or radios; used for "what do you need?". */
export function ChoiceGroup({
  legend,
  name,
  type,
  options,
  selected,
  onToggle,
  error,
}: {
  legend: string;
  name: string;
  type: 'checkbox' | 'radio';
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset className={'field choice-group' + (error ? ' field--error' : '')}>
      <legend className="field-label">{legend}</legend>
      <div className="choices">
        {options.map((o) => (
          <label className="choice" key={o.value}>
            <input
              type={type}
              name={name}
              value={o.value}
              checked={selected.includes(o.value)}
              onChange={() => onToggle(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Invisible to people, irresistible to bots. */
export function Honeypot() {
  return (
    <div className="honeypot" aria-hidden="true">
      <label htmlFor={HONEYPOT_NAME}>Leave this field empty</label>
      <input id={HONEYPOT_NAME} name={HONEYPOT_NAME} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function ConsentField({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  const t = useT();
  return (
    <div className="field">
      <p className="notice notice--warn">
        <strong>{t.forms.consentHeading}. </strong>
        {t.forms.publicWarning}
      </p>
      <label className="consent">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
        />
        <span>{t.forms.consentLabel}</span>
      </label>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
