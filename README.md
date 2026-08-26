# Flood Help Nepal — Missing Persons Website

This is a simple static website that lets users report missing persons and update status. It supports English and Nepali UI and allows uploading photos directly from a phone or laptop. It uses Google Forms for data collection and Google Sheets (published to web as CSV) for listing data.

Quick steps to make it work:

1. Create a Google Form for reports with fields: Name, Phone, Address, Photo (text field or file field), Notes. Add a field for a unique ID (we generate this on submit and include it in the form data).
2. Link the form to a Google Sheet (Responses -> Select response destination).
3. In the Sheet: File -> Publish to the web -> choose the sheet with form responses -> CSV. Copy the CSV URL.
4. Create a second Google Form for updates (fields: Missing Person ID, Reporter Phone, Notes), link it to a separate sheet, and publish that sheet as CSV.
5. Open `js/app.js` and replace the placeholders in the `CONFIG` object:
   - `REPORT_FORM_ACTION`: the form "formResponse" action URL (https://docs.google.com/forms/d/e/FORM_ID/formResponse).
   - `REPORT_FIELDS`: set each `entry.YOUR_*_ENTRY` value to the corresponding `entry.<number>` name for that question. To find entry IDs: open your form and inspect an input or use the prefilled link technique.
   - `PUBLISHED_REPORTS_CSV` and `PUBLISHED_UPDATES_CSV`: paste the published CSV URLs from the sheets.

Image upload options (notes):
- Option A — Apps Script upload (recommended): create a Google Apps Script web app that accepts file uploads, saves images to a Drive folder, and returns a public URL. Then append that URL to the sheet. This is the most reliable and avoids large Base64 strings in Sheets.
- Option B — Base64-in-form (implemented here): the site converts the selected photo to a Base64 data URL and includes it in a text field submitted to your Google Form. This works without extra server code but can produce very large cells in Sheets and may hit size limits for long images.

Nepali support
- Click the language buttons (EN / ने) in the header to switch UI text between English and Nepali.

Notes & limitations:
- Google Forms file-upload questions require a signed-in Google account and cannot be submitted anonymously from a static site. If you need users to upload files without signing in, use an Apps Script endpoint or a third-party image-hosting API.
- The site posts to Google Forms by creating a hidden form and submitting it to the `formResponse` endpoint to avoid CORS. This technique works for text fields; image uploads are handled via Base64 in this implementation.
- The CSV parser in `js/app.js` is simple and intended for standard published sheets. If your sheet contains commas inside cells, you may need a more robust CSV parser.

Deploying:
- This is a static site — you can host it on GitHub Pages, Netlify, Vercel, or any static host. Push the folder to a repo and point the host to this folder.

If you want help I can:
- Create an Apps Script endpoint that accepts file uploads and saves them to Drive, then wire returned image URLs into the sheet.
- Fill in your `entry.*` field names and published sheet URLs if you paste them here; I will update `js/app.js` accordingly.

Apps Script backend (recommended)
- I've added a sample Apps Script at `apps_script/Code.gs` that accepts JSON POSTs, saves Base64 images to Drive, and appends rows to either the reports sheet or the updates sheet. To use it:
   1. Open https://script.google.com and create a new project.
   2. Copy the contents of `apps_script/Code.gs` into the script editor.
   3. Replace the `SHEET_ID` and `UPDATES_SHEET_ID` constants at the top with your actual spreadsheet IDs.
   4. Deploy → New deployment → Select "Web app" → Set "Execute as" to `Me` and "Who has access" to `Anyone` (or `Anyone with link`). Click Deploy and authorize.
   5. Copy the Web App URL and paste it into `js/app.js` as `CONFIG.APPS_SCRIPT_URL = "YOUR_WEB_APP_URL"`.
   6. The site will then POST JSON to the Apps Script endpoint for both reports and updates. Images uploaded in the site are sent as Base64 and saved to Drive.

Security notes
- The Apps Script runs with the deployer's Drive and Sheet access and will create files in their Drive. Only deploy it under an account you control. If you set the web app visibility to public, anyone can POST to it to append rows — consider adding a simple secret token field to the payload and verify it in `doPost` for light protection.
