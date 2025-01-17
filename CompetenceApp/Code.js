/***************************************
 * CONSTANTS
 * *************************************/
const DEFAULT_SHEET_ID = "1HnFvjPYs59KjS8P0EC7Obos4_OEJWvjyzjRV-yThh08"; // Default Sheet ID
const COMPETENCE_APP_FOLDER_NAME = "CompetenceAppData"; // Folder name for storing app data
const SHEET_ID_FILE_NAME = "sheetId.json"; // File name for storing the Sheet ID
const DEFAULT_TEMPLATE_REPORT_ID = "1LshrcbX0bN5V56O2VvnO9h9-rDI0NLqO12DZY8Bo8Ns"; // Default Sheet ID


/***************************************
 * START POINT
 * *************************************/
function doGet(e) {
  let page = e.parameter.mode || "Home";
  let html = HtmlService.createTemplateFromFile(page).evaluate();
  let htmlOutput = HtmlService.createHtmlOutput(html);
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  //Replace {{NAVBAR}} with the Navbar content
  htmlOutput.setContent(htmlOutput.getContent().replace("{{NAVBAR}}", getNavbar(page)));
  return htmlOutput;
}

/***************************************
 * SHEET MANAGEMENT
 * *************************************/

/**
 * Get or create a folder named 'CompetenceAppData' in the user's Google Drive.
 * Ensures the folder is unique to this app.
 * @return {GoogleAppsScript.Drive.Folder} The CompetenceAppData folder for the user.
 */
 function getCompetenceAppDataFolder() {
  const folders = DriveApp.getFoldersByName(COMPETENCE_APP_FOLDER_NAME);

  if (folders.hasNext()) {
    return folders.next(); // Use existing folder
  } else {
    return DriveApp.createFolder(COMPETENCE_APP_FOLDER_NAME); // Create and return folder if none exists
  }
}


function ensureUniqueFileName(folder, name) {
  const files = folder.getFilesByName(name);
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName() === name) {
      file.setTrashed(true); // Trash the old file with the same name
    }
  }
}


 
/**
 * Store a user-specific Sheet ID in the CompetenceAppData folder with history management.
 * @param {string} sheetId - The Sheet ID to store.
 */
function setSheetId(sheetId) {
  const fileName = SHEET_ID_FILE_NAME;
  const folder = getCompetenceAppDataFolder();
  const userEmail = Session.getActiveUser().getEmail(); // Get the email of the active user

  const files = folder.getFilesByName(fileName);
  let data = {};

  // Read existing data if the file exists
  if (files.hasNext()) {
    const file = files.next();
    const content = JSON.parse(file.getBlob().getDataAsString());
    data = content || {};
  }

  // Initialize user data if it doesn't exist
  if (!data[userEmail]) {
    data[userEmail] = {
      activeSheetId: sheetId,
      history: []
    };
  }

  // Update user data
  const userData = data[userEmail];
  userData.activeSheetId = sheetId; // Set the active Sheet ID

  // Add the Sheet ID to the history if it's not already there
  if (!userData.history.includes(sheetId)) {
    userData.history.push(sheetId);
  }

  // Write the updated data back to the file
  if (files.hasNext()) {
    const file = files.next();
    file.setContent(JSON.stringify(data));
  } else {
    folder.createFile(fileName, JSON.stringify(data));
  }

  Logger.log(`Stored Sheet ID for user ${userEmail}: ${sheetId}`);
}


/**
 * Retrieve the active Sheet ID for the current user.
 * If none is set, use the default Sheet ID.
 * @return {string} The active Sheet ID or the default value.
 */
function getSheetId() {
  const fileName = SHEET_ID_FILE_NAME;
  const folder = getCompetenceAppDataFolder();
  const userEmail = Session.getActiveUser().getEmail(); // Get the email of the active user

  const files = folder.getFilesByName(fileName);

  if (files.hasNext()) {
    const file = files.next();
    const content = JSON.parse(file.getBlob().getDataAsString());

    // Return the active Sheet ID if it exists
    if (content[userEmail] && content[userEmail].activeSheetId) {
      return content[userEmail].activeSheetId;
    }
  }

  // Default Sheet ID
  return DEFAULT_SHEET_ID;
}


/**
 * Switch to another sheet by updating the stored Sheet ID.
 * @param {string} newSheetId - The new Sheet ID to switch to.
 * @return {string} Confirmation message.
 */
