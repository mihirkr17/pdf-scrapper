const ExcelJs = require("exceljs");
const path = require("path");
const { consoleLogger } = require("../utils");

// Excel manager
class ExcelManager {

   workbook = null;
   worksheet = null;
   absPath = "";

   // adding rows to newly created excel
   async __addRowsToExcel(xlData, outputPath) {
      try {

         this.workbook = new ExcelJs.Workbook();

         if (xlData.length >= 1) {
            this.worksheet = this.workbook.addWorksheet("Sheet 1");

            this.worksheet.addRows(xlData);

            return await this.workbook.xlsx.writeFile(outputPath);
         } else {
            throw new Error("Cannot add rows to Excel: xlData is an empty array.");
         }

      } catch (error) {
         consoleLogger(`Error in addRowsToExcel function, Message: ${error?.message}`);
         throw error;
      }
   }

   // creating new excel with multidimensional array 
   async createExcel(arr, type = null) {
      try {

         if (!Array.isArray(arr) || !Array.isArray(arr[0])) {
            throw new Error("Given data is not a two-dimensional array.", 400);
         }

         const outputPath = path.resolve(__dirname, `../resource/post.xlsx`);


         await this.__addRowsToExcel(arr, outputPath);

         return outputPath;
      } catch (error) {
         consoleLogger(`Error in createExcel function: ${error.message}`);
         throw new Error(`Error in createExcel function: ${error.message}`); // Re-throw the original error for better debugging
      }
   }

   // Getting excel data
   async getExcel(startFrom = 2) {
      try {
         if (!startFrom || typeof startFrom !== "number") throw new Error("Start value must be integer value!", 400);


         this.absPath = path.resolve(__dirname, `../resource/post.xlsx`);

         this.workbook = new ExcelJs.Workbook();

         await this.workbook.xlsx.readFile(this.absPath);

         // Update: Check if there's at least one sheet
         if (this.workbook?.sheetNames?.length === 0) {
            throw new Error('Workbook does not contain any sheets.');
         }

         this.worksheet = this.workbook.getWorksheet(1);

         console.log('Sheet Names:', this.workbook.sheetNames);

         // Update: Check if the worksheet object is available
         if (!this.worksheet) {
            throw new Error(`Worksheet not found at index`);
         }

         const rowCount = this.worksheet.actualRowCount;

         const excelRows = [];

         for (let i = startFrom; i <= rowCount; i++) {
            const row = this.worksheet.getRow(i);
            const colA = row.getCell("A");
            const colB = row.getCell("B");
            const colC = row.getCell("C");
            const colD = row.getCell("D");
            const colE = row.getCell("E");
            const colF = row.getCell("F");
            const colG = row.getCell("G");


            excelRows.push({
               language: colA?.text || colA.value || null,
               languageCode: colB?.text || colB.value || null,
               category: colC?.text || colC?.value || null,
               title: colD?.text || colD?.value || null,
               contents: colE?.text || colE?.value || null,
               tags: colF?.text || colF?.value || null,
               eventName: colG?.text || colG?.value || null,
            })
         }

         return { excelRows, totalRowsCount: startFrom >= 2 ? rowCount - 1 : rowCount, excelRowsCount: excelRows && excelRows.length };
      } catch (error) {
         throw new Error(`Error in getExcel function : ${error?.message}`);
      }
   }
}

module.exports = ExcelManager;

