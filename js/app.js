// CONFIG: Replace these placeholders with your Google Form & Published Sheet URLs
const CONFIG = {
  // Google Form endpoints for direct POSTs (use the "formResponse" action URL)
  REPORT_FORM_ACTION: "https://docs.google.com/forms/d/e/1FAIpQLScWIwDH1U_zxM2DE_cc058u17Hu8Ui8qLKqtDXVr4mn4XE_eA/formResponse",
  UPDATE_FORM_ACTION: "https://docs.google.com/forms/d/e/YOUR_UPDATE_FORM_ID/formResponse",

  // Field entry names (example: entry.123456789)
  REPORT_FIELDS: {
    name: "entry.YOUR_NAME_ENTRY",
    phone: "entry.YOUR_PHONE_ENTRY",
    address: "entry.YOUR_ADDRESS_ENTRY",
    photo_url: "entry.YOUR_PHOTO_URL_ENTRY",
    photo_b64: "entry.YOUR_PHOTO_B64_ENTRY",
    notes: "entry.YOUR_NOTES_ENTRY",
    uid: "entry.YOUR_UID_ENTRY"
  },
  UPDATE_FIELDS: {
    missing_id: "entry.YOUR_MISSING_ID_ENTRY",
    reporter_phone: "entry.YOUR_REPORTER_PHONE_ENTRY",
    status: "entry.YOUR_STATUS_ENTRY",
    found_name: "entry.YOUR_FOUND_NAME_ENTRY",
    found_phone: "entry.YOUR_FOUND_PHONE_ENTRY",
    found_photo_b64: "entry.YOUR_FOUND_PHOTO_B64_ENTRY",
    update_notes: "entry.YOUR_UPDATE_NOTES_ENTRY"
  },

  // Published Google Sheets CSV URLs (File -> Publish to web -> CSV)...
  // NOTE: publish the sheet/tab to the web as CSV and replace the URL if needed
  PUBLISHED_REPORTS_CSV: "https://docs.google.com/spreadsheets/d/1o2E8V2l63wO-uyzhqUZ0qQFjajtNyuuYi_9bLBJJY1k/pub?gid=672728321&single=true&output=csv",
  PUBLISHED_UPDATES_CSV: "https://docs.google.com/spreadsheets/d/1e3u_hux83O8UPLkkJjgfEMgdaf59SRbTDhktGZHXeEs/pub?gid=1296139058&single=true&output=csv"
};

// Optional: Google Apps Script Web App URL. If set, the client will POST JSON here
// instead of submitting forms to Google Forms. Deploy your Apps Script and paste URL here.
CONFIG.APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbylf6DgTB9g27IuCfLreTNKgRQHn0br21YR-n9qpI-ob4FMZ7RktEgT4CZ_YqJ7krc_xw/exec";

// Bilingual UI strings
const STRINGS = {
  en: {
    title: 'Flood Help Nepal',
    reportTitle: 'Report a Missing Person',
    reportNote: 'Submissions are sent to your Google Form. See README for setup steps.',
    lblName: 'Name', lblPhone: 'Phone', lblAddress: 'Address', lblPhoto: 'Photo (upload from device)', lblNotes: 'Additional info',
    btnSubmitReport: 'Submit report',
    listTitle: 'Missing Persons',
    updateButton: 'Found a person',
    updateTitle: 'Found a person',
    updateNote: 'Updates are appended to a separate Google Form linked sheet. See README for setup.'
  },
  np: {
    title: 'बाढी सहायता नेपाल',
    reportTitle: 'हराएको व्यक्तिको रिपोर्ट गर्नुहोस्',
    reportNote: 'सबमिशन तपाईंको Google Form मा पठाइनेछ। सेटअपका लागि README हेर्नुहोस्।',
    lblName: 'नाम', lblPhone: 'फोन', lblAddress: 'ठेगाना', lblPhoto: 'फोटो (फोन/लैपटपबाट अपलोड गर्नुहोस्)', lblNotes: 'थप जानकारी',
    btnSubmitReport: 'रिपोर्ट पेश गर्नुहोस्',
    listTitle: 'हराउने व्यक्तिहरू',
    updateButton: 'पत्ता लागेको व्यक्ति रिपोर्ट गर्नुहोस्',
    updateTitle: 'पत्ता लागेको व्यक्ति',
    updateNote: 'अपडेटहरू छुट्टै Google Form मा थपिन्छन्। सेटअपका लागि README हेर्नुहोस्।',
    lblStatus: 'स्थिति',
    updatesTitle: 'हालका अपडेटहरू',
    updatesNote: 'भर्खरका अपडेटहरू (मिल्यो / मरेको / अन्य)'
  }
};