function switchToAnotherSheet(newSheetId) {
  setSheetId(newSheetId);
  Logger.log("Switched to new Sheet ID: " + newSheetId);
  Logger.log("Current stored Sheet ID: " + getSheetId());
  return `Switched to Sheet ID: ${newSheetId}`;
}

/**
 * Retrieve information about the active sheet and spreadsheet.
 * @return {Object} Spreadsheet and sheet information.
 */

/*
function getActiveSheetInfo() {
  const sheetId = getSheetId();
  Logger.log(`Retrieving info for Sheet ID: ${sheetId}`);

  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getActiveSheet();
    const spreadsheetName = spreadsheet.getName();
    const sheetName = sheet.getName();
    const data = sheet.getRange(1, 1, Math.min(sheet.getLastRow(), 5), Math.min(sheet.getLastColumn(), 5)).getValues();
    const contentPreview = data.map(row => row.join("\t")).join("\n");
    return { spreadsheetName, sheetId, sheetName, contentPreview };
  } catch (error) {
    Logger.log("Error retrieving active sheet info: " + error.message);
    return {
      spreadsheetName: "N/A",
      sheetId,
      sheetName: "N/A",
      contentPreview: "Error accessing the spreadsheet. Check if the Sheet ID is valid and shared appropriately."
    };
  }
}

 */

function getActiveSheetInfo() {
  const sheetId = getSheetId(); // Retrieve the stored Sheet ID
  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getActiveSheet();
    const spreadsheetName = spreadsheet.getName();
    const sheetName = sheet.getName();
    const data = sheet.getRange(1, 1, Math.min(sheet.getLastRow(), 5), Math.min(sheet.getLastColumn(), 5)).getValues();
    return {
      spreadsheetName,
      sheetId,
      sheetName,
      contentPreview: data
    };
  } catch (error) {
    Logger.log("Error retrieving active sheet info: " + error.message);
    return null;
  }
}


/**
 * Retrieve the list of all Sheet IDs the current user has used.
 * @return {Array<string>} List of Sheet IDs.
 */
function getUserSheetHistory() {
  const fileName = SHEET_ID_FILE_NAME;
  const folder = getCompetenceAppDataFolder();
  const userEmail = Session.getActiveUser().getEmail(); // Get the email of the active user

  const files = folder.getFilesByName(fileName);

  if (files.hasNext()) {
    const file = files.next();
    const content = JSON.parse(file.getBlob().getDataAsString());

    // Return the user's Sheet history if it exists
    if (content[userEmail] && content[userEmail].history) {
      return content[userEmail].history;
    }
  }

  // Return an empty list if no history exists
  return [];
}
 

/**
 * Reset the active Sheet ID for the current user to the default value.
 */
function resetToDefaultSheetId() {
  const fileName = SHEET_ID_FILE_NAME;
  const folder = getCompetenceAppDataFolder();
  const userEmail = Session.getActiveUser().getEmail(); // Get the email of the active user

  const files = folder.getFilesByName(fileName);
  let data = {};

  if (files.hasNext()) {
    const file = files.next();
    const content = JSON.parse(file.getBlob().getDataAsString());
    data = content || {};

    // Reset the active Sheet ID to the default value
    if (data[userEmail]) {
      data[userEmail].activeSheetId = DEFAULT_SHEET_ID;
    }

    // Write the updated data back to the file
    file.setContent(JSON.stringify(data));
    Logger.log(`Reset active Sheet ID for user ${userEmail} to default.`);
  } else {
    Logger.log('No data file found. Nothing to reset.');
  }
}

 



/***************************************
 * NAVBAR FOOTER AND MULTIPAGE
 * ************************************* */
 
