import { QaseAPI, Suite } from '../qase-api';
import { prompt } from './prompt';


export async function selectSuite(qase: QaseAPI): Promise<number | null> {
  console.log('\n📁 Selección de carpeta (Suite)\n');
  
  const existingSuites = await qase.getSuites();
  
  if (existingSuites.length === 0) {
    console.log('❌ No hay carpetas existentes en Qase.');
    const createNew = await prompt('¿Querés crear una nueva carpeta? (y/n): ');
    
    if (createNew.toLowerCase() === 'y' || createNew.toLowerCase() === 'yes') {
      return await createNewSuite(qase);
    }
    
    console.log('✅ Los test cases se crearán sin carpeta');
    return null;
  }
  
  console.log('Carpetas disponibles:');
  existingSuites.forEach((suite, index) => {
    console.log(`  ${index + 1}. ${suite.title} (${suite.cases_count} test cases)`);
  });
  console.log(`  ${existingSuites.length + 1}. Crear nueva carpeta`);
  console.log(`  0. No usar carpeta (root level)`);
  
  const choice = await prompt('\nElegí una opción: ');
  const choiceNum = parseInt(choice);
  
  if (choiceNum === 0) {
    console.log('✅ Los test cases se crearán sin carpeta');
    return null;
  }
  
  if (choiceNum > 0 && choiceNum <= existingSuites.length) {
    const selectedSuite = existingSuites[choiceNum - 1];
    console.log(`✅ Carpeta seleccionada: "${selectedSuite.title}"`);
    return selectedSuite.id;
  }
  
  if (choiceNum === existingSuites.length + 1) {
    return await createNewSuite(qase);
  }
  
  console.log('❌ Opción inválida, usando root level');
  return null;
}

async function createNewSuite(qase: QaseAPI): Promise<number | null> {
  const suiteName = await prompt('\nNombre de la carpeta: ');
  
  if (!suiteName) {
    console.log('❌ Nombre inválido');
    return null;
  }
  
  const suiteDesc = await prompt('Descripción (opcional, Enter para omitir): ');
  
  console.log('\n🔄 Creando carpeta...');
  const newSuite = await qase.createSuite({
    title: suiteName,
    description: suiteDesc || undefined
  });
  
  if (newSuite) {
    console.log(`✅ Carpeta creada: "${newSuite.title}" (ID: ${newSuite.id})`);
    return newSuite.id;
  }
  
  console.log('❌ Error al crear carpeta');
  return null;
}

export async function confirmCreation(
  testCaseCount: number, 
  suiteId: number | null
): Promise<boolean> {
  console.log(`\n📊 Resumen:`);
  console.log(`  • Test cases a crear: ${testCaseCount}`);
  console.log(`  • Carpeta destino: ${suiteId ? `Suite ID ${suiteId}` : 'Sin carpeta (root level)'}`);
  
  const confirm = await prompt('\n¿Confirmar creación? (y/n): ');
  return confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes';
}