import { LogoURL } from "./index";

export interface IShortEmployer {
  id: string;
  name: string;
  url: string;
  alternate_url: string;
  vacancies_url: string;
  open_vacancies: number;
  logo_urls: any;
}

export interface IEmployer extends IShortEmployer {
  site_url: string;
  description: string;
  branded_description: string;
  trusted: boolean;
  insider_interviews: any;
  logo_urls: LogoURL;
  area: any;
  industries: any;
}
