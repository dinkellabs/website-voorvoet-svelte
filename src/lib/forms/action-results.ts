/**
 * Shape contract between form actions (contact/order) and the client form
 * components. Keep both sides in sync via this type — server returns a
 * literal `code`, client narrows the union, tsc catches typos.
 */
export type FormFailureCode = 'turnstile_failed' | 'submission_failed';

export type FormFailureData = {
  code?: FormFailureCode;
};
