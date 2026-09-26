export type RewriteDiffSegment = {
  text: string;
  changed: boolean;
};

type Token = {
  text: string;
  word: boolean;
  normalized: string;
};

const WORD_TOKEN = /^[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*$/u;

function tokenize(text: string): Token[] {
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[^\p{L}\p{N}\s]+|\s+/gu) ?? []).map((value) => ({
    text: value,
    word: WORD_TOKEN.test(value),
    normalized: value.toLocaleLowerCase("en-US").replaceAll("’", "'"),
  }));
}

function wordIndexes(tokens: Token[]) {
  return tokens.flatMap((token, index) => token.word ? [index] : []);
}

function unchangedWordPairs(original: Token[], rewritten: Token[]) {
  const originalWords = wordIndexes(original);
  const rewrittenWords = wordIndexes(rewritten);
  const table = Array.from({ length: originalWords.length + 1 }, () => new Uint16Array(rewrittenWords.length + 1));

  for (let left = originalWords.length - 1; left >= 0; left -= 1) {
    for (let right = rewrittenWords.length - 1; right >= 0; right -= 1) {
      table[left][right] = original[originalWords[left]].normalized === rewritten[rewrittenWords[right]].normalized
        ? table[left + 1][right + 1] + 1
        : Math.max(table[left + 1][right], table[left][right + 1]);
    }
  }

  const pairs: Array<[number, number]> = [];
  let left = 0;
  let right = 0;
  while (left < originalWords.length && right < rewrittenWords.length) {
    if (original[originalWords[left]].normalized === rewritten[rewrittenWords[right]].normalized) {
      pairs.push([originalWords[left], rewrittenWords[right]]);
      left += 1;
      right += 1;
    } else if (table[left + 1][right] >= table[left][right + 1]) left += 1;
    else right += 1;
  }
  return pairs;
}

function segments(tokens: Token[], unchanged: Set<number>): RewriteDiffSegment[] {
  const values: RewriteDiffSegment[] = [];
  tokens.forEach((token, index) => {
    // Punctuation, spacing and capitalization-only changes are intentionally quiet.
    const changed = token.word && !unchanged.has(index);
    const current = values[values.length - 1];
    if (current?.changed === changed) current.text += token.text;
    else values.push({ text: token.text, changed });
  });
  return values;
}

export function buildLearnerRewriteDiff(originalText: string, rewrittenText: string) {
  const original = tokenize(originalText);
  const rewritten = tokenize(rewrittenText);
  const pairs = unchangedWordPairs(original, rewritten);
  const unchangedOriginal = new Set(pairs.map(([index]) => index));
  const unchangedRewritten = new Set(pairs.map(([, index]) => index));
  return {
    original: segments(original, unchangedOriginal),
    rewritten: segments(rewritten, unchangedRewritten),
    hasMeaningfulChanges: unchangedOriginal.size < wordIndexes(original).length || unchangedRewritten.size < wordIndexes(rewritten).length,
  };
}
