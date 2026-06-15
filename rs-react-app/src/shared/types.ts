export type Country = {
  cca3: string;
  name: { common: string; official?: string };
  flags: { png: string; svg: string; alt?: string };
  capital?: string[];
  region: string;
  population: number;
  subregion?: string;
};

export type CountryDetail = {
  name: { common: string; official?: string };
  flags: { svg: string; alt?: string };
  subregion?: string;
  languages?: string[];
};
