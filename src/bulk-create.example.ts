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
      steps: createSteps(`
        Navigate to login page
        Enter valid username
        Enter valid password
        Click login button
        Verify user is redirected to dashboard
      `),
    },
    {
      title: "Verify login with invalid password",
      steps: createSteps(`
        Navigate to login page
        Enter valid username
        Enter invalid password
        Click login button
        Verify error message is displayed
      `),
    },
    {
      title: "Verify logout functionality",
      steps: createSteps(`
        User is logged in
        Click user menu icon
        Click logout button
        Verify user is redirected to login page
      `),
    }
    // Agregá más test cases acá...
  ];

  // Esta función maneja todo: selección de suite, preview, confirmación y creación
  await executeBulkCreation(qase, testCases);
}

main();
