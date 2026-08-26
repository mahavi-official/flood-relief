import { useMemo, useState, type FormEvent } from 'react';
import { fmt, localeNum, toAsciiDigits, useLang, useT } from '../i18n';
import { isLikelyPhone } from '../lib/format';
import { useHumanCheck } from '../lib/useHumanCheck';
import { useReportForm } from '../lib/useReportForm';
import { Layout } from '../components/Layout';
import { FormResult } from '../components/FormResult';
import {
  ChoiceGroup,
  ConsentField,
  DistrictField,
  GenderField,
  Honeypot,
  TextAreaField,
  TextField,
} from '../components/fields';

const EMPTY = {
  personName: '',
  district: '',
  currentLocation: '',
  reporterName: '',
  reporterPhone: '',
  age: '',
  gender: '',
  photoUrl: '',
  condition: '',
  shelteredAt: '',
  notes: '',
};

export default function ReportFound() {
  const t = useT();
  const lang = useLang();
  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [answer, setAnswer] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { challenge, regenerate } = useHumanCheck();
  const form = useReportForm('found');

  const set = useMemo(
    () => (field: keyof typeof EMPTY) => (value: string) =>
      setValues((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const conditions = [
    { value: 'Safe', label: t.found.conditionSafe },
    { value: 'Injured', label: t.found.conditionInjured },
    { value: 'Needs medical attention', label: t.found.conditionMedical },
    { value: 'Deceased', label: t.found.conditionDeceased },
  ];

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!values.personName.trim()) next.personName = t.forms.errorRequired;
    if (!values.district) next.district = t.forms.errorRequired;
    if (!values.currentLocation.trim()) next.currentLocation = t.forms.errorRequired;
    if (!values.reporterName.trim()) next.reporterName = t.forms.errorRequired;
    if (!values.reporterPhone.trim()) next.reporterPhone = t.forms.errorRequired;
    else if (!isLikelyPhone(values.reporterPhone)) next.reporterPhone = t.forms.errorPhone;
    if (!challenge || Number(toAsciiDigits(answer)) !== challenge.answer)
      next.answer = t.forms.humanCheckError;
    if (!consent) next.consent = t.forms.errorConsent;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    void form.send(event.currentTarget, values);
  }

  function startOver() {
    setValues(EMPTY);
    setConsent(false);
    setAnswer('');
    setErrors({});
    regenerate();
    form.reset();
  }

  if (form.status === 'sent' || form.status === 'queued') {
    return (
      <Layout page="reportFound">
        <FormResult status={form.status} listPage="found" onAnother={startOver} />
      </Layout>
    );
  }

  return (
    <Layout page="reportFound">
      <div className="wrap">
        <h1>{t.found.h1}</h1>
        <p className="lede">{t.found.intro}</p>

        <form onSubmit={onSubmit} noValidate>
          <Honeypot />

          <TextField
            id="personName"
            label={t.found.nameLabel}
            required
            value={values.personName}
            onChange={set('personName')}
            error={errors.personName}
            autoComplete="off"
          />
          {/* One tap fills the name when nobody knows it — a very common case. */}
          <div className="btn-row" style={{ marginTop: -10, marginBottom: 18 }}>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => set('personName')(t.found.unknownName)}
            >
              {t.found.unknownName}
            </button>
          </div>

          <DistrictField
            id="district"
            required
            value={values.district}
            onChange={set('district')}
            error={errors.district}
          />
          <TextField
            id="currentLocation"
            label={t.found.currentLocation}
            hint={t.found.currentLocationHelp}
            required
            value={values.currentLocation}
            onChange={set('currentLocation')}
            error={errors.currentLocation}
          />
          <TextField
            id="reporterName"
            label={t.forms.reporterName}
            required
            value={values.reporterName}
            onChange={set('reporterName')}
            error={errors.reporterName}
            autoComplete="name"
          />
          <TextField
            id="reporterPhone"
            label={t.forms.reporterPhone}
            hint={t.forms.reporterPhoneHelp}
            placeholder={t.forms.phonePlaceholder}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={values.reporterPhone}
            onChange={set('reporterPhone')}
            error={errors.reporterPhone}
          />

          <ChoiceGroup
            legend={t.found.condition}
            name="condition"
            type="radio"
            options={conditions}
            selected={values.condition ? [values.condition] : []}
            onToggle={(v) => set('condition')(v)}
          />

          <details className="panel">
            <summary style={{ cursor: 'pointer', fontWeight: 600, minHeight: 32 }}>
              {t.forms.notes} ({t.common.optional})
            </summary>
            <div style={{ marginTop: 14 }}>
              <TextField
                id="age"
                label={t.forms.age}
                type="number"
                inputMode="numeric"
                value={values.age}
                onChange={set('age')}
              />
              <GenderField id="gender" value={values.gender} onChange={set('gender')} />
              <TextField
                id="shelteredAt"
                label={t.found.shelteredAt}
                value={values.shelteredAt}
                onChange={set('shelteredAt')}
              />
              <TextField
                id="photoUrl"
                label={t.forms.photoUrl}
                hint={t.forms.photoUrlHelp}
                type="url"
                value={values.photoUrl}
                onChange={set('photoUrl')}
              />
              <TextAreaField
                id="notes"
                label={t.forms.notes}
                value={values.notes}
                onChange={set('notes')}
              />
            </div>
          </details>

          {challenge && (
            <TextField
              id="answer"
              label={fmt(t.forms.humanCheck, {
                a: localeNum(challenge.a, lang),
                b: localeNum(challenge.b, lang),
              })}
              required
              inputMode="numeric"
              maxLength={4}
              value={answer}
              onChange={setAnswer}
              error={errors.answer}
            />
          )}

          <ConsentField checked={consent} onChange={setConsent} error={errors.consent} />

          {form.error && (
            <p className="notice notice--error" role="alert">
              {form.error}
            </p>
          )}

          <button type="submit" className="btn" disabled={form.status === 'sending'}>
            {form.status === 'sending' ? t.common.submitting : t.found.submitLabel}
          </button>
        </form>
      </div>
    </Layout>
  );
}
