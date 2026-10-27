# SmartEvolve AI — Comprehensive Deployment Guide

This guide covers deployment instructions for the **Mobile App (React Native/Expo)**, **Backend (Java Spring Boot)**, **Database (Supabase PostgreSQL)**, and **Blockchain (EVM Smart Contracts)**.

---

## 1. Supabase PostgreSQL & Auth Setup

1. Create a project at [https://supabase.com](https://supabase.com).
2. Retrieve your project credentials from **Project Settings -> API & Database**:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`
   - `Database Connection String (URI)`
3. Apply SQL migrations:
   - Using Supabase CLI:
     ```bash
     supabase link --project-ref YOUR_PROJECT_REF
     supabase db push
     ```
   - Or paste `supabase/migrations/20261022000001_initial_schema.sql` and `20261022000002_seed_data.sql` directly into the Supabase Web SQL Editor.

---

## 2. Blockchain Smart Contract Deployment

### A. Local Development (Hardhat Node)
1. Start the local EVM node:
   ```bash
   cd blockchain
   npm run node
   ```
2. In a separate terminal, deploy the contract:
   ```bash
   npm run deploy:local
   ```
3. Copy the output contract address (default: `0x5FbDB2315678afecb367f032d93F642f64180aa3`) into `backend/.env`.

### B. Public EVM Testnet (Sepolia)
1. Configure `blockchain/.env`:
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY
   ```
2. Deploy to Sepolia:
   ```bash
   npm run deploy:sepolia
   ```

---

## 3. Java Spring Boot Backend Deployment (Render / Cloud)

### A. Local Execution
```bash
cd backend
mvn spring-boot:run
```
Swagger UI will be available at: `http://localhost:8080/swagger-ui.html`

### B. Production Deployment via Docker / Render
Create a `Dockerfile` in `backend/`:
```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/smartevolve-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Set Environment Variables in Render:

#### Option A: Supabase Connection Pooler (Recommended for Render)
> **Note**: Render Free Tier requires IPv4, so the Supabase Connection Pooler (Port 6543) is strongly recommended.
- `SUPABASE_DB_URL`: `jdbc:postgresql://aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require`
- `SUPABASE_DB_USER`: `postgres.[YOUR-PROJECT-REF]` *(e.g. `postgres.abcdefghijklmnopqrst` - NOT `postgres.YOUR_SUPABASE_PROJECT_REF`)*
- `SUPABASE_DB_PASSWORD`: `[YOUR-SUPABASE-DATABASE-PASSWORD]`
- `SUPABASE_URL`: `https://[YOUR-PROJECT-REF].supabase.co`
- `SUPABASE_JWT_SECRET`: `[YOUR-SUPABASE-JWT-SECRET]`
- `SUPABASE_JWT_ISSUER`: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1`
- `CONTRACT_ADDRESS`: `0x5FbDB2315678afecb367f032d93F642f64180aa3` *(or your deployed contract address)*
- `BLOCKCHAIN_RPC_URL`: `https://rpc.sepolia.org`

#### Option B: Supabase Direct Connection (Requires IPv6 or Addon)
- `SUPABASE_DB_URL`: `jdbc:postgresql://db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require`
- `SUPABASE_DB_USER`: `postgres`
- `SUPABASE_DB_PASSWORD`: `[YOUR-SUPABASE-DATABASE-PASSWORD]`
- `SUPABASE_URL`: `https://[YOUR-PROJECT-REF].supabase.co`
- `SUPABASE_JWT_SECRET`: `[YOUR-SUPABASE-JWT-SECRET]`

---

## 4. Mobile React Native App Deployment (Android APK & iOS)

### A. Local Development Build
```bash
cd mobile
npm install
npx expo start
```
Press `a` to open in Android Emulator or scan the QR code in Expo Go.

### B. Generating Standalone Android APK via EAS Build
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Configure `mobile/eas.json`:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         },
         "env": {
           "EXPO_PUBLIC_API_URL": "https://your-backend-service.onrender.com"
         }
       }
     }
   }
   ```
3. Trigger APK compilation:
   ```bash
   eas build -p android --profile preview
   ```
   Download the generated `.apk` and install directly onto any Android device!

---

## 5. Web Frontend Deployment via Vercel

The mobile application is powered by Expo Router, which natively compiles to a high-performance static web application (`npx expo export -p web`) fully supported by Vercel.

### Method A: Connect GitHub Repository to Vercel (Recommended)
1. Push your repository to GitHub:
   ```bash
   git push -u origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new) and select your repository (`talaribindu2715/smartevolve-AI`).
3. In the **Project Configuration** panel:
   - **Framework Preset**: `Other`
   - **Root Directory**: Click "Edit" and choose `mobile`
   - **Build Command**: `npx expo export -p web` (or leave default if reading `mobile/vercel.json`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
4. Add **Environment Variables**:
   - `EXPO_PUBLIC_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com/api/v1`)
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Click **Deploy**. Vercel will build and assign your production URL (e.g., `https://smartevolve-ai.vercel.app`).

### Method B: Deploy using Vercel CLI
From your terminal:
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to the mobile directory
cd e:/SmartEvolve-learning/mobile

# 3. Export web bundle locally to verify
npm run build:web

# 4. Deploy to preview
vercel

# 5. Deploy to production
vercel --prod
```
The pre-configured `mobile/vercel.json` automatically configures clean URLs, SPA rewrite rules (`/* -> /index.html`), and security headers.

