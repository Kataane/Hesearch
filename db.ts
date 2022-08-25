import Dexie, { IndexableType, Table } from "dexie";
import { Area, IEmployer, IFullVacancy } from "./@types";

type RequestSchema = {
  id?: IndexableType;
  text?: string;
  area?: Area;
  date: string;
};

interface IVacancySchema {
  id?: IndexableType;
  requestId: IndexableType;
  vacancies?: IFullVacancy[];
}

interface IEmployersSchema {
  id?: IndexableType;
  requestId: IndexableType;
  employers?: IEmployer[];
}

export type Skill = {
  name: string;
  count: number;
};

interface ISkillsSchema {
  id?: IndexableType;
  requestId: IndexableType;
  skills?: Skill[];
}

export class MySubClassedDexie extends Dexie {
  requests!: Table<RequestSchema>;
  vacancies!: Table<IVacancySchema>;
  employers!: Table<IEmployersSchema>;
  skills!: Table<ISkillsSchema>;

  constructor() {
    super("hh");
    this.version(1).stores({
      requests: "++id, date, &[text+area.id], area.label",
      vacancies: "++id, &requestId, *vacancies",
      employers: "++id, &requestId, *employers",
      skills: "++id, &requestId, *skills",
    });
  }
}

export const db = new MySubClassedDexie();
