export interface TestStep {
  action: string;
  expected_result: string;
}

/**
 * Parser inteligente de steps con contexto
 * Genera expected results basándose en el tipo de acción y contexto
 */
export function createSteps(stepsText: string): TestStep[] {
  const lines = stepsText
    .trim()
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.?\s*/, '').trim());

  return lines.map((line, index) => {
    const action = line;
    const expected = generateIntelligentExpectedResult(action, index, lines);
    
    return {
      action,
      expected_result: expected
    };
  });
}

/**
 * Genera expected result inteligente basándose en patrones contextuales
 */
function generateIntelligentExpectedResult(
  action: string, 
  index: number, 
  allSteps: string[]
): string {
  const lowerAction = action.toLowerCase();
  
  // NAVEGACIÓN Y APERTURA
  if (lowerAction.match(/\b(navigate|open|go to|access|visit)\b/)) {
    return extractPageContext(lowerAction);
  }
  
  // CLICKS EN DIFERENTES CONTEXTOS
  if (lowerAction.match(/\b(click|press|tap|select)\b/)) {
    return handleClickAction(lowerAction, allSteps, index);
  }
  
  // INPUT DE DATOS
  if (lowerAction.match(/\b(enter|type|input|fill|write)\b/)) {
    return handleInputAction(lowerAction);
  }
  
  // VERIFICACIONES
  if (lowerAction.match(/\b(verify|check|ensure|confirm|validate|assert)\b/)) {
    return handleVerificationAction(lowerAction);
  }
  
  // SELECCIÓN DE ELEMENTOS
  if (lowerAction.match(/\b(select|choose|pick)\b/)) {
    return handleSelectionAction(lowerAction);
  }
  
  // ESPERAS Y CHECKS DE EXISTENCIA
  if (lowerAction.match(/\b(wait|see|find|locate)\b/)) {
    return handleWaitAction(lowerAction);
  }
  
  // ACCIONES DE EMAIL
  if (lowerAction.match(/\b(email|mail|message)\b/)) {
    return handleEmailAction(lowerAction);
  }
  
  // ACCIONES DE UPLOAD/DOWNLOAD
  if (lowerAction.match(/\b(upload|download|attach)\b/)) {
    return handleFileAction(lowerAction);
  }
  
  // SCROLL Y NAVEGACIÓN VISUAL
  if (lowerAction.match(/\b(scroll|swipe|drag)\b/)) {
    return handleScrollAction(lowerAction);
  }
  
  // LOGIN/LOGOUT
  if (lowerAction.match(/\b(login|log in|sign in|authenticate)\b/)) {
    return 'User is successfully authenticated and redirected to dashboard';
  }
  if (lowerAction.match(/\b(logout|log out|sign out)\b/)) {
    return 'User is logged out and redirected to login page';
  }
  
  // SUBMIT/SAVE/SEND
  if (lowerAction.match(/\b(submit|save|send|create|update)\b/)) {
    return handleSubmitAction(lowerAction);
  }
  
  // DELETE/REMOVE
  if (lowerAction.match(/\b(delete|remove|clear)\b/)) {
    return handleDeleteAction(lowerAction);
  }
  
  // REFRESH/RELOAD
  if (lowerAction.match(/\b(refresh|reload)\b/)) {
    return 'Page is refreshed and updated content is displayed';
  }
  
  // CLOSE/DISMISS
  if (lowerAction.match(/\b(close|dismiss|cancel)\b/)) {
    return handleCloseAction(lowerAction);
  }
  
  // HOVER/MOUSE OVER
  if (lowerAction.match(/\b(hover|mouse over)\b/)) {
    return 'Element responds to hover and shows additional information';
  }
  
  // SEARCH
  if (lowerAction.match(/\b(search|filter|query)\b/)) {
    return 'Search results are displayed and filtered correctly';
  }
  
  // DEFAULT
  return 'Action is completed successfully';
}

