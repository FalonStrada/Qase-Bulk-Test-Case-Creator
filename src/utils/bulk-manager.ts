import { QaseAPI, CreateTestCasePayload } from '../qase-api';
import { selectSuite, confirmCreation } from './suite-selector';
import { closePrompt } from './prompt';

export async function executeBulkCreation(
  qase: QaseAPI,
  testCases: CreateTestCasePayload[]
): Promise<void> {
  try {
    // PASO 1: Seleccionar carpeta
    const suiteId = await selectSuite(qase);
    
    // PASO 2: Asignar suite_id a todos los tests
    const testsWithSuite = testCases.map(tc => ({
      ...tc,
      suite_id: suiteId || undefined
    }));
    
    // PASO 3: Preview
    console.log('\n📝 Test cases a crear:\n');
    testsWithSuite.forEach((tc, index) => {
      console.log(`  ${index + 1}. ${tc.title}`);
    });
    
    // PASO 4: Confirmar
    const confirmed = await confirmCreation(testsWithSuite.length, suiteId);
    
    if (!confirmed) {
      console.log('\n❌ Operación cancelada');
      return;
    }
    
    // PASO 5: Crear
    console.log('\n🔄 Creando test cases...\n');
    const results = await qase.createTestCasesBatch(testsWithSuite);
    
    const successful = results.filter(Boolean).length;
    console.log(`\n✅ Completado: ${successful}/${testsWithSuite.length} test cases creados`);
    
    if (successful < testsWithSuite.length) {
      console.warn(`⚠️  ${testsWithSuite.length - successful} fallaron`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    closePrompt();
  }
}