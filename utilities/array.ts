export function filterByUniqId<Type extends { id: string }>(
  value: Type,
  index: number,
  array: Type[]
) {
  return index === array.findIndex((v) => v.id === value.id);
}

export function sliceArray<Type>(array: Type[], size: number): Type[][] {
  return array.reduce<Type[][]>((acc, value, _index) => {
    const index = Math.floor(_index / size);
    const page = acc[index] || (acc[index] = []);
    page.push(value);
    return acc;
  }, []);
}
