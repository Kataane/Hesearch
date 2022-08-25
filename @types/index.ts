import { IEmployer } from "./employers";

export * from "./employers";

export type Area = {
  id: number;
  label: string;
};

export type LogoURL = {
  $90: string;
  $240: string;
  original: string;
};

export interface IShortVacancy {
  id: string;
  premium: boolean;
  has_test: boolean;
  address: any;
  salary: ISalary;
  name: string;
  area: any;
  url: string;
  published_at: string;
  employer: Pick<
    IEmployer,
    "url" | "alternate_url" | "logo_urls" | "name" | "id"
  >;
  archived: boolean;
}

export interface IVacancy extends IShortVacancy {
  snippet: ISnippet;
}

export interface IFullVacancy extends IVacancy {
  experience: any;
  description: string;
  key_skills: { name: string }[];
  languages: any;
}

export interface ISnippet {
  requirement: string;
  responsibility: string;
}

export interface ISalary {
  from: number;
  to: number;
  currency: string;
  gross: true;
}

export type IPagination = {
  found?: number;
  perPage?: number;
  pages?: number;
  page?: number;
};