let currentLang = 'np';

function setLanguage(lang){
  currentLang = lang;
  const maybeSet = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  const siteTitleLink = document.getElementById('site-title-link');
  if(siteTitleLink) siteTitleLink.textContent = STRINGS[lang].title; else maybeSet('site-title', STRINGS[lang].title);
  maybeSet('report-title', STRINGS[lang].reportTitle);
  maybeSet('report-note', STRINGS[lang].reportNote);
  const lblName = document.getElementById('lbl-name'); if(lblName && lblName.firstChild) lblName.firstChild.textContent = STRINGS[lang].lblName + ' ';
  const lblPhone = document.getElementById('lbl-phone'); if(lblPhone && lblPhone.firstChild) lblPhone.firstChild.textContent = STRINGS[lang].lblPhone + ' ';
  const lblAddress = document.getElementById('lbl-address'); if(lblAddress && lblAddress.firstChild) lblAddress.firstChild.textContent = STRINGS[lang].lblAddress + ' ';
  const lblPhoto = document.getElementById('lbl-photo'); if(lblPhoto && lblPhoto.firstChild) lblPhoto.firstChild.textContent = STRINGS[lang].lblPhoto + ' ';
  const lblNotes = document.getElementById('lbl-notes'); if(lblNotes && lblNotes.firstChild) lblNotes.firstChild.textContent = STRINGS[lang].lblNotes + ' ';
  const btnReport = document.getElementById('btn-submit-report'); if(btnReport) btnReport.textContent = STRINGS[lang].btnSubmitReport;
  maybeSet('update-title', STRINGS[lang].updateTitle);
  maybeSet('update-note', STRINGS[lang].updateNote);
  // optional labels
  const lblStatus = document.getElementById('lbl-status'); if(lblStatus && lblStatus.firstChild) lblStatus.firstChild.textContent = (STRINGS[lang].lblStatus || 'Status') + ' ';
  const updatesTitle = document.getElementById('updates-title'); if(updatesTitle) updatesTitle.textContent = (STRINGS[lang].updatesTitle||updatesTitle.textContent);
  const updatesNote = document.getElementById('updates-note'); if(updatesNote) updatesNote.textContent = (STRINGS[lang].updatesNote||updatesNote.textContent);
  // toggle active button styles
  const enBtn = document.getElementById('lang-en'); if(enBtn) enBtn.classList.toggle('active', lang==='en');
  const npBtn = document.getElementById('lang-np'); if(npBtn) npBtn.classList.toggle('active', lang==='np');
}

// wire language buttons (if present)
const enBtn = document.getElementById('lang-en'); if(enBtn) enBtn.addEventListener('click', ()=>setLanguage('en'));
const npBtn = document.getElementById('lang-np'); if(npBtn) npBtn.addEventListener('click', ()=>setLanguage('np'));

