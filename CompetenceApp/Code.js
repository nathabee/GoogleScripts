/**
 * Retrieve the hardcoded Sheet ID.
 * @return {string} Sheet ID
 */
function getSheetId() {
  return "1HnFvjPYs59KjS8P0EC7Obos4_OEJWvjyzjRV-yThh08"; // Replace with your actual Sheet ID
}
function doGet(e) {
  let page = e.parameter.mode || "Home";
  let html = HtmlService.createTemplateFromFile(page).evaluate();
  let htmlOutput = HtmlService.createHtmlOutput(html);
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  //Replace {{NAVBAR}} with the Navbar content
  htmlOutput.setContent(htmlOutput.getContent().replace("{{NAVBAR}}",getNavbar(page)));
  return htmlOutput;
}

 
//Create Navigation Bar
function getNavbar(activePage) {
  var scriptURLHome = getScriptURL();
  var scriptURLForm = getScriptURL("mode=Form");
  var scriptURLReport = getScriptURL("mode=Report");  
  var scriptURLMakeReportForm = getScriptURL("mode=MakeReportForm");  
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
            <a class="nav-item nav-link ${activePage === 'Form' ? 'active' : ''}" href="${scriptURLForm}" target="_top">Form</a>
            <a class="nav-item nav-link ${activePage === 'Report' ? 'active' : ''}" href="${scriptURLReport}" target="_top">Report</a> 
            <a class="nav-item nav-link ${activePage === 'MakeReportForm' ? 'active' : ''}" href="${scriptURLMakeReportForm}" target="_top">Make Report Form</a> 
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

// ************************************************************************************



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
    const grade = `${student[3]}`;

    // Fetch test results
    const results = testResultsSheet.getRange(2, 1, testResultsSheet.getLastRow() - 1, 8).getValues();
    const filteredResults = results
      .filter(row => row[0] == testId)
      .map(row => ({
        description: row[1],
        points: row[2],
        maxPoints: row[3],
        seuil1: row[4],
        seuil2: row[5],
        seuil3: row[6],
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

    Logger.log(`Backend: insertChart  called  testResults`,testResults);
    // Prepare data for the template
    const data = {
      studentName: studentName,
      grade: grade,
      testResults: filteredResults,
    };

    // Prepare the PDF template
    const template = HtmlService.createTemplateFromFile('pdfReportTemplate');
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
