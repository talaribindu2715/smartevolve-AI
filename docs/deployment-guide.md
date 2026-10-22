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
- `SUPABASE_DB_URL`: `jdbc:postgresql://db.YOUR_REF.supabase.co:5432/postgres`
- `SUPABASE_DB_USER`: `postgres`
- `SUPABASE_DB_PASSWORD`: `YOUR_PASSWORD`
- `SUPABASE_JWT_SECRET`: `YOUR_SUPABASE_JWT_SECRET`
- `CONTRACT_ADDRESS`: `YOUR_DEPLOYED_CONTRACT_ADDRESS`
- `BLOCKCHAIN_RPC_URL`: `YOUR_SEPOLIA_RPC_OR_LOCAL`

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
