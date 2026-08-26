import { useMemo, useState, type FormEvent } from 'react';
import { fmt, localeNum, toAsciiDigits, useLang, useT } from '../i18n';
import { isLikelyPhone } from '../lib/format';
import { useHumanCheck } from '../lib/useHumanCheck';
import { useReportForm } from '../lib/useReportForm';
import { Layout } from '../components/Layout';
import { FormResult } from '../components/FormResult';
import {
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
  lastSeenPlace: '',
  reporterName: '',
  reporterPhone: '',
  age: '',
  gender: '',
  photoUrl: '',
  lastSeenAt: '',
  description: '',
  notes: '',
};

export default function ReportMissing() {
  const t = useT();
  const lang = useLang();
  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [answer, setAnswer] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { challenge, regenerate } = useHumanCheck();
  const form = useReportForm('missing');

  const set = useMemo(
    () => (field: keyof typeof EMPTY) => (value: string) =>
      setValues((prev) => ({ ...prev, [field]: value })),
    [],
  );

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!values.personName.trim()) next.personName = t.forms.errorRequired;
    if (!values.district) next.district = t.forms.errorRequired;
    if (!values.lastSeenPlace.trim()) next.lastSeenPlace = t.forms.errorRequired;
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
      <Layout page="reportMissing">
        <FormResult status={form.status} listPage="missing" onAnother={startOver} />
      </Layout>
    );
  }

  return (
    <Layout page="reportMissing">
      <div className="wrap">
        <h1>{t.missing.h1}</h1>
        <p className="lede">{t.missing.intro}</p>

        <form onSubmit={onSubmit} noValidate>
          <Honeypot />

          <TextField
            id="personName"
            label={t.missing.nameLabel}
            required
            value={values.personName}
            onChange={set('personName')}
            error={errors.personName}
            autoComplete="off"
          />
          <DistrictField
            id="district"
            required
            value={values.district}
            onChange={set('district')}
            error={errors.district}
          />
          <TextField
            id="lastSeenPlace"
            label={t.missing.lastSeenPlace}
            hint={t.missing.lastSeenPlaceHelp}
            required
            value={values.lastSeenPlace}
            onChange={set('lastSeenPlace')}
            error={errors.lastSeenPlace}
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
                id="lastSeenAt"
                label={t.missing.lastSeenAt}
                type="datetime-local"
                value={values.lastSeenAt}
                onChange={set('lastSeenAt')}
              />
              <TextAreaField
                id="description"
                label={t.missing.description}
                value={values.description}
                onChange={set('description')}
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
            {form.status === 'sending' ? t.common.submitting : t.missing.submitLabel}
          </button>
        </form>
      </div>
    </Layout>
  );
}
