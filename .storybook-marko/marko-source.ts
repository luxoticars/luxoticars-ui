/*
  Builds the Marko snippet a story's "Show code" panel shows. @storybook/marko
  declares dynamic docs source but ships no decorator that produces any, so
  without this the panel opens empty. The snippet is the tag with the story's
  current args as attributes, in the concise syntax this repo writes Marko in.
*/

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const LINE_LIMIT = 80;

/** A JS literal, not JSON: object keys are bare where they can be. */
function literal(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(literal).join(", ")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined && typeof v !== "function");
    if (!entries.length) return "{}";
    return `{ ${entries.map(([k, v]) => `${IDENTIFIER.test(k) ? k : JSON.stringify(k)}: ${literal(v)}`).join(", ")} }`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function attribute(name: string, value: unknown): string | undefined {
  if (value === undefined || value === null || typeof value === "function") return undefined;
  if (value === true) return name;
  if (typeof value === "string") return `${name}=${JSON.stringify(value)}`;
  if (typeof value === "number" || typeof value === "boolean") return `${name}=${value}`;
  return `${name}=${literal(value)}`;
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
