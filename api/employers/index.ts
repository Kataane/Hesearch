import { IEmployer, IShortEmployer } from "~~/@types";

export async function fetchEmployers() {
  return $fetch<IShortEmployer>(`https://api.hh.ru/employers`);
}

export async function fetchEmployer(id: string) {
  return $fetch<IEmployer>(`https://api.hh.ru/employers/${id}`);
}
