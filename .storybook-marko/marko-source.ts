/*
  Builds the Marko snippet a story's "Show code" panel shows. @storybook/marko
  declares dynamic docs source but ships no decorator that produces any, so
  without this the panel opens empty. The snippet is the tag with the story's
  current args as attributes, in the concise syntax this repo writes Marko in.
*/

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const LINE_LIMIT = 80;

const MAX_DEPTH = 6;

function isPlain(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * A JS literal, not JSON: object keys are bare where they can be. `undefined` for
 * what cannot be written as a literal: functions, class instances such as a Marko
 * template, anything circular or nested deeper than a story would pass.
 */
function literal(value: unknown, depth = 0, seen = new WeakSet<object>()): string | undefined {
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return undefined;
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (depth >= MAX_DEPTH || seen.has(value)) return undefined;
  if (!Array.isArray(value) && !isPlain(value)) return undefined;
  seen.add(value);
  try {
    if (Array.isArray(value)) return `[${value.map((item) => literal(item, depth + 1, seen) ?? "undefined").join(", ")}]`;
    const entries = Object.entries(value).flatMap(([key, item]) => {
      const text = literal(item, depth + 1, seen);
      return text === undefined ? [] : [`${IDENTIFIER.test(key) ? key : JSON.stringify(key)}: ${text}`];
    });
    return entries.length ? `{ ${entries.join(", ")} }` : "{}";
  } finally {
    seen.delete(value);
  }
}

function attribute(name: string, value: unknown): string | undefined {
  if (value === undefined || value === null || typeof value === "function") return undefined;
  if (value === true) return name;
  if (typeof value === "string") return `${name}=${JSON.stringify(value)}`;
  if (typeof value === "number" || typeof value === "boolean") return `${name}=${value}`;
  const text = literal(value);
  return text === undefined ? undefined : `${name}=${text}`;
}

/** `src/marko/lx-logo/stories.ts` is `lx-logo`; `stories-marko/price-filter.stories.ts` is `price-filter`. */
export function tagNameFromFile(fileName: string | undefined): string | undefined {
  if (!fileName) return undefined;
  const parts = fileName.replace(/\\/g, "/").split("/");
  const file = parts.at(-1) ?? "";
  if (file === "stories.ts") return parts.at(-2);
  return file.replace(/\.stories\.ts$/, "") || undefined;
}

export function markoSnippet(tag: string, args: Record<string, unknown>): string {
  const attrs = Object.entries(args)
    .map(([name, value]) => attribute(name, value))
    .filter((attr): attr is string => attr !== undefined);
  const oneLine = [tag, ...attrs].join(" ");
  if (oneLine.length <= LINE_LIMIT && !oneLine.includes("\n")) return oneLine;
  return [tag, ...attrs.map((attr) => `  ,${attr}`)].join("\n");
}