//Create Navigation Bar
function getNavbar(activePage) {
  var scriptURLHome = getScriptURL();
  var scriptURLConfig = getScriptURL("mode=Config");
  var scriptURLForm = getScriptURL("mode=Form");
  var scriptURLReportForm = getScriptURL("mode=ReportForm");  // TEST BECAUSE MakeReportForm is getting bugged
  var scriptURLReportHistory = getScriptURL("mode=ReportHistory");  
  var scriptURLTestResultForm = getScriptURL("mode=TestResultForm");  
  var scriptURLTestTypeForm = getScriptURL("mode=TestTypeForm");  

  var navbar = 
    `<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
        <a class="navbar-brand" href="${scriptURLHome}" target="_top">Competence App</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
            <a class="nav-item nav-link ${activePage === 'Home' ? 'active' : ''}" href="${scriptURLHome}" target="_top">Home</a>
            <a class="nav-item nav-link ${activePage === 'Config' ? 'active' : ''}" href="${scriptURLConfig}" target="_top">Config</a>
            <a class="nav-item nav-link ${activePage === 'Form' ? 'active' : ''}" href="${scriptURLForm}" target="_top">Form</a>
            <a class="nav-item nav-link ${activePage === 'ReportForm' ? 'active' : ''}" href="${scriptURLReportForm}" target="_top">ReportForm</a> 
            <a class="nav-item nav-link ${activePage === 'ReportHistory' ? 'active' : ''}" href="${scriptURLReportHistory}" target="_top">Report History</a> 
            <a class="nav-item nav-link ${activePage === 'TestResultForm' ? 'active' : ''}" href="${scriptURLTestResultForm}" target="_top">Test Result Form</a> 
            <a class="nav-item nav-link ${activePage === 'TestTypeForm' ? 'active' : ''}" href="${scriptURLTestTypeForm}" target="_top">TestTypeForm</a> 
          </div>
        </div> 
        </div>
      </nav>`;
  return navbar;
}

 

//returns the URL of the Google Apps Script web app
function getScriptURL(qs = null) {
  var url = ScriptApp.getService().getUrl();
  Logger.log("getScriptURL url ",url);
  Logger.log("getScriptURL qs ",qs);
  if(qs){
    if (qs.indexOf("?") === -1) {
      qs = "?" + qs;
    }
    url = url + qs;
  }
  Logger.log("getScriptURL new url ",url);
  return url;
}


//INCLUDE HTML PARTS, EG. JAVASCRIPT, CSS, OTHER HTML FILES
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
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
 


/***************************************
 * COMPETENCE APP 
 * ************************************* */

// **************************************************************************************
 /* SAME CODE THAN Competence AddOn */
// **************************************************************************************





// **************************************************************************************

// If the ID will always be in column A, we can directly use this information to streamline the process of calculating the next unique ID
function generateNextId(sheet) {
  const columnAValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues(); // Get all values from column A (ignoring header)
  const ids = columnAValues.flat().filter(id => !isNaN(id) && id > 0); // Flatten the 2D array and filter numeric values
  const maxId = ids.length > 0 ? Math.max(...ids) : 0; // Get the max ID, default to 0 if no IDs exist
  return maxId + 1; // Increment the max ID by 1
}


// **************************************************************************************

function getCatalogues() {
  const sheetId = getSheetId(); // Retrieve the active or configured sheet ID
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Catalogue');
  if (!sheet) throw new Error("Catalogue sheet not found.");
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues(); // Assuming headers are in the first row
  return data.map(row => ({
    catalogueID: row[0],
    catalogueName: row[1]
  }));
}

function getCatalogueIdByTestId(testId) {
  const sheetId = getSheetId();
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('TestHistory');
  if (!sheet) throw new Error("TestHistory sheet not found.");

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  const test = data.find(row => row[0] == testId);

  Logger.log(`Backend: Retrieved CatalogueID for TestID ${testId}: ${test ? test[1] : 'Not Found'}`);
  return test ? test[1] : null; // Return CatalogueID or null
}


 

function getTestTypes() {
  const sheetId = getSheetId();
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('TestType');
  if (!sheet) throw new Error("TestType sheet not found.");

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues(); // Adjust range for four columns
  const testTypes = data
    .filter(row => row[0] && row[1] && row[2] && row[3]) // Exclude rows with missing data
    .map(row => ({
      testTypeID: row[0],
      catalogueID: row[1],
      description: row[2],
      maxScore: row[3],
    }));

  Logger.log(`Test Types: ${JSON.stringify(testTypes)}`);
  return testTypes;
}
 
function getTestTypesByCatalogueId(catalogueId) {
  const sheetId = getSheetId();
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('TestType');
  if (!sheet) throw new Error("TestType sheet not found.");

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  const filteredTestTypes = data
    .filter(row => row[1] == catalogueId)
    .map(row => ({
      testTypeId: row[0],
      description: row[2],
      maxScore: row[3],
    }));

  Logger.log(`Backend: Retrieved TestTypes for CatalogueID ${catalogueId}: ${JSON.stringify(filteredTestTypes)}`);
  return filteredTestTypes; // Return list of TestTypes
}



