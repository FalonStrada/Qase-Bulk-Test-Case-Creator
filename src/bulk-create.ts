import * as dotenv from 'dotenv';
import { QaseAPI } from './qase-api';
import { createSteps } from './utils/../step-parser';

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
      severity: 0,  // critical
      priority: 0,  // high
      type: 3,      // smoke
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
      severity: 0,  // major
      priority: 0,  // medium
      type: 2,
      steps: createSteps(`
        User is logged in
        Click user menu icon
        Click logout button
        Verify user is redirected to login page
      `),
      tags: ["logout"]
    }
    // Agregá más test cases acá...
  ];

  console.log(`📊 Total de test cases a crear: ${testCases.length}\n`);

  // Crear todos los test cases
  const results = await qase.createTestCasesBatch(testCases);

  const successful = results.filter(Boolean).length;
  console.log(`\n✅ Resultado: ${successful}/${testCases.length} test cases creados exitosamente`);

  if (successful < testCases.length) {
    console.warn(`⚠️  ${testCases.length - successful} test cases fallaron`);
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});