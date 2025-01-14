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
    return folders.next(); // Return existing folder if it exists
  } else {
    return DriveApp.createFolder(COMPETENCE_APP_FOLDER_NAME); // Create and return the folder if it doesn't exist
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

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  Logger.log(`Backend: getTestResults data : ${JSON.stringify(data)}`);

  // Filter rows matching testId
  const filteredTestResults = data.filter(row => row[1] == testId);
  Logger.log(`Backend: filteredTestResults : ${JSON.stringify(filteredTestResults)}`);

  // Convert to objects for better readability in the frontend
  const resultsWithLabels = filteredTestResults.map(row => ({ 
    description: row[2], // Use the description field for chart labels
    points: row[3],
    maxPoints: row[4],
    seuil1: row[4],
    seuil2: row[6],
    seuil3: row[7],
    totalSeuil: row[8],
  }));

  Logger.log(`Backend: Results with labels: ${JSON.stringify(resultsWithLabels)}`);
  return resultsWithLabels;
}

// ************************************************************************************



/**
 * Generate the PDF Report.
 */
 

function generatePDFUrl(studentId, testId) {
  try {
    const sheetId = getSheetId();
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const tmpSheetName = "Tmp";
    let tmpSheet = spreadsheet.getSheetByName(tmpSheetName);

    // Ensure the Tmp sheet exists
    if (!tmpSheet) {
      tmpSheet = spreadsheet.insertSheet(tmpSheetName);
    } else {
      // Clear sheet and remove old charts
      tmpSheet.getCharts().forEach(chart => tmpSheet.removeChart(chart));
      tmpSheet.clear();
    }

    const studentSheet = spreadsheet.getSheetByName("Student");
    const testResultsSheet = spreadsheet.getSheetByName("TestResults");

    // Fetch student information
    const students = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1, 4).getValues();
    const student = students.find(row => row[0] == studentId);
    if (!student) throw new Error("Student not found.");
    const studentName = `${student[1]} ${student[2]}`;
    const reportName =  `${studentName} ${testId}`;
    const grade = `${student[3]}`;

    // Fetch test results
    const results = testResultsSheet.getRange(2, 1, testResultsSheet.getLastRow() - 1, 8).getValues();
    const filteredResults = results.filter(row => row[1] == testId).map(row => ({
      description: row[2],
      points: row[3],
      maxPoints: row[4],
      seuil1: row[5],
      seuil2: row[6],
      seuil3: row[7],
      totalSeuil: row[8],
    }));
    if (filteredResults.length === 0) throw new Error("No results found for the test.");

    // Prepare radar chart data
    const labels = filteredResults.map(r => r.description);
    const values = filteredResults.map(r => r.totalSeuil);

    // Write radar chart data to Tmp sheet
    tmpSheet.getRange(1, 1, labels.length, 1).setValues(labels.map(label => [label]));
    tmpSheet.getRange(1, 2, values.length, 1).setValues(values.map(value => [value]));

    // Create radar chart
    const chart = tmpSheet.newChart()
      .setChartType(Charts.ChartType.RADAR)
      .addRange(tmpSheet.getRange(1, 1, labels.length, 2))
      .setPosition(5, 1, 0, 0)
      .build();
    tmpSheet.insertChart(chart);

    const chartBlob = chart.getBlob().getAs('image/png');
    const chartImageBase64 = Utilities.base64Encode(chartBlob.getBytes());

    // Prepare data object for the template
    const data = {
      studentName: studentName,
      grade: grade,
      testResults: filteredResults,
    };

    // Generate HTML for the PDF
    const template = HtmlService.createTemplateFromFile('PdfReportTemplate');
    template.data = data;
    template.chartImage = chartImageBase64; // Embed radar chart as Base64 image
    const htmlOutput = template.evaluate().getContent();

    // Convert the HTML content to a PDF
    const pdfBlob = HtmlService.createHtmlOutput(htmlOutput)
      .getBlob()
      .setName(reportName)
      .getAs('application/pdf');

    // Save PDF to Google Drive

    const file = DriveApp.createFile(pdfBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileUrl = `https://drive.google.com/uc?id=${file.getId()}&export=download`;
    return { fileUrl, reportName: file.getName() };
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}



function generatePDFWithDocTemplate(data) {
  const templateId = "YOUR_TEMPLATE_DOC_ID"; // Replace with your Google Docs template ID
  const folderId = "YOUR_OUTPUT_FOLDER_ID"; // Replace with your Google Drive folder ID

  // Open the template and make a copy
  const template = DriveApp.getFileById(templateId);
  const folder = DriveApp.getFolderById(folderId);
  const documentCopy = template.makeCopy(`Test_Report_${data.studentName}`, folder);
  const doc = DocumentApp.openById(documentCopy.getId());

  // Replace placeholders in the document
  const body = doc.getBody();
  body.replaceText("<<studentName>>", data.studentName || "N/A");
  body.replaceText("<<grade>>", data.grade || "N/A");

  // Replace the table placeholder
  let tableHTML = `
    <table>
      <tr>
        <th>Description</th>
        <th>Points</th>
        <th>Max Points</th>
        <th>Seuil 1</th>
        <th>Seuil 2</th>
        <th>Seuil 3</th>
        <th>Total Seuil</th>
      </tr>
      ${data.testResults
        .map(result => `
          <tr>
            <td>${result.description}</td>
            <td>${result.points}</td>
            <td>${result.maxPoints}</td>
            <td>${result.seuil1}</td>
            <td>${result.seuil2}</td>
            <td>${result.seuil3}</td>
            <td>${result.totalSeuil}</td>
          </tr>
        `)
        .join("")}
    </table>
  `;
  body.replaceText("<<table>>", tableHTML);

  // Replace the radar chart placeholder
  const chartBlob = Utilities.base64Decode(data.chartImage);
  const inlineImage = body.appendImage(Utilities.newBlob(chartBlob, "image/png"));
  body.replaceText("<<chartImage>>", ""); // Remove placeholder text
  body.insertParagraph(body.getChildIndex(inlineImage.getParent()), "Radar Chart");

  // Save and close the document
  doc.saveAndClose();

  // Convert the document to a PDF
  const pdfBlob = documentCopy.getAs("application/pdf");

  // Save the PDF back to Google Drive
  const pdfFile = folder.createFile(pdfBlob);
  Logger.log(`PDF created: ${pdfFile.getUrl()}`);

  // Return the URL of the PDF
  return pdfFile.getUrl();
}



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
