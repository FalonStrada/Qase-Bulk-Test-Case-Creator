import * as dotenv from 'dotenv';
import { QaseAPI } from './qase-api';
import { createSteps } from './utils/step-parser';
import { executeBulkCreation } from './utils/bulk-manager';

dotenv.config();

const qase = new QaseAPI(
  process.env.QASE_API_TOKEN!,
  process.env.QASE_PROJECT_CODE!
);

async function main() {
  console.log('🚀 Iniciando bulk creation de test cases...\n');

  // ========== PEGÁ TUS TEST CASES ACÁ ==========
  
  const testCases = [
    {
      title: "Verify login with valid credentials",
      severity: 0,  
      priority: 0,  
      type: 2,      // functional
      steps: createSteps(`
        Navigate to login page
        Enter valid username
        Enter valid password
        Click login button
        Verify user is redirected to dashboard
      `),
      tags: ["login", "regression"]
    },
    {
      title: "Verify login with invalid password",
      severity: 0,
      priority: 0,
      type: 2,  // functional
      steps: createSteps(`
        Navigate to login page
        Enter valid username
        Enter invalid password
        Click login button
        Verify error message is displayed
      `),
      tags: ["login", "negative"]
    },
    {
      title: "Verify logout functionality",
      severity: 0,  
      priority: 0,  
      type: 2,
      steps: createSteps(`
        User is logged in
        Click user menu icon
        Click logout button
        Verify user is redirected to login page
      `),
      tags: ["logout"]
    }
    // Agregá más test cases acá máximo 10 en total...
  ];

 // Esta función maneja todo: selección de suite, preview, confirmación y creación
  await executeBulkCreation(qase, testCases);
}

main(); 