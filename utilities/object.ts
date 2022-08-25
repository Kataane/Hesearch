import { toSnakeCase } from "./string";

export function toFlatObject(o: object) {
  function flat(o: object) {
    return Object.entries(o).flatMap(([key, val]) => {
      const snakeCaseKey = toSnakeCase(key);
      if (typeof val === "object") return flat(val);
      return [[snakeCaseKey, val]];
    });
  }

  return Object.fromEntries(flat(o));
}
