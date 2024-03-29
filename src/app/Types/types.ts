export interface BasicOutageData {
  partido: string;
  localidad: string;
  afectados: number;
}

export interface OutageDataWithETA extends BasicOutageData {
  eta: string;
}

export interface ProviderIncidenceType {
  programados: OutageDataWithETA[];
  mt: OutageDataWithETA[];
  bt: BasicOutageData[];
}

export type ReportType = "cortes-bt" | "cortes-programados" | "cortes-mt";

//using a Type alias to represent an object where the keys are strings (edesur, edenor) and the keys inside of each provider are programados, bt, and mt.
// Then, programados, mt and bt are a type which contains partido/localidad/afectados and maybe eta as its keys

export type ProviderIncidenceRecord = Record<string, ProviderIncidenceType>;
