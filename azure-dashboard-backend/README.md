# Azure Dashboard Backend

This is a Node.js backend service using Express. It exposes an endpoint `/projects` that fetches the project list from Azure DevOps using the REST API.

## Setup

1. Install dependencies:
   
   ```sh
   npm install
   ```

2. Set the following environment variables in .env file:
   
   - `AZURE_ORG`: Your Azure DevOps organisation name
   - `AZURE_PAT`: Your Azure DevOps Personal Access Token

3. Start the server:
   
   ```sh
   node index.js
   ```
   
   - If you want to use .env file
     
     ```sh
     node --env-file=.env index.js
     ```

## Endpoint

- `GET /projects`: Returns the list of projects from Azure DevOps.
