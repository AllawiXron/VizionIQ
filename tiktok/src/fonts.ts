import { continueRender, delayRender, staticFile } from 'remotion';

// Noto Naskh Arabic for the verses (it places every haraka exactly); Readex Pro for everything else. Both are
// variable-weight Google Fonts (SIL OFL); files are in public/fonts.
const ARABIC =
  'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC';
const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const FACES: [string, string, string, string][] = [
  ['Noto Naskh Arabic', 'fonts/NotoNaskhArabic-arabic.woff2', ARABIC, '400 700'],
  ['Readex Pro', 'fonts/ReadexPro-arabic.woff2', ARABIC, '160 700'],
  ['Readex Pro', 'fonts/ReadexPro-latin.woff2', LATIN, '160 700'],
];

let loading: Promise<void> | null = null;

export const loadFonts = () => {
  if (loading) return loading;
  const handle = delayRender('Loading fonts');
  loading = Promise.all(
    FACES.map(([family, file, unicodeRange, weight]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { unicodeRange, weight });
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
  return loading;
};

export const SERIF = '"Noto Naskh Arabic", serif';
export const SANS = '"Readex Pro", sans-serif';
