import { toFlatObject } from "~/utilities/object";
import { IVacancy, IFullVacancy, IPagination, Area } from "~/@types/index";

export interface IVacancyParams extends IPagination {
  text: string;
  area: number;
}

export interface IVacanciesResponse extends IPagination {
  items: IVacancy[];
}

export async function getVacancies(params?: IVacancyParams) {
  const flat = toFlatObject(params);
  return $fetch<IVacanciesResponse>("https://api.hh.ru/vacancies", {
    params: flat,
    retry: 3,
  });
}

export async function getFullVacancy(id: string) {
  return $fetch<IFullVacancy>(`https://api.hh.ru/vacancies/${id}`, {
    retry: 3,
  });
}
