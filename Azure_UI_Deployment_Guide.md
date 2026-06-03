# 🛡️ Mono Insurance – Azure Portal Deployment Guide

This is a complete step-by-step guide to deploy the Mono Insurance application using the **Azure Portal UI** (no CLI needed). Follow the steps **in order** — each service depends on the previous one.

---

## 📋 Prerequisites
- An active Azure Subscription
- Your application code (the `mono-insurance` folder)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed (used **only** for `az webapp deploy` — the final deploy step)
- [Node.js 22](https://nodejs.org/) installed locally
- [Azure Functions Core Tools v4](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) installed (for deploying the function)

---

## Step 1 — Create a Resource Group

A Resource Group is a logical container for all your Azure resources.

1. Go to [portal.azure.com](https://portal.azure.com)
2. Click **"Create a resource"** → Search for **"Resource group"** → Click **Create**
3. Fill in:
   | Field | Value |
   |---|---|
   | Subscription | Your subscription |
   | Resource group name | `mono-insurance-rg` |
   | Region | `East US` *(or your nearest region)* |
4. Click **Review + Create** → **Create**

---

## Step 2 — Create Azure Cosmos DB (MongoDB API)

This replaces the local MongoDB container.

1. Click **"Create a resource"** → Search **"Azure Cosmos DB"** → Click **Create**
2. Select **"Azure Cosmos DB for MongoDB"** → Click **Create**
3. Fill in:
   | Field | Value |
   |---|---|
   | Subscription | Your subscription |
   | Resource group | `mono-insurance-rg` |
   | Account name | `mono-insurance-cosmos` *(must be globally unique)* |
   | Location | Same as your Resource Group |
   | Capacity mode | **Serverless** *(cheapest for dev/test)* |
   | Version | `7.0` |
4. Click **Review + Create** → **Create** *(takes ~5 min)*

### 📌 After creation — Get Connection String

1. Go to your **Cosmos DB account** → Left menu → **Settings** → **Connection strings**
2. Copy the **Primary Connection String** — it looks like:
   ```
   mongodb://mono-insurance-cosmos:<KEY>@mono-insurance-cosmos.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@mono-insurance-cosmos@
   ```
3. **Save this** — you will need it in Steps 5 and 7.

### 📌 Create the Database

1. Go to your **Cosmos DB account** → Left menu → **Data Explorer**
2. Click **"New Database"**
   - Database id: `mono-insurance`
   - Click **OK**

---

## Step 3 — Create Azure Storage Account

This is where uploaded PDFs will be stored and what triggers the OCR function.

1. Click **"Create a resource"** → Search **"Storage account"** → Click **Create**
2. Fill in:
   | Field | Value |
   |---|---|
   | Subscription | Your subscription |
   | Resource group | `mono-insurance-rg` |
   | Storage account name | `monoinsurancestorage` *(lowercase, no hyphens, globally unique)* |
   | Region | Same as Resource Group |
   | Performance | **Standard** |
   | Redundancy | **LRS** *(Locally Redundant, cheapest)* |
3. Click **Review + Create** → **Create** *(~1 min)*

### 📌 After creation — Create the Blob Container

1. Go to your **Storage Account** → Left menu → **Data storage** → **Containers**
2. Click **"+ Container"**
   - Name: `insurance-claims`
   - Public access level: **Blob (anonymous read access for blobs only)**
   - Click **Create**

### 📌 Get the Connection String

1. Go to your **Storage Account** → Left menu → **Security + networking** → **Access keys**
2. Click **"Show"** next to **key1**
3. Copy the **Connection string** — it looks like:
   ```
   DefaultEndpointsProtocol=https;AccountName=monoinsurancestorage;AccountKey=xxxx;EndpointSuffix=core.windows.net
   ```
4. **Save this** — you will need it in Steps 5 and 7.

---

## Step 4 — Create App Service Plan + Web App (Backend)

1. Click **"Create a resource"** → Search **"Web App"** → Click **Create**
2. Fill in the **Basics** tab:
   | Field | Value |
   |---|---|
   | Subscription | Your subscription |
   | Resource group | `mono-insurance-rg` |
   | Name | `mono-insurance-api` *(globally unique)* |
   | Publish | **Code** |
   | Runtime stack | **Node 22 LTS** |
   | Operating System | **Linux** |
   | Region | Same as Resource Group |
3. Under **Pricing plan** → Click **"Create new"**
   - Name: `mono-insurance-plan`
   - SKU: **B1 (Basic)** *(cheapest paid tier; free tier doesn't support custom domains)*
4. Click **Review + Create** → **Create** *(~2 min)*

### 📌 Configure Backend Environment Variables

1. Go to your **Web App** (`mono-insurance-api`) → Left menu → **Settings** → **Environment variables**
2. Click **"+ Add"** for each variable below:

   | Name | Value |
   |---|---|
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | *(Paste your Cosmos DB connection string from Step 2)* |
   | `JWT_SECRET` | `mono_insurance_super_secret_jwt_key_2024` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `AZURE_STORAGE_CONNECTION_STRING` | *(Paste your Storage connection string from Step 3)* |
   | `AZURE_STORAGE_CONTAINER_NAME` | `insurance-claims` |

3. Click **Apply** → **Confirm**

### 📌 Configure Startup Command

1. Go to **Settings** → **Configuration** → **General settings**
2. Set **Startup Command** to: `node src/server.js`
3. Click **Save**

### 📌 Deploy the Backend Code

Open your terminal in the `mono-insurance/backend` folder:

```bash
# Zip the backend (exclude node_modules)
# Windows PowerShell:
Compress-Archive -Path * -DestinationPath ../backend-deploy.zip -Force

# Then deploy using Azure CLI:
az webapp deploy --resource-group mono-insurance-rg --name mono-insurance-api --src-path ../backend-deploy.zip --type zip
```

> Or use **VS Code Azure App Service extension** → Right-click your Web App → **Deploy to Web App**

### 📌 Seed the Database

After deploying, run the seeder from your local machine (or use the Kudu console):

```bash
# Set environment vars locally first, then run:
MONGO_URI="<your_cosmos_db_connection_string>" node src/seeders/seed.js
```

---

## Step 5 — Create Web App for Frontend

1. Repeat Step 4 to create another Web App:
   | Field | Value |
   |---|---|
   | Name | `mono-insurance-web` *(globally unique)* |
   | Runtime stack | **Node 22 LTS** |
   | App Service Plan | Select `mono-insurance-plan` *(reuse existing)* |

2. **Build the frontend** locally:
   ```bash
   cd frontend
   # Update vite.config.js to point proxy to the backend App Service URL
   # AZURE_BACKEND_URL = https://mono-insurance-api.azurewebsites.net
   npm run build
   ```

3. **Deploy the `dist` folder**:
   ```bash
   cd frontend/dist
   Compress-Archive -Path * -DestinationPath ../../frontend-deploy.zip -Force
   az webapp deploy --resource-group mono-insurance-rg --name mono-insurance-web --src-path ../../frontend-deploy.zip --type zip
   ```

4. **Configure Startup**: Set startup command to `npx serve -s . -l 3000`

---

## Step 6 — Create Application Gateway

The Application Gateway routes external traffic to your App Services.

1. Click **"Create a resource"** → Search **"Application Gateway"** → Click **Create**
2. Fill in **Basics**:
   | Field | Value |
   |---|---|
   | Resource group | `mono-insurance-rg` |
   | Application gateway name | `mono-insurance-agw` |
   | Region | Same as Resource Group |
   | Tier | **Standard V2** |
   | Enable autoscaling | Yes (min: 0, max: 2) |
3. **Frontends tab**:
   - Frontend IP type: **Public**
   - Add a new Public IP → name: `mono-insurance-pip`
4. **Backends tab** → Add a backend pool:
   - Name: `api-backend` → Target type: **App Service** → Select `mono-insurance-api`
   - Name: `web-backend` → Target type: **App Service** → Select `mono-insurance-web`
5. **Configuration tab** → Add a routing rule:
   - Rule name: `api-rule`
   - Priority: `100`
   - Listener: HTTP, port 80
   - Backend target: `api-backend`
   - Path: `/api/*`
   ---
   - Rule name: `web-rule`
   - Priority: `200`
   - Listener: HTTP, port 80  
   - Backend target: `web-backend`
   - Path: `/*`
6. Click **Review + Create** → **Create** *(takes ~5-10 min)*

> After creation, go to the Application Gateway overview page and note the **Frontend public IP address**. This is your public URL.

---

## Step 7 — Create Azure Function App

1. Click **"Create a resource"** → Search **"Function App"** → Click **Create**
2. Fill in:
   | Field | Value |
   |---|---|
   | Subscription | Your subscription |
   | Resource group | `mono-insurance-rg` |
   | Function App name | `mono-insurance-ocr-fn` *(globally unique)* |
   | Runtime stack | **Node.js** |
   | Version | **22 LTS** |
   | Region | Same as Resource Group |
   | Operating System | **Linux** |
   | Hosting plan | **Consumption (Serverless)** *(pay-per-use, free tier available)* |
   | Storage account | Select `monoinsurancestorage` *(from Step 3)* |
3. Click **Review + Create** → **Create** *(~2 min)*

### 📌 Configure Function App Environment Variables

1. Go to your **Function App** → Left menu → **Settings** → **Environment variables**
2. Click **"+ Add"** for each:

   | Name | Value |
   |---|---|
   | `AzureWebJobsStorage` | *(Paste your Storage connection string from Step 3)* |
   | `COSMOS_DB_CONNECTION_STRING` | *(Paste your Cosmos DB connection string from Step 2)* |
   | `COSMOS_DB_NAME` | `mono-insurance` |
   | `STORAGE_CONTAINER_NAME` | `insurance-claims` |

3. Click **Apply** → **Confirm**

### 📌 Deploy the Azure Function Code

Open your terminal in the `mono-insurance/azure-function` folder:

```bash
# Install dependencies first
npm install

# Deploy using Azure Functions Core Tools
func azure functionapp publish mono-insurance-ocr-fn
```

> Alternatively, use VS Code with the **Azure Functions extension** → Right-click your Function App → **Deploy to Function App**

---

## Step 8 — Verify End-to-End

### ✅ Test the full flow:

1. **Open** the Application Gateway public IP in your browser
2. **Register** a new user account
3. **Browse** policies under the Policies tab
4. **File a Claim** — select a policy, enter details, and upload a PDF file
5. Go to **My Claims** — you should see:
   - The claim in the table with **OCR Status: ⏳ Pending**
   - After ~30-60 seconds, refresh and the status becomes **✅ Done** and the extracted text appears in the claim detail modal

### ✅ Verify in Azure Portal:
- **Storage Account** → Containers → `insurance-claims` → confirm your PDF blob is there
- **Cosmos DB** → Data Explorer → `mono-insurance` → `claims` collection → open a document → verify `ocrText` and `ocrStatus: "completed"` fields are populated
- **Function App** → Functions → `ProcessClaimOcr` → Monitor → check invocation logs

---

## 🗂️ Architecture Summary

```
Internet
   │
   ▼
Application Gateway (public IP, port 80)
   ├── /api/*  ───────► App Service: mono-insurance-api (Node.js/Express)
   │                         │
   │                         ├── Reads/Writes ──► Cosmos DB (MongoDB API)
   │                         └── Uploads PDFs ──► Storage Account (Blob)
   │
   └── /*  ───────────► App Service: mono-insurance-web (Vite frontend)

Storage Account (insurance-claims container)
   │
   └── New blob event ──► Azure Function: ProcessClaimOcr
                              │
                              ├── Extracts text (pdf-parse)
                              └── Updates Cosmos DB claim with ocrText + ocrStatus
```

---

## ⚙️ Environment Variables Quick Reference

### Backend App Service (`mono-insurance-api`)
| Variable | Where to get it |
|---|---|
| `MONGO_URI` | Cosmos DB → Connection strings → Primary |
| `AZURE_STORAGE_CONNECTION_STRING` | Storage Account → Access keys → key1 connection string |
| `AZURE_STORAGE_CONTAINER_NAME` | `insurance-claims` (hardcoded) |
| `JWT_SECRET` | Your secret string |

### Function App (`mono-insurance-ocr-fn`)
| Variable | Where to get it |
|---|---|
| `AzureWebJobsStorage` | Storage Account → Access keys → key1 connection string |
| `COSMOS_DB_CONNECTION_STRING` | Cosmos DB → Connection strings → Primary |
| `COSMOS_DB_NAME` | `mono-insurance` (hardcoded) |
