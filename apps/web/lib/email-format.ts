// Rejects addresses the email provider would reject anyway (e.g. "a..b@gmail.com", "x@email").
const EMAIL_RE =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+'-]+(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
export const isValidEmail = (value: string): boolean =>
  value.length <= 254 && EMAIL_RE.test(value.trim());