function addTestType(data) {
  const sheetId = getSheetId();
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('TestType');
  if (!sheet) throw new Error("TestType sheet not found.");

  // Log the received data for debugging
  Logger.log(`Received data: ${JSON.stringify(data)}`);

  // Ensure that `data` contains the correct keys
  if (!data.catalogueID || !data.testType || !data.maxScore || !data.seuil1 || !data.seuil2 ) {
    throw new Error("Incomplete data: All fields are required.");
  }

  // Generate the next unique TestTypeID
  const testTypeId = generateNextId(sheet);

  // Append the new test type to the sheet
  sheet.appendRow([testTypeId, data.catalogueID, data.testType, data.maxScore, data.seuil1, data.seuil2]);
  Logger.log(`Added new test type with ID: ${testTypeId}`);
}




function removeTestType(description) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TestType');
  if (!sheet) {
    throw new Error('TestType sheet does not exist.');
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) { // Start at 1 to skip header row
    if (data[i][2] === description) { // Match the Description column
      sheet.deleteRow(i + 1); // Delete row (i+1 to account for header row)
      return;
    }
  }

  throw new Error(`Test type "${description}" not found.`);
}
// **************************************************************************************

function saveTestResult(data) {
  if (!data.studentName || !data.testType || !data.score) {
    SpreadsheetApp.getUi().alert('All fields are required.');
    return;
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TestResults');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Sheet "TestResults" not found. Please create it first.');
    return;
  }
  sheet.appendRow([data.studentName, data.testType, data.score]);
  SpreadsheetApp.getUi().alert('Test result saved!');
}
 


function getTestTypeMaxScore(testTypeId) {
  const sheetId = getSheetId();
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('TestType');
  if (!sheet) throw new Error("TestType sheet not found.");

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  const testType = data.find(row => row[0] == testTypeId);
  return testType ? testType[3] : null; // Return MaxScore if found
}


function addTestResult(data) {
  const sheetId = getSheetId();
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('TestResults');
  if (!sheet) throw new Error("TestResults sheet not found.");

  const nextId = generateNextId(sheet); // Generate unique ID for TestResultID
  sheet.appendRow([
    nextId,
    data.testId,
    data.testTypeId,
    data.points,
    data.maxScore,
    calculateSeuil(data.points, data.maxScore, 1),
    calculateSeuil(data.points, data.maxScore, 2),
    calculateSeuil(data.points, data.maxScore, 3),
    calculateTotalSeuil(data.points, data.maxScore),
    data.result,
    "", // Placeholder for Icone
  ]);
}

function calculateSeuil(points, maxScore, seuil) {
  // Logic for seuil calculation
  return seuil === 1 ? (points / maxScore) * 50 : seuil === 2 ? points / maxScore * 30 : 0;
}

function calculateTotalSeuil(points, maxScore) {
  return (points / maxScore) * 100; // Example calculation
}



// **************************************************************************************


// Function to include other HTML files as templates
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
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

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error("No data available in the TestResults sheet.");

  const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues(); // Ensure numeric arguments

  // Filter rows for the given testId
  const filteredTestResults = data.filter(row => row[1] == testId);

  if (filteredTestResults.length === 0) {
    Logger.log("No matching test results found for testId: " + testId);
    return []; // Return an empty array if no matches found
  }

  // Ensure each row has valid data and fallback values for missing ones
  return filteredTestResults.map(row => ({
    description: row[2] || "N/A", // Fallback to "N/A" if empty
    points: row[3] || 0,
    maxPoints: row[4] || 1, // Avoid division by zero
    seuil1: row[5] || 0,
    seuil2: row[6] || 0,
    seuil3: row[7] || 0,
    totalSeuil: row[8] || 0,
  }));
}


// ************************************************************************************



/**
 * Extraction data for the PDF Report.
 */

function fetchReportData(studentId, testId) {
  const sheetId = getSheetId();
  const spreadsheet = SpreadsheetApp.openById(sheetId);

  const studentSheet = spreadsheet.getSheetByName("Student");

  const students = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1, 4).getValues();
  const student = students.find(row => row[0] == studentId);
  if (!student) throw new Error("Student not found.");

  const studentName = `${student[1]} ${student[2]}`;
  const grade = `${student[3]}`;

  const testResults = getTestResults(testId);

  if (testResults.length === 0) {
    Logger.log(`No test results found for testId: ${testId}`);
  }

  const labels = testResults.map(r => r.description);
  const values = testResults.map(r => r.totalSeuil);

  const chartBlob = createRadarChart(labels, values);

  return { studentName, grade, testResults, chartBlob };
}


 

