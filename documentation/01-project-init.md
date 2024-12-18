# install project from Github :


## clone and install in your google account the scripts

<<< to be defined >>>

### clone the code from github
prerequis :
install git


git clone ....

### create a google script  project and link it to the code


in you webbrowser, log with you google user, then  create a new Google Apps Script project :
https://script.google.com/
give  it the name you want then not the id and put it in the .clasp.json

prerequis :
install clasp


cd <my_project_subdirectory>
edit .clasp.json
- change the id to make it point to your AppsScript project
- change the path to make it point to your current local path

send the code to you google cloud Apps script project :

clasp push


### Google Sheet Setup Instructions

Google Sheets files are cloud-based and do not exist as local files like .gs or .json.
You cannot directly store a Google Sheet file in your local folder or GitHub repository.


1. Create a Google Sheet in your Drive. call it the way you want   for example. 
2. Name the sheet:  **<mysheetname>**  (important take the name that is in the Code.gs)
3. Set up the following columns according to the example-sheets/<myproject>-<mysheetname>.csv
4. Share the Google Sheet with your Apps Script project (Editor access).

5. Copy the Sheet ID:
   - Example URL: `https://docs.google.com/spreadsheets/d/<sheetId>/edit`
   - Use `<sheetId>` in your Apps Script code, in the getSheetId function.

