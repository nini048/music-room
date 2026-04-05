const NOISE_TAGS = [
  '\\[vietsub\\]', '\\[engsub\\]', '\\[lyrics?\\]', '\\[official\\s*(?:video|audio|mv)?\\]',
  '\\[mv\\]', '\\[audio\\]', '\\[video\\]', '\\[hd\\]', '\\[4k\\]', '\\[live\\]',
  '\\(vietsub\\)', '\\(engsub\\)', '\\(lyrics?\\)', '\\(official.*?\\)',
  'vietsub', 'engsub', 'lyrics?\\s*video', 'lyric\\s*video',
  'official\\s*(?:video|audio|mv|music\\s*video)?',
  'color\\s*coded\\s*lyrics?',
  'official', 'audio', '(?:full\\s*)?mv', '4k', 'hd',
  'prod\\.', 'feat\\.', 'ft\\.',
  'live\\s*(?:performance|session)?',
  'acoustic\\s*(?:version)?', 'instrumental', 'cover',
  'remix', 'version', 'ver\\.',
].join('|');

const NOISE_RE = new RegExp(`(?:${NOISE_TAGS})`, 'gi');

const cleanMetadata = (s) =>
  s
    .replace(/\[[^\]]{0,60}\]/g, ' ')
    .replace(/\([^)]{0,60}\)/g, ' ')
    .replace(NOISE_RE, ' ')
    .replace(/[@#]/g, '')
    .replace(/^\d+[.\-\s]+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const getCoreTitle = (s) => {
  const parts = s.split(/\s+(?:ft\.?|feat\.?|x|&|with)\b/i);
  return cleanMetadata(parts[0]);
};

let title = "yêu em như… - GREY D | from ‘ÁNH SÁNG • MÀN ĐÊM’ album";
let rawTitle = title.split('|')[0].split('·')[0];
console.log("rawTitle:", rawTitle);

let aggressive = cleanMetadata(rawTitle);
console.log("aggressive:", aggressive);

let core = getCoreTitle(aggressive);
console.log("core:", core);

const splitAggressive = aggressive.split(/\s+-\s+/).map(s => s.trim()).filter(Boolean);
console.log("splitAggressive:", splitAggressive);
