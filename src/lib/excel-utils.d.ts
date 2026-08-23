declare module "./excel-utils" {
  export function readExcel<T>(file: File): Promise<{ data: T[]; errors: string[] }>;
}
