import { randomInterval } from "./math";

export const isFulfilled = <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => input.status === "fulfilled";

export const getFulfilledValue = <T>(input: PromiseSettledResult<T>): T =>
  input.status === "fulfilled"
    ? (input as PromiseFulfilledResult<T>).value
    : null;

export async function pause(min: number, max: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, randomInterval(min, max))
  );
}

export function serial(funcs: any[]) {
  return funcs.reduce(
    (promise, func) =>
      promise.then((result: any) =>
        func().then(Array.prototype.concat.bind(result))
      ),
    Promise.resolve([])
  );
}
