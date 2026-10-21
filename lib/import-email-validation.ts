import { getEmailValidationError, normalizeEmailInput } from "@/lib/email-validation";

/** Validates email for a spreadsheet row (row 1 = headers). */
export function formatImportRowLabel(spreadsheetRow: number): string {
  return `Row ${spreadsheetRow}`;
}

export function validateImportEmailForRow(
  rawEmail: string | undefined,
  spreadsheetRow: number,
): { ok: true; email: string } | { ok: false; issue: string } {
  const error = getEmailValidationError(rawEmail);
  if (error) {
    return { ok: false, issue: `${formatImportRowLabel(spreadsheetRow)}: ${error}` };
  }
  return { ok: true, email: normalizeEmailInput(rawEmail!) };
}
