import XLSX from 'xlsx';

export const readExcel = (filePath: string): any[] => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet) as any[];
};
