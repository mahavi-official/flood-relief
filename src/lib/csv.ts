/**
 * A small RFC 4180 CSV parser.
 *
 * Google Sheets exports quote any field containing a comma, a quote or a
 * newline, and people writing "last seen" notes on a phone put newlines in
 * constantly — so a `split(',')` would corrupt real reports. This handles all
 * three cases and normalises CRLF.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  // A UTF-8 BOM would otherwise end up inside the first header cell.
  if (text.charCodeAt(0) === 0xfeff) i = 1;

  const endField = () => {
    row.push(field);
    field = '';
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      endField();
      i++;
      continue;
    }
    if (c === '\r') {
      if (text[i + 1] === '\n') i++;
      endRow();
      i++;
      continue;
    }
    if (c === '\n') {
      endRow();
      i++;
      continue;
    }
    field += c;
    i++;
  }

  // Trailing newline at end of file must not produce a phantom empty row.
  if (field !== '' || row.length > 0) endRow();

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}
