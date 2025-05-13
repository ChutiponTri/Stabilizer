import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Pressure } from "./Query";

function Excel(patient: string, filename: string, data: Pressure[]) {
  // Convert JSON data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const columnWidths = [
    { wch: 10 },        // Column 1 width (pressure)
    { wch: 25 },        // Column 2 width (timestamp)
  ];

  // Add column width to worksheet
  worksheet["!cols"] = columnWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pressure Data");

  // Convert workbook to binary and create a Blob
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  // Trigger download
  saveAs(dataBlob, `${patient}_${filename}.xlsx`);

  return true;
};

export default Excel;
