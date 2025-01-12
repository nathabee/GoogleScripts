 

## GoogleScripts Repository

This repository contains Google Apps Script projects.

### **Projects Overview**

#### CompetenceApp
- **Purpose**: 
  CompetenceApp is designed to manage student competencies, tests, and results. It includes features to:
  - Manage students and their test history.
  - Generate detailed competency reports with radar charts.
  - Produce formatted PDFs with test details and visualizations.
- **Core Files**:
  - `Code.gs`: Backend logic for handling data and generating PDFs.
  - `index.html`: Frontend interface for managing students and tests.
  - `report.html`: Template for PDF report generation.
- **Example Data**:
  - Example data is provided in `example-sheets/CompetenceApp.xlsx`.
- **Competence Management System**:
[Access the live app here](https://script.google.com/macros/s/AKfycbzPyfBTYQbQVexifJBIj07IlmrUXo6vYUer2J4yto5FDw0iPJDAE2Qw5OdtkvStcyV3zg/exec)


---

#### StandaloneReportApp
- **Purpose**:
  StandaloneReportApp focuses on creating a simple standalone application for generating and downloading formatted PDF reports.
  - Includes functionality to read data from a Google Sheet and visualize it in radar charts.
- **Core Files**:
  - `Code.gs`: Script to generate radar charts and formatted PDFs.
  - `webapp.html`: Web interface for triggering PDF generation.
  - `report.html`: Template for PDF report generation.
- **Example Data**:
  - Example data is provided in `example-sheets/StandaloneReportApp-Data.csv`.

---

#### CompetenceAddOn
- **Purpose**:  
  CompetenceAddOn is a Google Sheets add-on version of CompetenceApp, providing similar features directly within the Google Sheets environment:  
  - Add and manage test types and results using sidebars integrated into Google Sheets.  
  - Generate detailed competency reports, including radar charts, from the Google Sheets data.  

- **Core Files**:  
  - `appsscript.json`: Configuration file for the Apps Script project.  
  - `Code.js`: Backend logic for integrating with Google Sheets and generating PDFs.  
  - `MakeReportForm.html`: Form interface for selecting students and tests to generate reports.  
  - `PdfReportTemplate.html`: Template used for generating detailed PDF reports.  
  - `report.html`: Base template for managing reports.  
  - `TestResultForm.html`: Sidebar interface for entering test results.  
  - `TestTypeForm.html`: Sidebar interface for managing test types.  

- **Usage**:  
  - Install the add-on in Google Sheets.  
  - Use the "CompetenceApp" menu to access the features:  
    - Manage Test Types: Open a sidebar to add, edit, or delete test types.  
    - Insert Test Results: Open a sidebar to log test results for students.  
    - Generate Test Reports: Open a form to select students and tests for generating detailed PDF reports.  

---

#### MultiPageApp
- **Purpose**:  
  MultiPageApp demonstrates how to create a multipage web app using Google Apps Script. Features include:  
  - Pseudo-routing for navigating between multiple pages.  
  - A shared layout for consistent design across pages.  
  - Example pages to showcase use cases of multipage web apps.  

- **Core Files**:  
  - `Code.gs`: Backend logic for routing and serving HTML pages dynamically.  
  - `Page1.html`, `Page2.html`, `Page3.html`, `Page4.html`: Example pages for the app.  
  - `header.html` and `footer.html`: Shared components for consistent page design.  
  - `css.html`: Stylesheet for the app layout.  

- **Example Pages**:  
  - Page 1: Introduction and purpose of the app.  
  - Page 2: Demonstrates managing data through forms.  
  - Page 3: Displays dynamically loaded data.  
  - Page 4: Example report generation.  

---
---

### **Installation Instructions**

#### **Clone the Repository**
**Prerequisites**: 
- Git installed on your system.

```bash
git clone https://github.com/nathabee/GoogleScripts.git
cd GoogleScripts
```

---

#### **Set Up a Google Apps Script Project**

1. **Create a Google Apps Script Project**:
   - Go to [Google Apps Script](https://script.google.com/) in your browser.
   - Create a new project and name it as desired.
   - Copy the project ID from the URL.

2. **Link the Project to the Repository**:
   - Install `clasp` (Command Line Apps Script Tool):
     ```bash
     npm install -g @google/clasp
     ```
   - Navigate to the project directory:
     ```bash
     cd <my_project_subdirectory>
     ```
   - Edit `.clasp.json`:
     - Replace the `scriptId` with the ID of your Google Apps Script project.
     - Ensure the `rootDir` points to the current local path of your project.

3. **Push the Code to Your Apps Script Project**:
   ```bash
   clasp push
   ```

---

#### **Set Up Google Sheets**

**Google Sheets files are not stored locally or in GitHub repositories.**

1. **Create a Google Sheet**:
   - Open Google Sheets in your browser and create a new sheet.
   - Name the sheet according to the instructions in `Code.gs`.

2. **Configure the Sheet**:
   - Set up the sheet with the columns and structure provided in the corresponding CSV file under `example-sheets/`.
   - Example:
     - For CompetenceApp, refer to `example-sheets/CompetenceApp.xlsx`.
     - For StandaloneReportApp, refer to `example-sheets/StandaloneReportApp-Data.csv`.

3. **Share the Google Sheet**:
   - Share the sheet with your Apps Script project with **Editor** access.

4. **Update the Script with the Sheet ID**:
   - Copy the Sheet ID from the URL:
     - Example: `https://docs.google.com/spreadsheets/d/<sheetId>/edit`
   - Update the `getSheetId` function in `Code.gs` to use the correct `sheetId`.

---

### **Usage Instructions**


1. **CompetenceApp**:  
   - Open the deployed web app URL (from Apps Script).  
   - Manage students and test results using the interface.  
   - Generate competency reports with radar charts and download them as PDFs.  

2. **CompetenceAddOn**:  
   - Install the add-on in Google Sheets.  
   - Use the "CompetenceApp" menu in Google Sheets to manage test data and generate reports.  

3. **StandaloneReportApp**:  
   - Open the deployed web app URL (from Apps Script).  
   - Use the simple interface to generate and download PDF reports with radar charts.  

4. **MultiPageApp**:  
   - Open the deployed web app URL (from Apps Script).  
   - Navigate between pages using the sidebar or navigation links to explore multipage functionality.  
   - Use it as a foundation for creating custom multipage web apps.  

---




### **Documentation**

Additional documentation can be found in the `documentation/` folder:
- `00-project-history.md`: Project history and version tracking. 
 