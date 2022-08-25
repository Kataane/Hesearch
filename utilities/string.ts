export function toSnakeCase(s: string) {
  return s
    .replace(/\.?([A-Z])/g, function (_, y) {
      return "_" + y.toLowerCase();
    })
    .replace(/^_/, "");
}

export function cleanExtraSpaces(s: string) {
  return s.replace(/\s+/g, " ").trim();
}
