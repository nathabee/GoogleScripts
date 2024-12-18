/**
 * Retrieve the hardcoded Sheet ID.
 * @return {string} Sheet ID
 */
function getSheetId() {
  return "1NbvfvtsMHmRbXI2CFjWYVDHfoW8-cY7Yp89wVg7XmeA"; // Replace with your actual Sheet ID
}

/**
 * Helper function to include content from another HTML file.
 * @param {string} filename - The name of the HTML file to include.
 * @return {string} The content of the file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


/**
 * Serve the Web App (with a Button to trigger PDF generation).
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('webapp')
    .setTitle('PDF Generator');
}

/**
 * Generate the PDF Report.
 */
 



function generatePDF() {
  try {
    // Retrieve Sheet ID and open the Sheet
    const sheetId =  getSheetId();

 
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Data");
    if (!sheet) throw new Error("Sheet 'Data' not found.");

    // Retrieve the data from the Sheet
    const data = sheet.getRange('A1:D6').getValues();

    // Generate radar chart
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.RADAR)
      .addRange(sheet.getRange('A1:D6'))
      .setPosition(10, 2, 0, 0)
      .build();
    const chartBlob = chart.getBlob().getAs('image/png');

    // Prepare the PDF template
    const template = HtmlService.createTemplateFromFile('report');
    template.data = data; // Pass the table data to the HTML template
    const htmlOutput = template.evaluate().getContent();

    // Embed the radar chart as a base64 image
    const htmlWithImage = htmlOutput.replace(
      'cid:chart_image',
      'data:image/png;base64,' + Utilities.base64Encode(chartBlob.getBytes())
    );

    // Convert the HTML content to a PDF
    const pdfBlob = HtmlService.createHtmlOutput(htmlWithImage)
      .getBlob()
      .setName('Performance_Report.pdf')
      .getAs('application/pdf');

    // Save PDF to Google Drive
    const file = DriveApp.createFile(pdfBlob);
    const fileUrl = file.getDownloadUrl(); // Get the file's download URL

    Logger.log("PDF generated and stored. URL: " + fileUrl);
    return fileUrl; // Return the URL to the client
  } catch (e) {
    Logger.log("Error: " + e.message);
    throw new Error("Failed to generate PDF: " + e.message);
  }
}

