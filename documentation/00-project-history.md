# History of this project :

##  Create a new Standalone Apps Script Project 

### **Why Use a Standalone Apps Script Project with `clasp`?**
1. **Clear Separation**: Standalone projects are stored as separate entities in Google Drive, not embedded in a specific Google Sheet, Form, or Doc.
2. **Version Control**: You can easily sync your Apps Script project with GitHub and make updates locally using tools like VSCode.
3. **Flexibility**: The standalone script can interact with multiple Google Sheets, Drive files, or services, offering more versatility.
4. **Easier Collaboration**: Collaborators can clone the Apps Script project from GitHub and use `clasp` to push/pull changes seamlessly.

---

### **Steps to Create a Standalone Apps Script Project and Sync with GitHub**

#### **1. Install and Set Up `clasp`**
Make sure **`clasp`** (Command Line Apps Script) is installed:
```bash
npm install @google/clasp -g
```
- Log in to your Google account:
```bash
clasp login
```

---

#### **2. Create a Standalone Apps Script Project**

1. Open your terminal and run:
   ```bash
   clasp create "Standalone Report App" --type standalone
   ```
   - **"Standalone Report App"** is the project name.
   - This will create a standalone Apps Script project and link it to your Google account.

2. files appear on your local machine  :
   - `appsscript.json`: Metadata for the project.
   - `Code.gs`: A starting point for your Apps Script code.

---

#### **3. Copy Your Code to the Project**

1.  
   - Copy your updated Apps Script code (the one generating the PDF).
   - Add additional files like `index.html` if needed.

   Your project folder will look like this:
   ```
   /standalone-report-app
      ├── appsscript.json
      ├── Code.gs
      ├── index.html
      └── README.md
   ```

2. If you have any HTML files (for PDF generation), create them in the project directory and reference them in your script.

---

#### **4. Initialize a Git Repository Locally**

To version control the project in GitHub:

1. Initialize Git in the folder:
   ```bash
   git init
   ```

2. Add the project to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit - Standalone Apps Script project"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

---

#### **5. Push the Code to Google Apps Script**

After making changes locally in **VSCode**:
- Push updates to Google Apps Script using `clasp`:
   ```bash
   clasp push
   ```
- Verify the updates in Google Apps Script Editor (online):
   - Go to [Google Apps Script Dashboard](https://script.google.com).

---

#### **6. Pull Updates from Google Drive**
If someone else makes changes online, you can sync them locally:
```bash
clasp pull
```

---

### **How It All Works Together**

1. **Local Development**:
   - Write and edit Apps Script code locally in **VSCode**.

2. **GitHub Integration**:
   - Commit and push your changes to GitHub for version control.

3. **Sync with Google Cloud**:
   - Use `clasp push` to deploy your local code to Google Apps Script.
   - Use `clasp pull` to fetch changes made in the cloud.

---

### **Workflow Summary**
- Local Development: VSCode + `clasp`.
- Version Control: Git + GitHub.
- Deployment to Google Cloud: `clasp push` and `clasp pull`.

---

### **Benefits of This Setup**
1. **Seamless Workflow**: Write code locally, commit to GitHub, and push to Google Apps Script.
2. **Version Control**: Track changes, collaborate, and roll back to previous versions easily.
3. **Stand-alone Project**: Decoupled from any Google Sheets or Docs, allowing greater flexibility.

---

Let me know if you need help setting this up step by step, or if you'd like to automate further using **GitHub Actions** for deployments! 🚀


## initialise the data 

Google Sheets files are cloud-based and do not exist as local files like .gs or .json.
You cannot directly store a Google Sheet file in your local folder or GitHub repository.


### Google Sheet Setup Instructions

1. Create a Google Sheet in your Drive.
2. Name the sheet: **Performance Data**.
3. Set up the following columns:
   | Column Name     | Description                   | Example Data   |
   |-----------------|-------------------------------|----------------|
   | Name            | The name of the person/event  | John Doe       |
   | Speed           | Performance speed             | 8              |
   | Agility         | Performance agility           | 7              |
   | Strength        | Performance strength          | 6              |
4. Share the Google Sheet with your Apps Script project (Editor access).

5. Copy the Sheet ID:
   - Example URL: `https://docs.google.com/spreadsheets/d/<sheetId>/edit`
   - Use `<sheetId>` in your Apps Script code.



## explaination : pull/push with clasp/git
 

- **`clasp push`**: Sends your code to Google Apps Script (cloud-based environment).
- **`git push`**: Sends your code to GitHub (version control system).

## **1. `clasp push`**
- **Purpose**: Uploads your **Google Apps Script project** files to the cloud-based **Google Apps Script editor**.
- **Scope**: Only the files inside the project directory (defined by `rootDir` in `.clasp.json`) are pushed to Google Apps Script.
- **Behavior**:
   - It updates your Apps Script project hosted in Google Drive.
   - It does **not** interact with GitHub or version control.
- **Command**:
   ```bash
   clasp push
   ```
- **Example**:
   - If you are in `StandaloneReportApp/` and run `clasp push`, it syncs:
     - `Code.gs`, `index.html`, and other project files.
     - The changes appear in the Google Apps Script Editor.

---

## **2. `git push`**
- **Purpose**: Pushes your **local code** (including Apps Script files) to a **GitHub repository** (or any other Git-based repository).
- **Scope**: All files that are tracked by Git in your local directory.
- **Behavior**:
   - It updates the GitHub repository with your changes.
   - It does **not** interact with Google Apps Script directly.
- **Command**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
- **Example**:
   - If you are in the root directory `/google-scripts` and run `git push`, it syncs all subdirectories, including:
     - `/StandaloneReportApp/` (with `.clasp.json`, `Code.gs`, etc.)
     - `/documentation/`
     - `/example-sheets/`

---

## **When to Use Each Command**

| **Task**                          | **Command**      | **What It Does**                                     |
|-----------------------------------|------------------|-----------------------------------------------------|
| Sync code to Google Apps Script   | `clasp push`     | Pushes project files to Google Apps Script Editor.  |
| Sync code to GitHub repository    | `git push`       | Pushes project files to your GitHub repository.     |
| Download changes from Apps Script | `clasp pull`     | Pulls updates from Google Apps Script Editor.       |
| Pull updates from GitHub          | `git pull`       | Pulls updates from the GitHub repository.           |

---

## **Workflow for Managing Apps Script Code with GitHub and Google Drive**

1. **Edit Locally**:
   - Work on your Apps Script files locally in VSCode or another editor.

2. **Push to Google Apps Script (clasp)**:
   - Use `clasp push` to sync changes to Google Apps Script:
     ```bash
     cd StandaloneReportApp
     clasp push
     ```

3. **Commit and Push to GitHub**:
   - Use Git commands to version control your code:
     ```bash
     git add .
     git commit -m "Update StandaloneReportApp functionality"
     git push origin main
     ```

4. **Pull Updates (Optional)**:
   - If changes are made directly in Google Apps Script Editor:
     ```bash
     clasp pull
     ```
   - If changes are made in GitHub:
     ```bash
     git pull origin main
     ```

---
 