 

## GoogleScripts Repository

This repository contains two projects: **CompetenceApp** and **StandaloneReportApp**. Each project is a standalone Google Apps Script designed to integrate with Google Sheets to provide functionality for specific use cases.

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

2. **StandaloneReportApp**:
   - Open the deployed web app URL (from Apps Script).
   - Use the simple interface to generate and download PDF reports with radar charts.

---

### **Documentation**

Additional documentation can be found in the `documentation/` folder:
- `00-project-history.md`: Project history and version tracking. 
 