// ========== HANDLERS ESPECÍFICOS ==========

function extractPageContext(action: string): string {
  const pageMatch = action.match(/\b(?:to|the)\s+([a-z\s]+?)(?:\s+page|\s+screen|$)/i);
  if (pageMatch) {
    const pageName = pageMatch[1].trim();
    return `${capitalize(pageName)} page is displayed and fully loaded`;
  }
  return 'Page is displayed and fully loaded';
}

function handleClickAction(action: string, allSteps: string[], index: number): string {
  const lowerAction = action.toLowerCase();
  
  // Click en botones específicos
  if (lowerAction.includes('submit')) {
    return 'Form is submitted and processing begins';
  }
  if (lowerAction.includes('save')) {
    return 'Data is saved successfully and confirmation is shown';
  }
  if (lowerAction.includes('send')) {
    return 'Item is sent successfully';
  }
  if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
    return 'Item is deleted and confirmation message is displayed';
  }
  if (lowerAction.includes('login') || lowerAction.includes('sign in')) {
    return 'User is authenticated and redirected to dashboard';
  }
  if (lowerAction.includes('logout') || lowerAction.includes('sign out')) {
    return 'User is logged out and redirected to login page';
  }
  if (lowerAction.includes('cancel')) {
    return 'Action is cancelled and no changes are made';
  }
  if (lowerAction.includes('confirm') || lowerAction.includes('ok')) {
    return 'Action is confirmed and executed';
  }
  if (lowerAction.includes('link') || lowerAction.includes('url')) {
    return 'User is redirected to the linked page';
  }
  if (lowerAction.includes('menu') || lowerAction.includes('dropdown')) {
    return 'Menu expands and options are displayed';
  }
  if (lowerAction.includes('tab')) {
    return 'Tab is activated and corresponding content is displayed';
  }
  if (lowerAction.includes('close') || lowerAction.includes('x')) {
    return 'Element is closed and removed from view';
  }
  
  // Contexto del siguiente step
  if (index < allSteps.length - 1) {
    const nextStep = allSteps[index + 1].toLowerCase();
    if (nextStep.includes('verify') || nextStep.includes('check')) {
      return 'Element is clicked and expected state change occurs';
    }
  }
  
  return 'Element is clicked and action is performed successfully';
}

function handleInputAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('email')) {
    return 'Email address is entered in correct format and accepted';
  }
  if (lowerAction.includes('password')) {
    return 'Password is entered, masked, and meets security requirements';
  }
  if (lowerAction.includes('username')) {
    return 'Username is entered and validated';
  }
  if (lowerAction.includes('phone') || lowerAction.includes('number')) {
    return 'Phone number is entered in correct format';
  }
  if (lowerAction.includes('date')) {
    return 'Date is selected and displayed in correct format';
  }
  if (lowerAction.includes('address')) {
    return 'Address is entered with all required fields';
  }
  if (lowerAction.includes('credit card') || lowerAction.includes('payment')) {
    return 'Payment information is entered securely';
  }
  if (lowerAction.includes('search')) {
    return 'Search term is entered and ready for submission';
  }
  
  return 'Data is entered correctly in the field';
}

function handleVerificationAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  // Extraer qué se está verificando
  const verifyMatch = action.match(/verify|check|ensure|confirm|validate|assert/i);
  if (verifyMatch) {
    const whatToVerify = action.substring(verifyMatch.index! + verifyMatch[0].length).trim();
    if (whatToVerify) {
      return `${capitalize(whatToVerify)} is correct and as expected`;
    }
  }
  
  if (lowerAction.includes('email')) {
    return 'Email is received with correct content and sender';
  }
  if (lowerAction.includes('message') || lowerAction.includes('notification')) {
    return 'Message is displayed with correct content';
  }
  if (lowerAction.includes('error')) {
    return 'Error message is displayed correctly';
  }
  if (lowerAction.includes('success')) {
    return 'Success message is displayed correctly';
  }
  if (lowerAction.includes('redirect')) {
    return 'User is redirected to the correct page';
  }
  if (lowerAction.includes('display') || lowerAction.includes('visible')) {
    return 'Element is displayed and visible on the page';
  }
  
  return 'Verification passes and state is as expected';
}

function handleSelectionAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('dropdown') || lowerAction.includes('list')) {
    return 'Option is selected from dropdown and applied';
  }
  if (lowerAction.includes('checkbox')) {
    return 'Checkbox is selected and state changes';
  }
  if (lowerAction.includes('radio')) {
    return 'Radio button is selected and other options are deselected';
  }
  if (lowerAction.includes('date') || lowerAction.includes('calendar')) {
    return 'Date is selected from calendar picker';
  }
  if (lowerAction.includes('file')) {
    return 'File is selected from file system';
  }
  
  return 'Option is selected successfully';
}

function handleWaitAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('email')) {
    return 'Email is received within expected timeframe';
  }
  if (lowerAction.includes('load') || lowerAction.includes('appear')) {
    return 'Element loads and appears on the page';
  }
  if (lowerAction.includes('process') || lowerAction.includes('complete')) {
    return 'Process completes within expected time';
  }
  
  return 'Expected element or state appears';
}

function handleEmailAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('send')) {
    return 'Email is sent successfully';
  }
  if (lowerAction.includes('receive') || lowerAction.includes('check')) {
    return 'Email is received with correct subject and content';
  }
  if (lowerAction.includes('open')) {
    return 'Email is opened and content is displayed';
  }
  if (lowerAction.includes('verify') || lowerAction.includes('confirm')) {
    return 'Email contains expected information and links work correctly';
  }
  
  return 'Email action is completed successfully';
}

function handleFileAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('upload')) {
    return 'File is uploaded successfully and confirmation is shown';
  }
  if (lowerAction.includes('download')) {
    return 'File is downloaded to local system successfully';
  }
  if (lowerAction.includes('attach')) {
    return 'File is attached and ready for submission';
  }
  
  return 'File operation completes successfully';
}

function handleScrollAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('bottom')) {
    return 'Page scrolls to bottom and all content is loaded';
  }
  if (lowerAction.includes('top')) {
    return 'Page scrolls to top';
  }
  if (lowerAction.includes('element')) {
    return 'Page scrolls and target element is visible';
  }
  
  return 'Page scrolls and content is navigable';
}

function handleSubmitAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('form')) {
    return 'Form is submitted and validation passes';
  }
  if (lowerAction.includes('save')) {
    return 'Changes are saved successfully and confirmation is displayed';
  }
  if (lowerAction.includes('create')) {
    return 'Item is created successfully with confirmation';
  }
  if (lowerAction.includes('update')) {
    return 'Item is updated successfully with confirmation';
  }
  if (lowerAction.includes('send')) {
    return 'Data is sent successfully';
  }
  
  return 'Submission is successful and confirmation is shown';
}

function handleDeleteAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('confirm')) {
    return 'Item is permanently deleted and removed from view';
  }
  if (lowerAction.includes('clear')) {
    return 'Field or data is cleared successfully';
  }
  
  return 'Item is deleted and confirmation message is displayed';
}

function handleCloseAction(action: string): string {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('modal') || lowerAction.includes('popup') || lowerAction.includes('dialog')) {
    return 'Modal is closed and user returns to previous screen';
  }
  if (lowerAction.includes('notification')) {
    return 'Notification is dismissed';
  }
  
  return 'Element is closed and removed from view';
}

// ========== UTILIDADES ==========

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== EJEMPLO DE USO ==========

/*
const steps = createSteps(`
  Navigate to registration page
  Enter email address
  Enter password
  Click submit button
  Check email for confirmation link
  Open confirmation email
  Click confirmation link
  Verify account is activated
`);

console.log(steps);
*/