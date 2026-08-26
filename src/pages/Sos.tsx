import { useCallback, useState, type FormEvent } from 'react';
import { fmt, localeNum, useLang, useT } from '../i18n';
import { formatCoord, getPosition, type GeoError, type Position } from '../lib/geo';
import { isLikelyPhone, telHref } from '../lib/format';
import { useReportForm } from '../lib/useReportForm';
import { Layout } from '../components/Layout';
import { FormResult } from '../components/FormResult';
import { ChoiceGroup, DistrictField, Honeypot, TextAreaField, TextField } from '../components/fields';

type LocationState =
  | { kind: 'idle' }
  | { kind: 'locating' }
  | { kind: 'ok'; position: Position }
  | { kind: 'failed'; reason: GeoError };

export default function Sos() {
  const t = useT();
  const lang = useLang();
  const [started, setStarted] = useState(false);
  const [location, setLocation] = useState<LocationState>({ kind: 'idle' });
  const [needs, setNeeds] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [locationText, setLocationText] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const form = useReportForm('help');

  const needOptions = [
    { value: 'Rescue', label: t.sos.needRescue },
    { value: 'Food', label: t.sos.needFood },
    { value: 'Drinking water', label: t.sos.needWater },
    { value: 'Shelter', label: t.sos.needShelter },
    { value: 'Medicine', label: t.sos.needMedicine },
    { value: 'Other', label: t.sos.needOther },
  ];

  const locate = useCallback(() => {
    setLocation({ kind: 'locating' });
    getPosition()
      .then((position) => setLocation({ kind: 'ok', position }))
      .catch((reason: GeoError) => setLocation({ kind: 'failed', reason }));
  }, []);

  /** The big button does two jobs at once: open the form and start the GPS fix. */
  function begin() {
    setStarted(true);
    locate();
  }

  function toggleNeed(value: string) {
    setNeeds((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (needs.length === 0) next.needs = t.sos.needError;
    if (!phone.trim()) next.phone = t.forms.errorRequired;
    else if (!isLikelyPhone(phone)) next.phone = t.forms.errorPhone;
    // A GPS fix satisfies the location requirement; otherwise they must type it.
    if (location.kind !== 'ok' && !locationText.trim()) next.locationText = t.forms.errorRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    const position = location.kind === 'ok' ? location.position : null;
    void form.send(
      event.currentTarget,
      {
        needs: needs.join(', '),
        reporterPhone: phone.trim(),
        district,
        locationText: locationText.trim(),
        latitude: position ? formatCoord(position.latitude) : '',
        longitude: position ? formatCoord(position.longitude) : '',
        accuracy: position ? String(position.accuracy) : '',
        peopleCount,
        details: details.trim(),
      },
      // No time trap here. Someone on a roof in the dark should not be told to slow down.
      { skipTimeTrap: true },
    );
  }

  function startOver() {
    setNeeds([]);
    setPhone('');
    setDistrict('');
    setLocationText('');
    setPeopleCount('');
    setDetails('');
    setErrors({});
    setStarted(false);
    setLocation({ kind: 'idle' });
    form.reset();
  }

  if (form.status === 'sent' || form.status === 'queued') {
    return (
      <Layout page="sos">
        <FormResult
          status={form.status}
          listPage="help"
          onAnother={startOver}
          sentBody={t.forms.successSos}
        />
      </Layout>
    );
  }

  return (
    <Layout page="sos">
      <div className="wrap">
        <h1>{t.sos.h1}</h1>

        <p className="notice notice--error">
          {t.sos.callFirst} <a href={telHref('100')}>100</a> · <a href={telHref('102')}>102</a>
        </p>

        {!started ? (
          <button type="button" className="btn btn--sos" onClick={begin}>
            {t.sos.bigButton}
          </button>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <Honeypot />
            <p className="lede">{t.sos.intro}</p>

            <ChoiceGroup
              legend={t.sos.needType}
              name="needs"
              type="checkbox"
              options={needOptions}
              selected={needs}
              onToggle={toggleNeed}
              error={errors.needs}
            />

            <TextField
              id="phone"
              label={t.forms.reporterPhone}
              placeholder={t.forms.phonePlaceholder}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={setPhone}
              error={errors.phone}
            />

            <section className="panel" aria-live="polite">
              <h2 style={{ fontSize: '1.05rem' }}>{t.sos.locationHeading}</h2>

              {location.kind === 'locating' && <p>{t.sos.locationDetecting}</p>}

              {location.kind === 'ok' && (
                <p>
                  <strong>{t.sos.locationFound}</strong>
                  <br />
                  {formatCoord(location.position.latitude)}, {formatCoord(location.position.longitude)}
                  <br />
                  <span className="card-time">
                    {fmt(t.sos.locationAccuracy, {
                      n: localeNum(location.position.accuracy, lang),
                    })}
                  </span>
                </p>
              )}

              {location.kind === 'failed' && (
                <p className="error-text">
                  {location.reason === 'denied' ? t.sos.locationDenied : t.sos.locationFailed}
                </p>
              )}

              {location.kind !== 'locating' && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={locate}>
                  {t.sos.locationRetry}
                </button>
              )}

              <div style={{ marginTop: 16 }}>
                <TextField
                  id="locationText"
                  label={t.sos.locationManual}
                  hint={t.sos.locationManualHelp}
                  required={location.kind !== 'ok'}
                  value={locationText}
                  onChange={setLocationText}
                  error={errors.locationText}
                />
                <DistrictField id="district" value={district} onChange={setDistrict} />
              </div>

              <p className="notice notice--warn" style={{ marginBottom: 0 }}>
                {t.sos.locationPublicWarning}
              </p>
            </section>

            <TextField
              id="peopleCount"
              label={t.sos.peopleCount}
              type="number"
              inputMode="numeric"
              value={peopleCount}
              onChange={setPeopleCount}
            />
            <TextAreaField id="details" label={t.sos.details} value={details} onChange={setDetails} />

            {form.error && (
              <p className="notice notice--error" role="alert">
                {form.error}
              </p>
            )}

            <button type="submit" className="btn btn--sos" disabled={form.status === 'sending'}>
              {form.status === 'sending' ? t.common.submitting : t.sos.submitLabel}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
