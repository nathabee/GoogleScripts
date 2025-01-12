

## Ressource access with google scripts

Le's detail the distinction between the deployment owner (e.g., `nathabee`) and the end users of your app (e.g., `mygoogleuser`). The behavior depends on how the app is deployed and the permissions you grant.  

---

### 1. **Who Owns the Resources (Spreadsheet and AppData)?**
- In your current setup:
  - The **default Google Sheet** and the **AppData folder** belong to `nathabee`, the script owner.
  - Any hardcoded resources in the script, like the `appDataFolderId` or the default Sheet ID, are part of `nathabee`'s Google Drive.

---

### 2. **How Are Resources Accessed?**
This depends on how the app is deployed:

#### Deployment as **"Execute as Me" (the script owner, `nathabee`)**
- When deploying the app, if you set **"Execute as me"**, all operations (e.g., reading/writing to the AppData folder or Google Sheet) are performed as the script owner (`nathabee`).
- **What happens:**
  - The AppData folder and the default Google Sheet used will always belong to `nathabee`.
  - **User-specific data** is stored within `nathabee`'s AppData folder because the code uses the hardcoded `appDataFolderId` that belongs to `nathabee`.

#### Deployment as **"Execute as User Accessing the App"**
- When deploying the app, if you set **"Execute as the user accessing the app"**, the script runs in the context of the user interacting with the app (e.g., `mygoogleuser`).
- **What happens:**
  - If `mygoogleuser` accesses the app:
    - The script attempts to create or access an **AppData folder** in `mygoogleuser`'s Google Drive (since each user has their own hidden AppData folder).
    - If the default Google Sheet is hardcoded and belongs to `nathabee`, `mygoogleuser` may get a **permission error** unless `nathabee` shares the sheet with them.

---

### 3. **What Happens to Data with "AppData Folder"?**
- **If the app is executed as `nathabee`:**
  - All data is stored in `nathabee`'s **AppData folder**, regardless of who accesses the app.
  - This means `mygoogleuser`'s data will be mixed into `nathabee`'s folder, creating potential issues with isolating user data.

- **If the app is executed as `mygoogleuser`:**
  - Each user's data is stored in their own hidden AppData folder.
  - This approach is cleaner and more secure for multi-user apps.

---

### 4. **Recommendations**
#### Option 1: Multi-User App with Isolated Data
- Deploy the app with **"Execute as the user accessing the app"**.
- Modify the code to dynamically create the `AppData folder` for each user rather than using a hardcoded `appDataFolderId`:
 

**Pros:**
- Data is isolated for each user.
- No dependency on `nathabee`'s resources.
- Clean and secure for multi-user environments.

**Cons:**
- Users must authorize the app to access their Google Drive.

---

#### Option 2: Centralized App (All Data in `nathabee`'s Drive)
- Deploy the app with **"Execute as me"**.
- Use `nathabee`'s **AppData folder** and **default sheet** for all users.

**Pros:**
- Simplified setup: all resources are centrally managed by `nathabee`.
- Users don’t need to grant Drive permissions.

**Cons:**
- Data for all users is stored in one place, which may cause privacy issues.
- Manual management required to separate user-specific data.

---

### 5. **How to Choose**
- Use **Option 1** (Isolated Data) if you need to handle data for multiple users securely.
- Use **Option 2** (Centralized App) if you want a quick solution and control all resources as `nathabee`.
 