# Serverless-Web

This project is a serverless web storefront that uses a spreadsheet as its database.  
No backend server is required — data is loaded directly from a published Google Sheets document.  
This allows the website to be hosted for free while keeping data easy to edit.

## 📌 How It Works
- Data is stored in **Google Sheets**
- The sheet is **published to the web** so it can be fetched as JSON
- The frontend (HTML + CSS + VUE.JS) reads the sheet and displays product information
- You only maintain your spreadsheet — no database or server hosting required

---

## 🗂 Spreadsheet Setup

### 1. Create a Google Sheet
Open Google Sheets and create a new sheet.  
In **Row 1**, write the column headers exactly like this **(case-sensitive):**

| Product | Total | Price | Discount | Picture1 | Picture2 | Picture3 | Description | No WA |
|--------|-------|-------|----------|----------|----------|----------|-------------|------|

Example rows:

| Product       | Total | Price | Discount | Picture1            | Picture2            | Picture3            | Description              | No WA         |
|---------------|-------|-------|----------|---------------------|---------------------|---------------------|--------------------------|---------------|
| "Product A"   | 50    | 30000 | 10       | url-to-image-1.jpg  | url-to-image-2.jpg  | url-to-image-3.jpg  | "Deskripsi produk A"     | 6281234567890 |
| "Product B"   | 20    | 45000 | 0        | url-to-image-1.jpg  |                     |                     | "Deskripsi produk B"     | 6289876543210 |

### 2. Make the Sheet Public
1. Click **Share**
2. Select **Anyone with the link**
3. Set access to **Viewer**

### 3. Publish the Sheet to the Web
1. Go to **File → Share → Publish to web**
2. Choose **Entire Document**
3. Publish
4. Copy the **published `.csv` or `.json` link**

> **This “Published to Web” link** is what the JavaScript fetches data from.

---

## 🔧 Configure the App

In the project files, open the JS config section  (`barang.js`) and paste your published sheet link:

```js
const sheetURL = "https://docs.google.com/spreadsheets/d/.../pub?output=csv";


