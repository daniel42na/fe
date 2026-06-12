export type EmployeeStatus =
  | "mitarbeiter"
  | "bewerber"
  | "ehemalig"
  | "zukuenftig"
  | "bewerber-cockpit";

export type Employee = {
  id: string;
  nachname: string;
  vorname: string;
  beruf: string;
  telefon: string;
  plz: string;
  eintritt: string;
  ueberlassen: string;
  status: EmployeeStatus;
  image?: string;
};

export type EmployeeFilterOption = {
  value: string;
  label: string;
};

export type EmployeeFilters = {
  beruf: EmployeeFilterOption[];
  plz: EmployeeFilterOption[];
  eintritt: EmployeeFilterOption[];
  ueberlassen: EmployeeFilterOption[];
  status: EmployeeFilterOption[];
};
