/**
 * Apps Script endpoint to accept report/update POSTs with optional Base64 image.
 * Deploy as Web App (Execute as: Me, Who has access: Anyone).
 * Replace SHEET_REPORT_ID and SHEET_UPDATE_ID with your spreadsheet ID and sheet names if needed.
 */

const SHEET_ID = '1o2E8V2l63wO-uyzhqUZ0qQFjajtNyuuYi_9bLBJJY1k'; // reports sheet
const UPDATES_SHEET_ID = '1e3u_hux83O8UPLkkJjgfEMgdaf59SRbTDhktGZHXeEs'; // updates sheet

function doPost(e){
  try{
    // Accept both JSON POSTs and standard form POSTs (multipart/form-data or x-www-form-urlencoded)
    let payload = {};
    if(e.postData && e.postData.type && e.postData.type.indexOf('application/json')!==-1){
      payload = JSON.parse(e.postData.contents || '{}');
    } else {
      // e.parameter contains first values; e.parameters contains arrays
      payload = {};
      if(e.parameter){
        Object.keys(e.parameter).forEach(k=> payload[k]=e.parameter[k]);
      }
    }
    const now = new Date();
    const type = payload.type || 'update'; // 'report' or 'update'
    // handle image (base64) if present
    let fileUrl = '';
    if(payload.photo_b64){
      const base = String(payload.photo_b64).replace(/^data:.+;base64,/, '');
      const bytes = Utilities.base64Decode(base);
      const contentType = 'image/png';
      const name = (payload.uid || Utilities.getUuid()) + '.png';
      const blob = Utilities.newBlob(bytes, contentType, name);
      const file = DriveApp.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      // direct-embed URL for images
      fileUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    }

    if(type==='report'){
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const sheet = ss.getSheets()[0];
      sheet.appendRow([now, payload.uid||'', payload.name||'', payload.phone||'', payload.address||'', payload.notes||'', fileUrl]);
    } else {
      const ss = SpreadsheetApp.openById(UPDATES_SHEET_ID);
      const sheet = ss.getSheets()[0];
      sheet.appendRow([now, payload.missing_id||'', payload.found_name||'', payload.found_phone||'', payload.status||'', payload.reporter_phone||'', payload.update_notes||'', fileUrl]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ok:true, fileUrl:fileUrl}))
      .setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helpful GET-based debug endpoints (call via browser):
// ?action=info  -> returns JSON with sheet names and row counts
// ?action=testappend -> appends a test row to the reports sheet and returns result
function doGet(e){
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'info';
  try{
    const ssReports = SpreadsheetApp.openById(SHEET_ID);
    const ssUpdates = SpreadsheetApp.openById(UPDATES_SHEET_ID);
    const info = {
      reports: ssReports.getSheets().map(s=>({name:s.getName(), rows: s.getLastRow()})),
      updates: ssUpdates.getSheets().map(s=>({name:s.getName(), rows: s.getLastRow()}))
    };
    if(action==='testappend'){
      const sheet = ssReports.getSheets()[0];
      sheet.appendRow([new Date(), 'TEST_APPEND', Session.getActiveUser().getEmail()]);
      info.testAppended = true;
    }
    // listReports/listUpdates endpoints
    if(action==='listReports'){
      const sheet = ssReports.getSheets()[0];
      const rows = sheet.getDataRange().getValues();
      // headerless sheet assumed; map rows to objects
      const mapped = rows.slice(1).map(r=>({
        timestamp: r[0], uid: r[1], name: r[2], phone: r[3], address: r[4], notes: r[5], photoUrl: r[6]
      }));
      return ContentService.createTextOutput(JSON.stringify({ok:true, reports:mapped})).setMimeType(ContentService.MimeType.JSON);
    }
    if(action==='listUpdates'){
      const sheet = ssUpdates.getSheets()[0];
      const rows = sheet.getDataRange().getValues();
      const mapped = rows.slice(1).map(r=>({
        timestamp: r[0], missing_id: r[1], found_name: r[2], found_phone: r[3], status: r[4], reporter_phone: r[5], notes: r[6], photoUrl: r[7]
      }));
      return ContentService.createTextOutput(JSON.stringify({ok:true, updates:mapped})).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ok:true, info:info})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
