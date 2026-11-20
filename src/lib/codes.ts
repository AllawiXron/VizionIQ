// Access codes, shared by the sign-in screen and the advisor server so both agree on who has paid.

export const TRIAL_CODE = "free#1";

export const HARDCODED_CODES = [
  "bker#2",
  "ehab#1",
  "maryam#1",
  "mustafa#1",
  "brhoom#1",
  "hayfaa#1",
  "mohammed#1",
  "jomana#1",
  "ali#3",
  "zaid#1",
  "zaid#vip",
  "fatima#1",
  "mohanned#1",
  "said#1",
  "rusul#1",
  "rusul#vip",
  "mohammed#2",
  "tabarak#1",
  "fadak#1",
  "uthman#vip",
  "ali4#vip",
  "hamad#vip",
  "mahmoud#1",
  "hamody#vip",
  "sura#vip",
  "raniah#vip",
  "hassanein#1",
  "lujain#1",
  "omar#vip",
  "omar-ali#12",
  "amro#vip",
  "zahraa#vip",
  "zahraa#vip#ai",
  "gaith#vip",
  "allawidev#vip",
  "allawidev#vip#ai",
  "masarra#vip#ai",
  "free#1"
];

export const normalizeCode = (str: string | undefined | null): string => {
  if (!str) return "";
  let normalized = str.trim().toLowerCase();

  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const persianDigits = ["۰", "۱", "۲", "۳", "٤", "٥", "٦", "٧", "٨", "٩"];

  for (let i = 0; i < 10; i++) {
    normalized = normalized.split(arabicDigits[i]).join(String(i));
    normalized = normalized.split(persianDigits[i]).join(String(i));
  }

  return normalized;
};

const PAID = new Set(HARDCODED_CODES.map(normalizeCode).filter((c) => !c.includes("free")));

/** a code from the built-in list that is not the free trial */
export const isPaidCode = (code: string | undefined | null): boolean => PAID.has(normalizeCode(code));

/** the free trial code, however it was typed */
export const isTrialCode = (code: string | undefined | null): boolean => normalizeCode(code).includes("free");

/** advisor questions a free visitor gets before the offer */
export const TRIAL_QUESTIONS = 3;
