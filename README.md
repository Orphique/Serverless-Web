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
``` 

---

## 📝 How Google Form Submission Works

When the user submits an order, the website sends the data directly to a Google Form using a custom URL.  
This makes it possible to collect customer information **without hosting a backend**.

### Example Form Submission URL

```js 
const url = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdArYLbxhEmnK9Rzi3KWp0oEhxUdFOHq9Q64yLxqVpY7mYoVw/formResponse" +
  `?entry.1397467379=${encodedNama}` +
  `&entry.1515742534=${encodedAlamat}` +
  `&entry.1477140648=${encodedKelurahan}` +
  `&entry.1876270830=${encodedkecamatan}` +
  `&entry.183900941=${encodedKota}` +
  `&entry.1983750981=${encodedKodepos}` +
  `&entry.103247122=${encodedBarang}` +
  `&entry.1697585335=${encodedTotalHarga}` +
  `&submit=Submit`;
```

### 📌 What Each Part Means

> `formResponse`
Google’s endpoint that allows submitting form data programmatically.

> `entry.XXXXXXXXXX`
Each field in your Google Form has a unique **entry ID**.
Your JavaScript sends values to each field by attaching them as URL parameters.

### 🧩 Field Mapping (Example)
| Google Form Field | Entry Code       | JavaScript Variable |
| ----------------- | ---------------- | ------------------- |
| Nama              | entry.1397467379 | encodedNama         |
| Alamat            | entry.1515742534 | encodedAlamat       |
| Kelurahan         | entry.1477140648 | encodedKelurahan    |
| Kecamatan         | entry.1876270830 | encodedKecamatan    |
| Kota              | entry.183900941  | encodedKota         |
| Kode Pos          | entry.1983750981 | encodedKodepos      |
| Barang            | entry.103247122  | encodedBarang       |
| Total Harga       | entry.1697585335 | encodedTotalHarga   |

---

## ✔️ How to Get Your Own Entry Codes
1. Open your Google Form
2. Right-click → Inspect
3. Look for `entry.<number>` under each input field
4. Replace the numbers in the code with your own

## ✔️ Important: Form Must Be Public

Your Google Form must accept submissions from anyone:
1. Open the Form
2. Go to **Settings**
3. Turn OFF “Restrict to users in your organization”
4. Save

Your form is now ready to accept anonymous submissions from your website.