// Simple UI helper
const $ = sel => document.querySelector(sel);
const navReport = $('#nav-report'); if(navReport) navReport.addEventListener('click', ()=>show('report'));
const navList = $('#nav-list'); if(navList) navList.addEventListener('click', ()=>show('list'));
const navUpdate = $('#nav-update'); if(navUpdate) navUpdate.addEventListener('click', ()=>show('update'));
const navUpdates = $('#nav-updates'); if(navUpdates) navUpdates.addEventListener('click', ()=>show('updates'));
function show(tab){
  // set active nav button only, but keep all sections visible; scroll to the requested section
  ['report','list','update','updates'].forEach(t=>{
    const nav = document.getElementById('nav-'+t);
    if(nav) nav.classList.toggle('active', t===tab);
  });
  const target = document.getElementById('section-'+tab);
  if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
  if(tab==='list') loadList();
  if(tab==='updates') loadUpdates();
}

// Generate a short unique id
function genUID(){
  return 'ID'+Date.now().toString(36).slice(-6);
}

// Helper: build and submit a hidden form to Google Forms (avoids CORS)
function submitToGoogleForm(actionUrl, mapping){
  const form = document.createElement('form');
  form.action = actionUrl;
  form.method = 'POST';
  form.target = 'hidden_iframe';
  form.style.display = 'none';
  Object.keys(mapping).forEach(k=>{
    const input = document.createElement('input');
    input.name = mapping[k].key;
    input.value = mapping[k].value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  setTimeout(()=>document.body.removeChild(form),2000);
}

async function submitToAppsScript(type, payload){
  if(!CONFIG.APPS_SCRIPT_URL) throw new Error('Apps Script URL not configured');
  // Use FormData POST (no JSON header) to avoid CORS preflight
  const form = new FormData();
  form.append('type', type);
  Object.keys(payload||{}).forEach(k=>{
    if(payload[k]!==undefined && payload[k]!==null) form.append(k, payload[k]);
  });
  const res = await fetch(CONFIG.APPS_SCRIPT_URL, { method: 'POST', body: form });
  // Apps Script returns JSON text
  const text = await res.text();
  try{ return JSON.parse(text); }catch(e){ return {ok:true, raw:text}; }
}

// Wrapper: prefer Apps Script if configured, else fall back to Google Form POST
async function submitMappedData(opts){
  // opts: {type:'report'|'update', mapping: {key:val...}, rawMappingForForm: {...}}
  if(CONFIG.APPS_SCRIPT_URL){
    // convert mapping keys to payload names (strip 'entry.*')
    const payload = {};
    Object.keys(opts.mapping).forEach(k=> payload[k] = opts.mapping[k]);
    try{
      const r = await submitToAppsScript(opts.type, payload);
      return r;
    }catch(err){
      console.warn('Apps Script submit failed, falling back to form POST', err);
    }
  }
  // fallback: build a mapping compatible with submitToGoogleForm
  const fallback = {};
  Object.keys(opts.rawMappingForForm||{}).forEach(k=> fallback[k] = opts.rawMappingForForm[k]);
  submitToGoogleForm(opts.formAction, fallback);
  return {ok:true, fallback:true};
}

// Report form submit
const reportFormEl = $('#report-form');
if(reportFormEl) reportFormEl.addEventListener('submit', e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const uid = genUID();
  const fileEl = document.getElementById('photo_file');

  // helper to actually submit once we have b64 (or not)
  const doSubmit = (photoB64)=>{
    const mapping = {
      name: fd.get('name')||'',
      phone: fd.get('phone')||'',
      address: fd.get('address')||'',
      photo_b64: photoB64||'',
      notes: fd.get('notes')||'',
      uid: uid
    };
    // rawMappingForForm: what submitToGoogleForm expects (entry.* keys)
    const raw = {
      name: { key: CONFIG.REPORT_FIELDS.name, value: fd.get('name')||'' },
      phone: { key: CONFIG.REPORT_FIELDS.phone, value: fd.get('phone')||'' },
      address: { key: CONFIG.REPORT_FIELDS.address, value: fd.get('address')||'' },
      photo_b64: { key: CONFIG.REPORT_FIELDS.photo_b64, value: photoB64||'' },
      notes: { key: CONFIG.REPORT_FIELDS.notes, value: fd.get('notes')||'' },
      uid: { key: CONFIG.REPORT_FIELDS.uid, value: uid }
    };
    submitMappedData({type:'report', mapping:mapping, rawMappingForForm:raw, formAction:CONFIG.REPORT_FORM_ACTION}).then(()=>{
      alert((currentLang==='en' ? 'Report submitted — ID: ' : 'रिपोर्ट पेश गरियो — ID: ')+uid+'');
      e.target.reset();
      const pp = document.getElementById('photo-preview'); if(pp) pp.classList.add('hidden');
    }).catch(err=>{ console.error(err); alert('Submit failed'); });
  };

  // if a file is selected, read as data URL, else submit without
  if(fileEl && fileEl.files && fileEl.files.length>0){
    const f = fileEl.files[0];
    const reader = new FileReader();
    reader.onload = ()=>{
      const dataUrl = reader.result;
      // place b64 in hidden input as well
      document.getElementById('photo_b64').value = dataUrl;
      doSubmit(dataUrl);
    };
    reader.readAsDataURL(f);
  }else{
    doSubmit('');
  }
});

// Update form submit
const updateFormEl = $('#update-form');
if(updateFormEl) updateFormEl.addEventListener('submit', e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const missingId = fd.get('missing_id') || '';
  const foundName = fd.get('found_name') || '';
  const foundPhone = fd.get('found_phone') || '';
  const reporterPhone = fd.get('reporter_phone') || '';
  const statusVal = fd.get('status') || '';
  const notes = fd.get('update_notes') || '';

  if(!reporterPhone.trim()){
    alert(currentLang==='np' ? 'कृपया आफ्नो फोन नम्बर दिनुहोस्।' : 'Please enter your phone number.');
    return;
  }

  // handle found photo if provided
  const foundFileEl = document.getElementById('found_file');
  const doSubmit = (photoB64)=>{
    const mapping = {
      missing_id: missingId,
      reporter_phone: reporterPhone,
      status: statusVal,
      found_name: foundName,
      found_phone: foundPhone,
      found_photo_b64: photoB64||'',
      update_notes: notes
    };
    const raw = {
      missing_id: { key: CONFIG.UPDATE_FIELDS.missing_id, value: missingId },
      reporter_phone: { key: CONFIG.UPDATE_FIELDS.reporter_phone, value: reporterPhone },
      status: { key: CONFIG.UPDATE_FIELDS.status, value: statusVal },
      found_name: { key: CONFIG.UPDATE_FIELDS.found_name, value: foundName },
      found_phone: { key: CONFIG.UPDATE_FIELDS.found_phone, value: foundPhone },
      found_photo_b64: { key: CONFIG.UPDATE_FIELDS.found_photo_b64, value: photoB64||'' },
      update_notes: { key: CONFIG.UPDATE_FIELDS.update_notes, value: notes }
    };
    submitMappedData({type:'update', mapping:mapping, rawMappingForForm:raw, formAction:CONFIG.UPDATE_FORM_ACTION}).then(()=>{
      alert(currentLang==='en' ? 'Report submitted. Thank you.' : 'रिपोर्ट पेश गरियो। धन्यवाद।');
      e.target.reset();
      const preview = document.getElementById('found-photo-preview'); if(preview) preview.classList.add('hidden');
    }).catch(err=>{ console.error(err); alert('Submit failed'); });
  };

  if(foundFileEl && foundFileEl.files && foundFileEl.files[0]){
    const fr = new FileReader(); fr.onload = ()=> doSubmit(fr.result); fr.readAsDataURL(foundFileEl.files[0]);
  }else{
    doSubmit('');
  }
});

