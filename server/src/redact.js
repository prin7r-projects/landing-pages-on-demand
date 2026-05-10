const REDACTION_PATTERNS = [
  {
    name: "jwt",
    pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
    replace: "[REDACTED:jwt]",
  },
  {
    name: "bearer_header",
    pattern: /Authorization:\s*Bearer\s+[^\s,"'}\]]+/gi,
    replace: "Authorization: Bearer [REDACTED:bearer]",
  },
  {
    name: "bearer_token",
    pattern: /(?<![A-Za-z0-9_-])Bearer\s+([A-Za-z0-9_\-+=]{20,})/gi,
    replace: (_m, token) => {
      // Only redact if token looks like a real credential (not a short word)
      if (token.length >= 20) return `Bearer [REDACTED:bearer]`;
      return _m;
    },
  },
  {
    name: "anthropic_key",
    pattern: /\bsk-ant-(?:api|admin)\d{2}-[A-Za-z0-9_-]{20,}\b/g,
    replace: "[REDACTED:anthropic_key]",
  },
  {
    name: "anthropic_session",
    pattern: /\bsk-ant-sid\d{2}-[A-Za-z0-9_-]{20,}\b/g,
    replace: "[REDACTED:anthropic_session]",
  },
  {
    name: "github_pat",
    pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
    replace: "[REDACTED:github_pat]",
  },
  {
    name: "github_token",
    pattern: /\bghp_[A-Za-z0-9]{30,}\b/g,
    replace: "[REDACTED:github_token]",
  },
  {
    name: "github_oauth",
    pattern: /\bgho_[A-Za-z0-9]{30,}\b/g,
    replace: "[REDACTED:github_token]",
  },
  {
    name: "openai_key",
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}\b/g,
    replace: "[REDACTED:openai_key]",
  },
  {
    name: "generic_sk_key",
    pattern: /\bsk-[A-Za-z0-9]{30,}\b/g,
    replace: "[REDACTED:api_key]",
  },
  {
    name: "postmark_token",
    pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    replace: (_m) => {
      // Only redact if it looks like a Postmark server token contextually
      if (_m.includes("X-Postmark-Server-Token")) return _m;
      return _m;
    },
  },
  {
    name: "private_key_header",
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[A-Za-z0-9+/\s=]+-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    replace: "[REDACTED:private_key]",
  },
  {
    name: "connection_string",
    pattern: /\b(?:mongodb|postgres|mysql|redis|sqlite):\/\/[^\s"'<>]+/gi,
    replace: "[REDACTED:connection_string]",
  },
  {
    name: "base64_secret",
    pattern: /\b[A-Za-z0-9+/=]{40,}\b/g,
    replace: "[REDACTED:base64_secret]",
  },
];

export function redactTokens(text) {
  if (typeof text !== "string" || !text) return text;
  let result = text;
  // Apply specific patterns first, then generic base64
  for (let i = 0; i < REDACTION_PATTERNS.length; i++) {
    const { pattern, replace } = REDACTION_PATTERNS[i];
    if (i === REDACTION_PATTERNS.length - 1) {
      // Base64 pattern — only match if not already within a [REDACTED:...] marker
      result = result.replace(pattern, (match) => {
        if (/\[REDACTED:/.test(match)) return match;
        // Don't redact if it's clearly structured JSON or HTML
        if (/[{}\[\]<>]/.test(match) || match.includes("http")) return match;
        return replace;
      });
    } else {
      result = result.replace(pattern, replace);
    }
  }
  return result;
}

export function redactPassResult(passResult) {
  if (!passResult || typeof passResult !== "object") return passResult;
  const redacted = { ...passResult };
  if (redacted.output_json) {
    try {
      const parsed = JSON.parse(redacted.output_json);
      const str = JSON.stringify(parsed);
      const redactedStr = redactTokens(str);
      redacted.output_json = redactedStr;
    } catch {
      redacted.output_json = redactTokens(redacted.output_json);
    }
  }
  if (redacted.error_message) {
    redacted.error_message = redactTokens(redacted.error_message);
  }
  return redacted;
}

export function redactRunLogs(passResults) {
  if (!Array.isArray(passResults)) return passResults;
  return passResults.map(redactPassResult);
}
