interface IAreasParams {
  text?: string;
  locale?: string;
}

export interface ISuggestsArea {
  id: string;
  text: string;
}

interface ISuggestsAreas {
  items: ISuggestsArea[];
}

export async function getSuggestsAreas(
  params?: IAreasParams,
  pick?: any | string[]
) {
  return await useFetch<ISuggestsAreas>("https://api.hh.ru/suggests/areas", {
    params: params,
    pick: pick,
  });
}