// Load updates and render them in the updates section
async function loadUpdates(){
  const cont = document.getElementById('updates-container');
  cont.innerHTML = 'Loading...';
  try{
    const updates = CONFIG.APPS_SCRIPT_URL ? await fetchUpdatesFromAppsScript() : await fetchCsv(CONFIG.PUBLISHED_UPDATES_CSV);
    cont.innerHTML = '';
    if(updates.length===0){ cont.innerHTML = '<p>No updates yet.</p>'; return; }
    updates.forEach(u=>{
      // try to find missing id and status in row values
      const vals = Object.values(u);
      const status = vals.find(v=>/(FOUND|DEAD|OTHER)/i.test(v)) || vals.find(v=>v && v.length<30 && v.toUpperCase()===v) || '';
      const missingId = vals.find(v=>v && v.startsWith('ID')) || vals[1] || '';
      const reporter = vals.find(v=>/^[0-9+\- ]{6,}$/.test(v)) || '';
      const notes = vals.join(' | ');
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<h3>${missingId} — ${status}</h3><div class="meta"><div>${reporter}</div></div><p>${notes}</p>`;
      cont.appendChild(card);
    });
  }catch(err){
    cont.innerHTML = '<p>Error loading updates. Check README and your published updates CSV URL.</p>';
    console.error(err);
  }
}

async function fetchReportsFromAppsScript(){
  const url = CONFIG.APPS_SCRIPT_URL + '?action=listReports';
  const res = await fetch(url);
  if(!res.ok) throw new Error('Failed to fetch reports from Apps Script');
  const j = await res.json();
  if(!j.ok) throw new Error('Apps Script error');
  return j.reports || [];
}

async function fetchUpdatesFromAppsScript(){
  const url = CONFIG.APPS_SCRIPT_URL + '?action=listUpdates';
  const res = await fetch(url);
  if(!res.ok) throw new Error('Failed to fetch updates from Apps Script');
  const j = await res.json();
  if(!j.ok) throw new Error('Apps Script error');
  return j.updates || [];
}

// Fetch CSV and parse
async function fetchCsv(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('Failed to fetch CSV');
  const text = await res.text();
  const lines = text.split('\n').filter(Boolean);
  const headers = lines.shift().split(',').map(h=>h.trim());
  return lines.map(line=>{
    // naive CSV parse (works for simple published sheets)
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h,i)=>obj[h]=cols[i] ? cols[i].replace(/"/g,'').trim() : '');
    return obj;
  });
}

// Load list and updates, then render
async function loadList(){
  const container = $('#list-container');
  container.innerHTML = 'Loading...';
  try{
    const reports = CONFIG.APPS_SCRIPT_URL ? await fetchReportsFromAppsScript() : await fetchCsv(CONFIG.PUBLISHED_REPORTS_CSV);
    const updates = CONFIG.APPS_SCRIPT_URL ? await fetchUpdatesFromAppsScript().catch(()=>[]) : await fetchCsv(CONFIG.PUBLISHED_UPDATES_CSV).catch(()=>[]);
    const updatesById = {};
    updates.forEach(u=>{
      // u may be an object from Apps Script or a row map from CSV parser
      const vals = Object.values(u);
      Object.values(u).forEach(v=>{ if(v && typeof v === 'string' && v.startsWith('ID')) updatesById[v]=u; });

    });

    container.innerHTML = '';
    reports.forEach(r=>{
      // r may be object from Apps Script or CSV row mapping
      const uid = r.uid || Object.values(r).find(v=>v && v.startsWith && v.startsWith('ID')) || '';
      const name = r.name || Object.values(r)[2]||Object.values(r)[1]||'Unknown';
      const phone = r.phone || Object.values(r)[3]||Object.values(r)[2]||'';
      const photo = r.photoUrl || Object.values(r).find(v=>v && (v.startsWith && (v.startsWith('http') || v.startsWith('data:image'))))||'';
      const notes = r.notes || Object.values(r).slice(5).join(' | ');
      const card = document.createElement('div'); card.className='card';
      if(photo) card.innerHTML = `<img src="${photo}" alt="${name}">`;
      else card.innerHTML = `<div style="height:160px;background:#eee;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#888">No photo</div>`;
      card.innerHTML += `<h3>${name}</h3><div class="meta"><div>${phone}</div><div>${uid}</div></div><p>${notes}</p>`;

      // status label
      const found = updatesById[uid];
      const status = document.createElement('div');
      status.className = found ? 'status-found' : 'status-missing';
      status.textContent = found ? 'FOUND' : 'MISSING';
      card.appendChild(status);

      // Inline update controls (dropdown, reporter phone, optional found details, save button)
      const controls = document.createElement('div');
      controls.className = 'update-controls';
      const select = document.createElement('select');
      ['MISSING','FOUND','DEAD','OTHER'].forEach(opt=>{
        const o = document.createElement('option'); o.value = opt; o.textContent = opt; select.appendChild(o);
      });
      // default select to FOUND if updates indicate found
      if(found) select.value = 'FOUND';
      const reporter = document.createElement('input'); reporter.type='text'; reporter.placeholder = (currentLang==='np' ? 'तपाईंको फोन' : 'Your phone'); reporter.className='reporter-input';

      // optional found details (hidden unless FOUND/DEAD selected)
      const foundName = document.createElement('input'); foundName.type='text'; foundName.placeholder = (currentLang==='np' ? 'पत्ता लागेको व्यक्तिको नाम (वैकल्पिक)' : 'Found person name (optional)'); foundName.className='found-name-input hidden';
      const foundPhone = document.createElement('input'); foundPhone.type='text'; foundPhone.placeholder = (currentLang==='np' ? 'पत्ता लागेको व्यक्तिको फोन (वैकल्पिक)' : 'Found person phone (optional)'); foundPhone.className='found-phone-input hidden';
      const foundFile = document.createElement('input'); foundFile.type='file'; foundFile.accept='image/*'; foundFile.className='found-file-input hidden';
      const foundPreview = document.createElement('img'); foundPreview.className='photo-preview hidden';

      const saveBtn = document.createElement('button'); saveBtn.type='button'; saveBtn.className='btn-save-update'; saveBtn.textContent = STRINGS[currentLang].updateButton || 'Update status';
      controls.appendChild(select);
      controls.appendChild(reporter);
      controls.appendChild(foundName);
      controls.appendChild(foundPhone);
      controls.appendChild(foundFile);
      controls.appendChild(foundPreview);
      controls.appendChild(saveBtn);
      card.appendChild(controls);

      // show/hide optional found inputs when status changes
      select.addEventListener('change', ()=>{
        const v = select.value;
        const show = (v==='FOUND' || v==='DEAD');
        [foundName, foundPhone, foundFile, foundPreview].forEach(el=>el.classList.toggle('hidden', !show));
      });

      // preview selected found photo
      foundFile.addEventListener('change', ()=>{
        if(foundFile.files && foundFile.files[0]){
          const fr = new FileReader();
          fr.onload = ()=>{ foundPreview.src = fr.result; foundPreview.classList.remove('hidden'); };
          fr.readAsDataURL(foundFile.files[0]);
        }
      });

      // save handler: require reporter phone then submit to Google Form and move card if FOUND/DEAD
      saveBtn.addEventListener('click', ()=>{
        const statusVal = select.value;
        // reporter phone is mandatory (the person who reports)
        const reporterVal = reporter.value || '';
        if(!reporterVal.trim()){
          alert(currentLang==='np' ? 'कृपया आफ्नो फोन नम्बर दिनुहोस्।' : 'Please enter your phone number.');
          reporter.focus();
          return;
        }

        const foundNameVal = foundName.value || '';
        const foundPhoneVal = foundPhone.value || '';

        const submitMappingAndMove = (photoB64)=>{
          const mapping = {
            missing_id: uid,
            reporter_phone: reporterVal,
            status: statusVal,
            found_name: foundNameVal,
            found_phone: foundPhoneVal,
            found_photo_b64: photoB64||'',
            update_notes: 'Updated from list UI'
          };
          const raw = {
            missing_id: { key: CONFIG.UPDATE_FIELDS.missing_id, value: uid },
            reporter_phone: { key: CONFIG.UPDATE_FIELDS.reporter_phone, value: reporterVal },
            status: { key: CONFIG.UPDATE_FIELDS.status, value: statusVal },
            found_name: { key: CONFIG.UPDATE_FIELDS.found_name, value: foundNameVal },
            found_phone: { key: CONFIG.UPDATE_FIELDS.found_phone, value: foundPhoneVal },
            found_photo_b64: { key: CONFIG.UPDATE_FIELDS.found_photo_b64, value: photoB64||'' },
            update_notes: { key: CONFIG.UPDATE_FIELDS.update_notes, value: 'Updated from list UI' }
          };
          submitMappedData({type:'update', mapping:mapping, rawMappingForForm:raw, formAction:CONFIG.UPDATE_FORM_ACTION}).catch(err=>console.error('submit fallback error',err));
          // optimistic UI update
          status.className = (statusVal==='FOUND' || statusVal==='DEAD') ? 'status-found' : 'status-missing';
          status.textContent = statusVal;
          // add found details to card
          if(foundNameVal) card.querySelector('h3').textContent = foundNameVal + ' ('+uid+')';
          if(foundPhoneVal){
            const meta = card.querySelector('.meta');
            if(meta) meta.innerHTML = `<div>${foundPhoneVal}</div><div>Reported by: ${reporterVal}</div>`;
          }
          if(photoB64){
            const imgEl = card.querySelector('img');
            if(imgEl) imgEl.src = photoB64; else {
              const img = document.createElement('img'); img.src = photoB64; img.className='photo-preview'; card.insertBefore(img, card.firstChild);
            }
          }
          if(statusVal==='FOUND' || statusVal==='DEAD'){
            const foundContainer = document.getElementById('found-container');
            if(foundContainer) foundContainer.appendChild(card);
          }
        };

        if(foundFile.files && foundFile.files[0]){
          const fr = new FileReader();
          fr.onload = ()=> submitMappingAndMove(fr.result);
          fr.readAsDataURL(foundFile.files[0]);
        }else{
          submitMappingAndMove('');
        }
      });

      container.appendChild(card);
    });
    if(reports.length===0) container.innerHTML = '<p>No reports yet.</p>';
  }catch(err){
    container.innerHTML = '<p>Error loading list. Check README and your published sheet URLs.</p>';
    console.error(err);
  }
}

// helper: attach an update button to a card to prefill update form
function attachUpdateButton(card, uid){
  const btn = document.createElement('button');
  btn.className = 'btn-update';
  btn.type = 'button';
  btn.textContent = STRINGS[currentLang].updateButton || 'Update status';
  btn.addEventListener('click', ()=>{
    const missingInput = document.querySelector('input[name="missing_id"]');
    const statusSelect = document.querySelector('select[name="status"]');
    const reporterInput = document.querySelector('input[name="reporter_phone"]');
    if(missingInput) missingInput.value = uid || '';
    if(statusSelect) statusSelect.value = 'FOUND';
    if(reporterInput) reporterInput.focus();
    const updSection = document.getElementById('section-update');
    if(updSection) updSection.scrollIntoView({behavior:'smooth', block:'start'});
  });
  card.appendChild(btn);
}

// initial — default to Nepali
setLanguage(currentLang);
// auto-load page-specific content
if(document.getElementById('section-report')) show('report');
if(document.getElementById('section-list')) loadList();
if(document.getElementById('section-updates')) loadUpdates();