/**
 * Create a radar chart and return it as a Blob.
 */
function createRadarChart(labels, values) {
  const sheetId = getSheetId();
  const spreadsheet = SpreadsheetApp.openById(sheetId);

  // Create a temporary sheet
  const tempSheet = spreadsheet.insertSheet("TempChartSheet");
  Logger.log("Inserting labels and values into the sheet...");
  tempSheet.getRange(1, 1, labels.length, 1).setValues(labels.map(label => [label]));
  tempSheet.getRange(1, 2, values.length, 1).setValues(values.map(value => [value]));

  Logger.log("Building radar chart...");
  const chart = tempSheet.newChart()
    .setChartType(Charts.ChartType.RADAR)
    .addRange(tempSheet.getRange(1, 1, labels.length, 2))
    .setPosition(1, 3, 0, 0)
    .build();
  tempSheet.insertChart(chart);

  Logger.log("Fetching chart blob...");
  const chartBlob = chart.getBlob();
  Logger.log("Chart blob size: " + chartBlob.getBytes().length);

  if (!chartBlob || chartBlob.getBytes().length === 0) {
    throw new Error("ChartBlob is empty or invalid.");
  }


  // Cleanup the temporary sheet
  spreadsheet.deleteSheet(tempSheet);

  return chartBlob;


  
}

/**
 * Generate the HTML Report with a template.
 */
function generateHTMLReport(studentId, testId) {
  try {
    Logger.log("Starting HTML report generation...");

    const data = fetchReportData(studentId, testId);
    Logger.log("Fetched report data: " + JSON.stringify(data));

    const { studentName, grade, testResults, chartBlob } = data;

    if (!chartBlob || chartBlob.getBytes().length === 0) {
      throw new Error("ChartBlob is empty or not generated.");
    }

    const chartImageBase64 = Utilities.base64Encode(chartBlob.getBytes());
    Logger.log("Generated radar chart as Base64 image");  

    const filteredTestResults = testResults.map(row => ({
      description: row.description || "N/A",
      points: row.points || 0,
      maxPoints: row.maxPoints || 0,
      seuil1: row.seuil1 || 0,
      seuil2: row.seuil2 || 0,
      seuil3: row.seuil3 || 0,
      totalSeuil: row.totalSeuil || 0,
    }));

    const template = HtmlService.createTemplateFromFile("PdfReportTemplate");
    template.data = { studentName, grade, testResults: filteredTestResults };
    template.chartImage = chartImageBase64;

    const htmlOutput = template.evaluate().getContent();
    Logger.log("Generated HTML content from template");

    // Return the HTML content directly to the frontend
    return htmlOutput;

  } catch (error) {
    Logger.log("Error during HTML generation: " + error.message);
    throw new Error(`Failed to generate HTML: ${error.message}`);
  }
}


 

/**
 * Generate the PDF Report with HTML template.
 */
