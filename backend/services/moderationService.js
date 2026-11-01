const DECISIONS = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
};

// Helper: normalize leetspeak and obfuscation
function normalizeForModeration(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .replace(/[@]/g, 'a')
    .replace(/[\$]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[*_~`\-\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function collapseRepeats(str) {
  return str.replace(/(.)\1+/g, '$1');
}

// Prohibited rules categorized as per campus community standards
const prohibitedPatterns = [
  // 1. Sexual profanity, obscenity, and explicit language
  {
    category: 'sexual_profanity',
    label: 'Sexually Explicit & Vulgar Language',
    regex: /\b(?:f+u+c+k\w*|f+k\b|f+u+k\w*|f+c+k\w*|p+h+u+c+k\w*|b+i+t+c+h\w*|s+l+u+t\w*|w+h+o+r+e\w*|c+u+n+t\w*|b+a+s+t+a+r+d\w*|a+s+s+h+o+l+e\w*|p+o+r+n\w*|n+u+d+e\w*|n+a+k+e+d\w*|b+o+o+b\w*|t+i+t\w*|t+i+t+s|d+i+c+k\w*|c+o+c+k\w*|p+u+s+s+y\w*|v+a+g+i+n+a\w*|p+e+n+i+s\w*|m+a+s+t+u+r+b\w*|o+r+g+a+s+m\w*|e+r+o+t+i+c\w*|h+e+n+t+a+i|x+x+x|x+v+i+d+e+o+s|p+o+r+n+h+u+b|o+n+l+y+f+a+n+s|d+i+l+d+o|b+l+o+w+j+o+b|a+n+a+l|t+h+r+e+e+s+o+m+e|s+e+x\b|s+e+x+y)\b/i,
    reason: 'Prohibited: Profanity, vulgarity, and sexually explicit language violate university community standards.',
  },

  // 2. Sexual Harassment & Unsolicited Propositions
  {
    category: 'sexual_harassment',
    label: 'Sexual Harassment',
    regex: /\b(?:send\s+(?:me\s+)?(?:nudes?|naked\s+pics?|boob\s+pics?)|show\s+(?:me\s+)?(?:boobs|tits|dick|vagina)|sleep\s+with\s+me|wanna\s+have\s+sex|give\s+me\s+sexual\s+favors?|rate\s+my\s+body|strip\s+for\s+me|sexy\s+girl\s+contact\s+me|horny\s+chat|paid\s+sex|hookup\s+tonight)\b/i,
    reason: 'Prohibited: Unsolicited sexual propositions, harassment, and predatory solicitations violate campus safety policies.',
  },

  // 3. Indian campus abusive slang / vulgarity
  {
    category: 'abusive_slang',
    label: 'Abusive Slang & Harassment',
    regex: /\b(?:c+h+u+t+i+y+a\w*|c+h+o+d+u\w*|b+h+o+s+d+i\w*|b+h+o+s+d+i+k+e\w*|m+a+d+a+r+c+h+o+d\w*|b+e+h+e+n+c+h+o+d\w*|r+a+n+d+i\w*|g+a+n+d\w*|g+a+a+n+d\w*|l+u+n+d\w*|l+o+d+u\w*|h+a+r+a+m+i\w*|c+h+u+t\b|k+a+m+i+n+e\w*|s+a+l+a\b|s+a+a+l+a\b)\b/i,
    reason: 'Prohibited: Abusive, vulgar, or derogatory campus slang violates community standards.',
  },

  // 4. Hate Speech, slurs and discrimination
  {
    category: 'hate_speech',
    label: 'Hate Speech & Discrimination',
    regex: /\b(?:faggot\w*|nigger\w*|nigga\w*|chamar\w*|bhangi\w*|jihadi\w*|katuwa\w*|retard\w*|subhuman|hate\s+(?:all\s+)?(?:muslims|hindus|sikhs|christians|dalits|biharis|punjabis|blacks|whites|gays|lesbians)|dirty\s+(?:caste|religion|race)|go\s+back\s+to\s+your\s+country)\b/i,
    reason: 'Prohibited: Hate speech, derogatory slurs, casteism, religious intolerance, and targeted discrimination are strictly forbidden at LPU.',
  },

  // 5. Threats and Physical Violence
  {
    category: 'threats_and_violence',
    label: 'Threats & Violence',
    regex: /\b(?:kill\s+(?:you|him|her|them|everyone)|murder|shoot\s+(?:you|him|her)|bomb|stab|strangle|assassinate|slit\s+(?:your|his|her)\s+throat|beat\s+you\s+(?:up|to\s+death)|commit\s+suicide|cut\s+yourself|acid\s+attack|i\s+will\s+destroy\s+you)\b/i,
    reason: 'Prohibited: Threatening violence, physical injury, self-harm, or bodily harm is strictly forbidden.',
  },

  // 6. Ragging & Campus Intimidation
  {
    category: 'ragging_and_bullying',
    label: 'Ragging & Campus Intimidation',
    regex: /\b(?:rag(?:ging)?\s+(?:freshers?|juniors?)|junior\s+ragging|humiliate\s+freshers?|seniors?\s+will\s+torture\s+you|forced\s+intro\s+session|strip\s+juniors?|hostel\s+ragging|beat\s+juniors|extort\s+freshers)\b/i,
    reason: 'Prohibited: Lovely Professional University has a strict zero-tolerance anti-ragging policy under UGC and Supreme Court regulations.',
  },
];

// Ambiguous content requiring review
const reviewRules = [
  {
    category: 'potential_harassment',
    regex: /\b(?:bully(?:ing)?|harass(?:ment)?|target\s+someone|threaten|shame\s+him|shame\s+her)\b/i,
    reason: 'Flagged for Moderator Review: Content contains sensitive interpersonal conflict keywords.',
  },
  {
    category: 'unverified_claims',
    regex: /\b(?:scam\s+alert|exposed|corrupt\s+faculty|strike\s+at\s+campus|boycott\s+classes)\b/i,
    reason: 'Flagged for Moderator Review: Campus strike or unverified protest notices require administrative verification.',
  },
];

// Prohibited image tokens in URL, filenames, or metadata
const prohibitedImageTokens = [
  /porn/i,
  /xxx/i,
  /nude/i,
  /naked/i,
  /nsfw/i,
  /erotic/i,
  /hentai/i,
  /gore/i,
  /boob/i,
  /lewd/i,
  /fetish/i,
  /strip/i,
  /sex/i,
  /pussy/i,
  /dick/i,
  /cock/i,
  /xvideos/i,
  /onlyfans/i,
];

export function moderateText(text) {
  if (!text || typeof text !== 'string') {
    return {
      decision: DECISIONS.APPROVED,
      category: null,
      label: 'Safe',
      reason: null,
      confidence: 1.0,
    };
  }

  const raw = text.trim();
  const norm = normalizeForModeration(raw);
  const collapsed = collapseRepeats(norm);
  const spaceless = norm.replace(/\s+/g, '');
  const spacelessCollapsed = collapseRepeats(spaceless);

  // Check prohibited rules across all representations
  for (const rule of prohibitedPatterns) {
    if (
      rule.regex.test(raw) ||
      rule.regex.test(norm) ||
      rule.regex.test(collapsed) ||
      rule.regex.test(spaceless) ||
      rule.regex.test(spacelessCollapsed)
    ) {
      return {
        decision: DECISIONS.REJECTED,
        category: rule.category,
        label: rule.label,
        reason: rule.reason,
        confidence: 0.99,
      };
    }
  }

  // Explicit check for masked words like f*ck, b*tch, s*x
  if (
    /\bf[\*\._\-\s]*[uck]+k/i.test(raw) ||
    /\bfck\b/i.test(norm) ||
    /\bb[\*\._\-\s]*tch\b/i.test(raw)
  ) {
    return {
      decision: DECISIONS.REJECTED,
      category: 'sexual_profanity',
      label: 'Profanity & Vulgar Language',
      reason: 'Prohibited: Profanity violates university policy.',
      confidence: 0.99,
    };
  }

  // Check review rules
  for (const rule of reviewRules) {
    if (
      rule.regex.test(raw) ||
      rule.regex.test(norm) ||
      rule.regex.test(collapsed) ||
      rule.regex.test(spaceless)
    ) {
      return {
        decision: DECISIONS.REVIEW_REQUIRED,
        category: rule.category,
        label: 'Requires Campus Review',
        reason: rule.reason,
        confidence: 0.8,
      };
    }
  }

  return {
    decision: DECISIONS.APPROVED,
    category: null,
    label: 'Campus Approved',
    reason: null,
    confidence: 0.99,
  };
}

export function moderateImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return {
      decision: DECISIONS.APPROVED,
      category: null,
      label: 'Safe',
      reason: null,
      confidence: 1.0,
    };
  }

  const cleanUrl = imageUrl.trim().toLowerCase();

  for (const token of prohibitedImageTokens) {
    if (token.test(cleanUrl)) {
      return {
        decision: DECISIONS.REJECTED,
        category: 'sexually_explicit',
        label: 'Prohibited Image Content',
        reason: 'Prohibited: Image contains adult, explicit, or sexually suggestive indicators.',
        confidence: 0.99,
      };
    }
  }

  const isHttp = /^https?:\/\//i.test(cleanUrl);
  const isDataImage = /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(cleanUrl);

  if (isHttp || isDataImage) {
    return {
      decision: DECISIONS.APPROVED,
      category: null,
      label: 'Safe Media',
      reason: null,
      confidence: 0.95,
    };
  }

  return {
    decision: DECISIONS.REVIEW_REQUIRED,
    category: 'unverified_media',
    label: 'Media Verification Required',
    reason: 'Image format could not be verified by campus AI filters.',
    confidence: 0.6,
  };
}

export async function moderateContent({ text = '', imageUrl = null }) {
  // 1. Evaluate text
  const textResult = moderateText(text);
  if (textResult.decision === DECISIONS.REJECTED) {
    return textResult;
  }

  // 2. Evaluate image
  if (imageUrl) {
    const imageResult = moderateImage(imageUrl);
    if (imageResult.decision === DECISIONS.REJECTED) {
      return imageResult;
    }
    if (imageResult.decision === DECISIONS.REVIEW_REQUIRED) {
      return imageResult;
    }
  }

  // 3. Text review required
  if (textResult.decision === DECISIONS.REVIEW_REQUIRED) {
    return textResult;
  }

  return {
    decision: DECISIONS.APPROVED,
    category: null,
    label: 'Campus Approved',
    reason: null,
    confidence: 0.99,
  };
}

export { DECISIONS };
