/**
 * Retrieve the hardcoded Sheet ID.
 * @return {string} Sheet ID
 */
function getSheetId() {
  return "1HnFvjPYs59KjS8P0EC7Obos4_OEJWvjyzjRV-yThh08"; // Replace with your actual Sheet ID
}

/**
 * Helper function to include content from another HTML file.
 * @param {string} filename - The name of the HTML file to include.
 * @return {string} The content of the file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setTitle('Student Test Management');
}

/**
 * Load configuration data from the Config sheet.
 */
function getConfigData() {
  const sheetId = getSheetId();
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Config");
  if (!sheet) throw new Error("Config sheet not found.");
  const data = sheet.getRange(1, 1, sheet.getLastRow(), 2).getValues();
  return Object.fromEntries(data);
}
 

/**
 * Retrieve student data for the HTML frontend.
 */
function getStudents() {
  const sheetId = getSheetId(); // Use the standalone project's Sheet ID
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Student");
  if (!sheet) throw new Error("Student sheet not found.");
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  return data.map(row => ({
    studentId: row[0],
    firstName: row[1],
    lastName: row[2],
    grade: row[3],
  }));
}


/**
 * Load tests associated with a specific student.
 */
function getTestsByStudent(studentId) {
  const sheetId = getSheetId();
  const testSheet = SpreadsheetApp.openById(sheetId).getSheetByName("TestHistory");
  const catalogueSheet = SpreadsheetApp.openById(sheetId).getSheetByName("Catalogue");

  if (!testSheet || !catalogueSheet) {
    Logger.log("Error: Required sheets not found.");
    return []; // Return an empty array if sheets are missing
  }

  const tests = testSheet.getRange(2, 1, testSheet.getLastRow() - 1, 6).getValues();
  const catalogues = catalogueSheet.getRange(2, 1, catalogueSheet.getLastRow() - 1, 4).getValues();

  const filteredTests = tests
    .filter(row => row[2] == studentId)
    .map(test => {
      const catalogue = catalogues.find(cat => cat[0] == test[1]);
      return {
        testId: test[0],
        date: new Date(test[3]).toISOString(), // Convert Date to ISO string
        globalResult: test[4],
        status: test[5],
        catalogueName: catalogue ? catalogue[1] : "Unknown",
        maxScore: catalogue ? catalogue[3] : "N/A",
      };
    });

  Logger.log(`Backend: Completed getTestsByStudent with result: ${JSON.stringify(filteredTests)}`);
  return filteredTests; // Ensure this is JSON-serializable
}



/**
 * Load test results for a specific test.
 */
function getTestResults(testId) {
  const sheetId = getSheetId();
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("TestResults");

  if (!sheet) throw new Error("TestResults sheet not found.");

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  Logger.log(`Backend: getTestResults data : ${JSON.stringify(data)}`);

  // Filter rows matching testId
  const filteredTestResults = data.filter(row => row[0] == testId);
  Logger.log(`Backend: filteredTestResults : ${JSON.stringify(filteredTestResults)}`);

  // Convert to objects for better readability in the frontend
  const resultsWithLabels = filteredTestResults.map(row => ({ 
    description: row[1], // Use the description field for chart labels
    points: row[2],
    maxPoints: row[3],
    seuil1: row[4],
    seuil2: row[5],
    seuil3: row[6],
    totalSeuil: row[7],
  }));

  Logger.log(`Backend: Results with labels: ${JSON.stringify(resultsWithLabels)}`);
  return resultsWithLabels;
}



/**
 * Generate the PDF Report.
 */
 
function generatePDF(studentId, testId) {
  try {
    const sheetId = getSheetId();
    const spreadsheet = SpreadsheetApp.openById(sheetId); // Explicitly open the spreadsheet
    const tmpSheetName = "Tmp";
    let tmpSheet = spreadsheet.getSheetByName(tmpSheetName);

    // Ensure the Tmp sheet exists
    if (!tmpSheet) {
      tmpSheet = spreadsheet.insertSheet(tmpSheetName);
    } else {
      tmpSheet.clear(); // Clear any existing data
    }

    const studentSheet = spreadsheet.getSheetByName("Student");
    const testResultsSheet = spreadsheet.getSheetByName("TestResults");

    // Fetch student information
    const students = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1, 4).getValues();
    const student = students.find(row => row[0] == studentId);
    if (!student) throw new Error("Student not found.");
    const studentName = `${student[1]} ${student[2]}`;

    // Fetch test results
    const results = testResultsSheet.getRange(2, 1, testResultsSheet.getLastRow() - 1, 8).getValues();
    const filteredResults = results
      .filter(row => row[0] == testId)
      .map(row => ({
        description: row[1],
        totalSeuil: row[7], // Assume `totalSeuil` is the 8th column
      }));
    if (filteredResults.length === 0) throw new Error("No results found for the test.");

    // Prepare data for radar chart
    const labels = filteredResults.map(r => r.description);
    const values = filteredResults.map(r => r.totalSeuil);

    

    // Write radar chart data to Tmp sheet
    tmpSheet.getRange(1, 1, labels.length, 1).setValues(labels.map(label => [label])); // Labels in column A
    tmpSheet.getRange(1, 2, values.length, 1).setValues(values.map(value => [value])); // Values in column B

    // Determine the next available row for the chart
    const lastRow = tmpSheet.getLastRow(); // Get the last occupied row
    const chartRowPosition = Math.max(lastRow + 2, 5); // Minimum row position is 5
    const chartColumnPosition = 1; // Fixed column position


    Logger.log(`Backend: lastRow : ${lastRow}   ,  chartRowPosition : ${chartRowPosition} ,  chartColumnPosition : ${chartColumnPosition} `);
    // 8 10 1

    // Validate position values
    if (chartRowPosition <= 0 || chartColumnPosition <= 0) {
      throw new Error(`Invalid chart position: row=${chartRowPosition}, column=${chartColumnPosition}`);
    }

    // Create radar chart
    const chart = tmpSheet.newChart()
      .setChartType(Charts.ChartType.RADAR)
      .addRange(tmpSheet.getRange(1, 1, labels.length, 2)) // Use labels and values
      .setPosition(chartRowPosition, chartColumnPosition,0 ,0) // Place the chart dynamically below the data
      .build();


    Logger.log(`Backend: newChart called  `);

    tmpSheet.insertChart(chart); // Insert the chart into the Tmp sheet
    const chartBlob = chart.getBlob().getAs('image/png');
    const chartBase64 = Utilities.base64Encode(chartBlob.getBytes());

    Logger.log(`Backend: insertChart  called  `);
    // Prepare data for the template
    const data = {
      studentName,
      testId,
      testResults: filteredResults,
    };

    // Prepare the PDF template
    const template = HtmlService.createTemplateFromFile('report');
    template.data = data;
    template.chartImage = chartBase64;

    // Generate HTML for the PDF
    const htmlOutput = template.evaluate().getContent();

    // Convert to PDF and save
    const pdfBlob = HtmlService.createHtmlOutput(htmlOutput)
      .getBlob()
      .setName(`Report_${studentName}_${testId}.pdf`)
      .getAs('application/pdf');

    const file = DriveApp.createFile(pdfBlob);
    const fileUrl = file.getDownloadUrl();

    Logger.log(`PDF generated: ${fileUrl}`);
    return { fileUrl, studentName };
  } catch (e) {
    Logger.log(`Error in generatePDF: ${e.message}`);
    throw new Error(`Failed to generate PDF: ${e.message}`);
  }
}




