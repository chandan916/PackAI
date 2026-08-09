# Deploying PackAI to Zerops Cloud (Step-by-Step Guide)

This guide walks you through deploying **PackAI** to [Zerops](https://zerops.io).

---

## 📁 Prepared Configuration Files

We have created two configuration files in the root of your project:

1. **[`zerops.yml`](file:///c:/Users/CHANDAN/Documents/Hackathon-2026/zerops.yml)**: Defines the automated build, cache, deployment files, ports, and runtime commands for both `backend` and `frontend`.
2. **[`zerops-import.yaml`](file:///c:/Users/CHANDAN/Documents/Hackathon-2026/zerops-import.yaml)**: Template to import and create the project services on the Zerops GUI with 1 click.

---

## 🚀 Option 1: Deploy via GitHub / GitLab (Recommended)

### Step 1: Push your code to GitHub
Push your Hackathon repository containing `zerops.yml` and the `packai/` directory to GitHub.

### Step 2: Create Project in Zerops
1. Log in to [Zerops Dashboard](https://app.zerops.io).
2. Click **"+ Add Project"**.
3. Select **"Import YAML / JSON"** and paste the content of [`zerops-import.yaml`](file:///c:/Users/CHANDAN/Documents/Hackathon-2026/zerops-import.yaml):
   ```yaml
   project:
     name: packai

   services:
     - hostname: backend
       type: nodejs@20
       minContainers: 1
       maxContainers: 2
       envSecrets:
         GEMINI_API_KEY: "your_gemini_api_key_here"

     - hostname: frontend
       type: nodejs@20
       minContainers: 1
       maxContainers: 2
   ```
4. Click **Create Project** (or **Import**).

### Step 3: Connect Git Repository
1. In the Zerops dashboard, click on the **backend** service -> **Pipeline & CI/CD** -> Connect your GitHub repository.
2. Under trigger setup, select `backend` as the setup from `zerops.yml`.
3. In the **frontend** service -> **Pipeline & CI/CD** -> Connect your GitHub repository, selecting `frontend` as the setup.

### Step 4: Enable Public Access
1. Go to your **frontend** service in Zerops.
2. Click **Public Access** -> **Enable Zerops Subdomain** (or add your custom domain).
3. Open the public URL — your PackAI 3D visualizer will be live on the web!

---

## 💻 Option 2: Deploy via Zerops CLI (`zcli`)

If you want to deploy directly from your local terminal:

1. Install `zcli`:
   ```bash
   npm i -g @zerops/zcli
   ```
2. Log in with your Zerops access token:
   ```bash
   zcli login <your-access-token>
   ```
3. Push and trigger deployment:
   ```bash
   zcli push --service backend
   zcli push --service frontend
   ```