function generatePDFUrl(studentId, testId) {
  try {
    Logger.log("Starting PDF generation...");

    const data = fetchReportData(studentId, testId);
    Logger.log("Fetched report data: " + JSON.stringify(data));

    const { studentName, grade, testResults, chartBlob } = data;

    if (!chartBlob || chartBlob.getBytes().length === 0) {
      throw new Error("ChartBlob is empty or not generated.");
    }

    const chartImageBase64 = Utilities.base64Encode(chartBlob.getBytes());
    Logger.log("Generated radar chart as Base64 image");

    const filteredTestResults = testResults.map(row => ({
      description: row.description || "N/A",
      points: row.points || 0,
      maxPoints: row.maxPoints || 0,
      seuil1: row.seuil1 || 0,
      seuil2: row.seuil2 || 0,
      seuil3: row.seuil3 || 0,
      totalSeuil: row.totalSeuil || 0,
    }));

    const template = HtmlService.createTemplateFromFile("PdfReportTemplate");
    template.data = { studentName, grade, testResults: filteredTestResults };
    template.chartImage = chartImageBase64;

    const htmlOutput = template.evaluate().getContent();
    Logger.log("Generated HTML content from template");

    const pdfBlob = HtmlService.createHtmlOutput(htmlOutput)
      .getBlob()
      .setName(`${studentName}_${testId}.pdf`)
      .setContentType('application/pdf');
    Logger.log("Converted HTML to PDF Blob");

    const folder = getCompetenceAppDataFolder();
    const file = folder.createFile(pdfBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log(`File saved to Drive: ${file.getName()} - ${file.getUrl()}`);

    const fileUrl = `https://drive.google.com/uc?id=${file.getId()}&export=download`;
    Logger.log("Returning file URL...");
    return { fileUrl, reportName: file.getName() };
  } catch (error) {
    Logger.log("Error during PDF generation: " + error.message);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}



/**
 * Generate the PDF Report with DOC template.
 */
function generatePDFWithDocTemplate(studentId, testId) {
  try {
    const data = fetchReportData(studentId, testId);
    Logger.log("Fetched report data: " + JSON.stringify(data));
    const { studentName, grade, testResults, chartBlob } = data;

    const template = DriveApp.getFileById(DEFAULT_TEMPLATE_REPORT_ID);
    const folder = getCompetenceAppDataFolder();
    const documentCopy = template.makeCopy(`Test_Report_${studentName}_${testId}`, folder);
    const doc = DocumentApp.openById(documentCopy.getId());

    const body = doc.getBody();
    body.replaceText("<<studentName>>", studentName || "N/A");
    body.replaceText("<<grade>>", grade || "N/A");

    // Validate and prepare table data
    const tableData = [
      ["Description", "Points", "Max Points", "Seuil 1", "Seuil 2", "Seuil 3", "Total Seuil"], // Header row
      ...testResults.map(result => [
        result.description || "N/A",
        result.points || 0,
        result.maxPoints || 0,
        result.seuil1 || 0,
        result.seuil2 || 0,
        result.seuil3 || 0,
        result.totalSeuil || 0,
      ]),
    ];
    Logger.log("Validated table data: " + JSON.stringify(tableData));

    // Remove placeholder and insert table
    body.replaceText("<<table>>", "");
    body.appendTable(tableData);

    // Insert radar chart
    if (!chartBlob || chartBlob.getBytes().length === 0) {
      throw new Error("ChartBlob is empty or not generated.");
    }
    const inlineImage = body.insertImage(0, chartBlob);
    body.insertParagraph(body.getChildIndex(inlineImage.getParent()), "Radar Chart");

    doc.saveAndClose();

    // Convert to PDF and save to Drive
    const pdfBlob = documentCopy.getAs("application/pdf");
    const pdfFile = folder.createFile(pdfBlob);
    return pdfFile.getUrl();
  } catch (error) {
    throw new Error(`Failed to generate PDF with Doc template: ${error.message}`);
  }
}



/**
 * liste available report in the folder
 */

function getAvailableReports() {
  const folder = getCompetenceAppDataFolder();
  const files = [];
  const fileIterator = folder.getFilesByType(MimeType.PDF);

  while (fileIterator.hasNext()) {
    const file = fileIterator.next();
    files.push({
      name: file.getName(),
      url: file.getUrl()
    });
  }

  return files;
}

/**
 * email the PDF Report. 
 */
 

function emailFileToUser(fileUrl) {
  const userEmail = Session.getActiveUser().getEmail();
  const fileId = fileUrl.match(/[-\w]{25,}/)[0]; // Extract the file ID from the URL
  const file = DriveApp.getFileById(fileId);

  if (!file) {
    throw new Error("File not found.");
  }

  const subject = "Requested Report: " + file.getName();
  const body = "Dear user,\n\nPlease find the requested report attached.\n\nBest regards,\nThe Team";
  GmailApp.sendEmail(userEmail, subject, body, {
    attachments: [file.getBlob()]
  });
}


/**
 * email the PDF Report. OBSOLETE
 */
 

function emailReportToUser(fileUrl) {
  try {
    const userEmail = Session.getActiveUser().getEmail(); // Get the user's email
    const fileId = fileUrl.match(/id=([^&]+)/)[1]; // Extract file ID from the URL
    const file = DriveApp.getFileById(fileId); // Get the file from Google Drive
    const fileBlob = file.getBlob(); // Get the file as a Blob

    // Email the report
    GmailApp.sendEmail(userEmail, 'Your Test Report', 'Please find the attached report.', {
      attachments: [fileBlob],
      name: 'Competence Management System',
    });

    Logger.log(`Email sent to ${userEmail} with file: ${file.getName()}`);
    return true;
  } catch (error) {
    Logger.log(`Error emailing report: ${error.message}`);
    throw new Error('Failed to email the report: ' + error.message);
  }
}
