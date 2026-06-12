export interface TestStep {
  action: string;
  expected_result: string;
}

type Lang = 'es' | 'en';

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

function detectLanguage(action: string): Lang {
  const spanishVerbs = /\b(navegar|ir a|abrir|acceder|visitar|hacer clic|clicar|presionar|pulsar|tocar|ingresar|tipear|escribir|completar|llenar|verificar|comprobar|confirmar|validar|asegurar|seleccionar|elegir|escoger|esperar|encontrar|localizar|correo|subir|cargar|descargar|adjuntar|desplazar|deslizar|arrastrar|iniciar sesión|cerrar sesión|enviar|guardar|crear|actualizar|eliminar|borrar|limpiar|quitar|recargar|cerrar|descartar|cancelar|buscar|filtrar|asignar|activar|desactivar|habilitar|deshabilitar|expandir|contraer|marcar|desmarcar|observar|revisar|mostrar)\b/i;
  return spanishVerbs.test(action) ? 'es' : 'en';
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
  const lang = detectLanguage(action);

  // NAVEGACIÓN Y APERTURA
  if (lowerAction.match(/\b(navigate|open|go to|access|visit|navegar|abrir|acceder|visitar)\b/) || lowerAction.includes('ir a')) {
    return extractPageContext(lowerAction, lang);
  }

  // CLICKS EN DIFERENTES CONTEXTOS
  if (lowerAction.match(/\b(click|press|tap|select|hacer clic|clicar|presionar|pulsar|tocar)\b/)) {
    return handleClickAction(lowerAction, allSteps, index, lang);
  }

  // INPUT DE DATOS
  if (lowerAction.match(/\b(enter|type|input|fill|write|ingresar|tipear|escribir|completar|llenar)\b/)) {
    return handleInputAction(lowerAction, lang);
  }

  // VERIFICACIONES
  if (lowerAction.match(/\b(verify|check|ensure|confirm|validate|assert|verificar|comprobar|confirmar|validar|asegurar)\b/)) {
    return handleVerificationAction(action, lang);
  }

  // SELECCIÓN DE ELEMENTOS
  if (lowerAction.match(/\b(select|choose|pick|seleccionar|elegir|escoger)\b/)) {
    return handleSelectionAction(lowerAction, lang);
  }

  // ESPERAS Y CHECKS DE EXISTENCIA
  if (lowerAction.match(/\b(wait|see|find|locate|esperar|encontrar|localizar)\b/)) {
    return handleWaitAction(lowerAction, lang);
  }

  // ACCIONES DE EMAIL
  if (lowerAction.match(/\b(email|mail|message|correo|mensaje)\b/)) {
    return handleEmailAction(lowerAction, lang);
  }

  // ACCIONES DE UPLOAD/DOWNLOAD
  if (lowerAction.match(/\b(upload|download|attach|subir|cargar|descargar|adjuntar)\b/)) {
    return handleFileAction(lowerAction, lang);
  }

  // SCROLL Y NAVEGACIÓN VISUAL
  if (lowerAction.match(/\b(scroll|swipe|drag|desplazar|deslizar|arrastrar)\b/)) {
    return handleScrollAction(lowerAction, lang);
  }

  // LOGIN/LOGOUT
  if (lowerAction.match(/\b(login|log in|sign in|authenticate)\b/) || lowerAction.includes('iniciar sesión')) {
    return lang === 'es'
      ? 'El usuario se autentica correctamente y es redirigido al dashboard'
      : 'User is successfully authenticated and redirected to dashboard';
  }
  if (lowerAction.match(/\b(logout|log out|sign out)\b/) || lowerAction.includes('cerrar sesión')) {
    return lang === 'es'
      ? 'El usuario cierra sesión y es redirigido al login'
      : 'User is logged out and redirected to login page';
  }

  // SUBMIT/SAVE/SEND
  if (lowerAction.match(/\b(submit|save|send|create|update|enviar|guardar|crear|actualizar)\b/)) {
    return handleSubmitAction(lowerAction, lang);
  }

  // DELETE/REMOVE
  if (lowerAction.match(/\b(delete|remove|clear|eliminar|borrar|limpiar|quitar)\b/)) {
    return handleDeleteAction(lowerAction, lang);
  }

  // REFRESH/RELOAD
  if (lowerAction.match(/\b(refresh|reload|recargar)\b/)) {
    return lang === 'es'
      ? 'La página se recarga y el contenido actualizado se muestra'
      : 'Page is refreshed and updated content is displayed';
  }

  // CLOSE/DISMISS
  if (lowerAction.match(/\b(close|dismiss|cancel|cerrar|descartar|cancelar)\b/)) {
    return handleCloseAction(lowerAction, lang);
  }

  // HOVER/MOUSE OVER
  if (lowerAction.match(/\b(hover|mouse over)\b/) || lowerAction.includes('pasar el cursor')) {
    return lang === 'es'
      ? 'El elemento responde al hover y muestra información adicional'
      : 'Element responds to hover and shows additional information';
  }

  // SEARCH
  if (lowerAction.match(/\b(search|filter|query|buscar|filtrar)\b/)) {
    return lang === 'es'
      ? 'Los resultados se muestran y filtran correctamente'
      : 'Search results are displayed and filtered correctly';
  }

  // DEFAULT
  return lang === 'es' ? 'La acción se completa exitosamente' : 'Action is completed successfully';
}

// ========== HANDLERS ESPECÍFICOS ==========

function extractPageContext(action: string, lang: Lang): string {
  if (lang === 'es') {
    const pageMatch = action.match(/(?:a la|la)\s+(?:página|pantalla)\s+(?:de\s+)?(.+?)(?:\s+página|\s+pantalla|$)/i);
    if (pageMatch) {
      const pageName = pageMatch[1].trim();
      return `La página de ${pageName} se muestra y carga completamente`;
    }
    return 'La página se muestra y carga completamente';
  }

  const pageMatch = action.match(/\b(?:to|the)\s+([a-z\s]+?)(?:\s+page|\s+screen|$)/i);
  if (pageMatch) {
    const pageName = pageMatch[1].trim();
    return `${capitalize(pageName)} page is displayed and fully loaded`;
  }
  return 'Page is displayed and fully loaded';
}

function handleClickAction(action: string, allSteps: string[], index: number, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('submit') || action.includes('enviar')) return 'El formulario es enviado y el procesamiento comienza';
    if (action.includes('save') || action.includes('guardar')) return 'Los datos se guardan exitosamente y se muestra la confirmación';
    if (action.includes('send') || action.includes('mandar')) return 'El elemento se envía exitosamente';
    if (action.includes('delete') || action.includes('remove') || action.includes('eliminar') || action.includes('borrar')) return 'El elemento es eliminado y se muestra el mensaje de confirmación';
    if (action.includes('login') || action.includes('iniciar sesión') || action.includes('sign in')) return 'El usuario se autentica y es redirigido al dashboard';
    if (action.includes('logout') || action.includes('cerrar sesión') || action.includes('sign out')) return 'El usuario cierra sesión y es redirigido al login';
    if (action.includes('cancel') || action.includes('cancelar')) return 'La acción es cancelada y no se realizan cambios';
    if (action.includes('confirm') || action.includes('confirmar') || action.includes('ok')) return 'La acción es confirmada y ejecutada';
    if (action.includes('link') || action.includes('url') || action.includes('enlace')) return 'El usuario es redirigido a la página del enlace';
    if (action.includes('menu') || action.includes('dropdown') || action.includes('desplegable')) return 'El menú se expande y las opciones se muestran';
    if (action.includes('tab') || action.includes('pestaña')) return 'La pestaña se activa y su contenido correspondiente se muestra';
    if (action.includes('close') || action.includes('cerrar')) return 'El elemento se cierra y es removido de la vista';

    if (index < allSteps.length - 1) {
      const nextStep = allSteps[index + 1].toLowerCase();
      if (nextStep.match(/\b(verify|check|verificar|comprobar)\b/)) {
        return 'El elemento es clickeado y ocurre el cambio de estado esperado';
      }
    }
    return 'El elemento es clickeado y la acción se ejecuta correctamente';
  }

  if (action.includes('submit')) return 'Form is submitted and processing begins';
  if (action.includes('save')) return 'Data is saved successfully and confirmation is shown';
  if (action.includes('send')) return 'Item is sent successfully';
  if (action.includes('delete') || action.includes('remove')) return 'Item is deleted and confirmation message is displayed';
  if (action.includes('login') || action.includes('sign in')) return 'User is authenticated and redirected to dashboard';
  if (action.includes('logout') || action.includes('sign out')) return 'User is logged out and redirected to login page';
  if (action.includes('cancel')) return 'Action is cancelled and no changes are made';
  if (action.includes('confirm') || action.includes('ok')) return 'Action is confirmed and executed';
  if (action.includes('link') || action.includes('url')) return 'User is redirected to the linked page';
  if (action.includes('menu') || action.includes('dropdown')) return 'Menu expands and options are displayed';
  if (action.includes('tab')) return 'Tab is activated and corresponding content is displayed';
  if (action.includes('close') || action.includes('x')) return 'Element is closed and removed from view';

  if (index < allSteps.length - 1) {
    const nextStep = allSteps[index + 1].toLowerCase();
    if (nextStep.includes('verify') || nextStep.includes('check')) {
      return 'Element is clicked and expected state change occurs';
    }
  }

  return 'Element is clicked and action is performed successfully';
}

function handleInputAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('email') || action.includes('correo')) return 'La dirección de email se ingresa en el formato correcto y es aceptada';
    if (action.includes('password') || action.includes('contraseña')) return 'La contraseña se ingresa enmascarada y cumple los requisitos de seguridad';
    if (action.includes('username') || action.includes('usuario')) return 'El nombre de usuario se ingresa y es validado';
    if (action.includes('phone') || action.includes('teléfono') || action.includes('número')) return 'El número de teléfono se ingresa en el formato correcto';
    if (action.includes('date') || action.includes('fecha')) return 'La fecha se selecciona y se muestra en el formato correcto';
    if (action.includes('address') || action.includes('dirección')) return 'La dirección se ingresa con todos los campos requeridos';
    if (action.includes('credit card') || action.includes('tarjeta') || action.includes('payment') || action.includes('pago')) return 'La información de pago se ingresa de forma segura';
    if (action.includes('search') || action.includes('búsqueda') || action.includes('buscar')) return 'El término de búsqueda se ingresa y está listo para enviarse';
    return 'El dato se ingresa correctamente en el campo';
  }

  if (action.includes('email')) return 'Email address is entered in correct format and accepted';
  if (action.includes('password')) return 'Password is entered, masked, and meets security requirements';
  if (action.includes('username')) return 'Username is entered and validated';
  if (action.includes('phone') || action.includes('number')) return 'Phone number is entered in correct format';
  if (action.includes('date')) return 'Date is selected and displayed in correct format';
  if (action.includes('address')) return 'Address is entered with all required fields';
  if (action.includes('credit card') || action.includes('payment')) return 'Payment information is entered securely';
  if (action.includes('search')) return 'Search term is entered and ready for submission';
  return 'Data is entered correctly in the field';
}

function handleVerificationAction(action: string, lang: Lang): string {
  const verbPattern = /verificar|comprobar|confirmar|validar|asegurar|verify|check|ensure|confirm|validate|assert/i;
  const verifyMatch = action.match(verbPattern);
  const lowerAction = action.toLowerCase();

  if (verifyMatch) {
    const whatToVerify = action.substring(verifyMatch.index! + verifyMatch[0].length).trim();
    if (whatToVerify) {
      return lang === 'es'
        ? `${capitalize(whatToVerify)} es correcto y como se espera`
        : `${capitalize(whatToVerify)} is correct and as expected`;
    }
  }

  if (lang === 'es') {
    if (lowerAction.includes('email') || lowerAction.includes('correo')) return 'El correo es recibido con el contenido y remitente correctos';
    if (lowerAction.includes('message') || lowerAction.includes('notification') || lowerAction.includes('mensaje') || lowerAction.includes('notificación')) return 'El mensaje se muestra con el contenido correcto';
    if (lowerAction.includes('error')) return 'El mensaje de error se muestra correctamente';
    if (lowerAction.includes('success') || lowerAction.includes('éxito') || lowerAction.includes('exitoso')) return 'El mensaje de éxito se muestra correctamente';
    if (lowerAction.includes('redirect') || lowerAction.includes('redirige') || lowerAction.includes('redirigido')) return 'El usuario es redirigido a la página correcta';
    if (lowerAction.includes('display') || lowerAction.includes('visible') || lowerAction.includes('muestra') || lowerAction.includes('visible')) return 'El elemento se muestra y es visible en la página';
    return 'La verificación pasa y el estado es el esperado';
  }

  if (lowerAction.includes('email')) return 'Email is received with correct content and sender';
  if (lowerAction.includes('message') || lowerAction.includes('notification')) return 'Message is displayed with correct content';
  if (lowerAction.includes('error')) return 'Error message is displayed correctly';
  if (lowerAction.includes('success')) return 'Success message is displayed correctly';
  if (lowerAction.includes('redirect')) return 'User is redirected to the correct page';
  if (lowerAction.includes('display') || lowerAction.includes('visible')) return 'Element is displayed and visible on the page';
  return 'Verification passes and state is as expected';
}

function handleSelectionAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('dropdown') || action.includes('desplegable') || action.includes('list') || action.includes('lista')) return 'La opción es seleccionada del desplegable y se aplica';
    if (action.includes('checkbox') || action.includes('casilla')) return 'El checkbox es seleccionado y el estado cambia';
    if (action.includes('radio')) return 'El radio button es seleccionado y las demás opciones se deseleccionan';
    if (action.includes('date') || action.includes('fecha') || action.includes('calendar') || action.includes('calendario')) return 'La fecha es seleccionada del calendario';
    if (action.includes('file') || action.includes('archivo')) return 'El archivo es seleccionado del sistema de archivos';
    return 'La opción es seleccionada exitosamente';
  }

  if (action.includes('dropdown') || action.includes('list')) return 'Option is selected from dropdown and applied';
  if (action.includes('checkbox')) return 'Checkbox is selected and state changes';
  if (action.includes('radio')) return 'Radio button is selected and other options are deselected';
  if (action.includes('date') || action.includes('calendar')) return 'Date is selected from calendar picker';
  if (action.includes('file')) return 'File is selected from file system';
  return 'Option is selected successfully';
}

function handleWaitAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('email') || action.includes('correo')) return 'El correo es recibido dentro del tiempo esperado';
    if (action.includes('load') || action.includes('carga') || action.includes('appear') || action.includes('aparece')) return 'El elemento carga y aparece en la página';
    if (action.includes('process') || action.includes('proceso') || action.includes('complete') || action.includes('completa')) return 'El proceso se completa dentro del tiempo esperado';
    return 'El elemento o estado esperado aparece';
  }

  if (action.includes('email')) return 'Email is received within expected timeframe';
  if (action.includes('load') || action.includes('appear')) return 'Element loads and appears on the page';
  if (action.includes('process') || action.includes('complete')) return 'Process completes within expected time';
  return 'Expected element or state appears';
}

function handleEmailAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('send') || action.includes('enviar')) return 'El correo es enviado exitosamente';
    if (action.includes('receive') || action.includes('check') || action.includes('recibir') || action.includes('revisar')) return 'El correo es recibido con el asunto y contenido correctos';
    if (action.includes('open') || action.includes('abrir')) return 'El correo se abre y el contenido se muestra';
    if (action.includes('verify') || action.includes('confirm') || action.includes('verificar') || action.includes('confirmar')) return 'El correo contiene la información esperada y los links funcionan correctamente';
    return 'La acción de correo se completa exitosamente';
  }

  if (action.includes('send')) return 'Email is sent successfully';
  if (action.includes('receive') || action.includes('check')) return 'Email is received with correct subject and content';
  if (action.includes('open')) return 'Email is opened and content is displayed';
  if (action.includes('verify') || action.includes('confirm')) return 'Email contains expected information and links work correctly';
  return 'Email action is completed successfully';
}

function handleFileAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('upload') || action.includes('subir') || action.includes('cargar')) return 'El archivo se sube exitosamente y se muestra la confirmación';
    if (action.includes('download') || action.includes('descargar')) return 'El archivo se descarga al sistema local exitosamente';
    if (action.includes('attach') || action.includes('adjuntar')) return 'El archivo se adjunta y está listo para enviarse';
    return 'La operación de archivo se completa exitosamente';
  }

  if (action.includes('upload')) return 'File is uploaded successfully and confirmation is shown';
  if (action.includes('download')) return 'File is downloaded to local system successfully';
  if (action.includes('attach')) return 'File is attached and ready for submission';
  return 'File operation completes successfully';
}

function handleScrollAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('bottom') || action.includes('abajo') || action.includes('final')) return 'La página se desplaza hasta el final y todo el contenido se carga';
    if (action.includes('top') || action.includes('arriba') || action.includes('inicio')) return 'La página se desplaza hasta el inicio';
    if (action.includes('element') || action.includes('elemento')) return 'La página se desplaza y el elemento destino es visible';
    return 'La página se desplaza y el contenido es navegable';
  }

  if (action.includes('bottom')) return 'Page scrolls to bottom and all content is loaded';
  if (action.includes('top')) return 'Page scrolls to top';
  if (action.includes('element')) return 'Page scrolls and target element is visible';
  return 'Page scrolls and content is navigable';
}

function handleSubmitAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('form') || action.includes('formulario')) return 'El formulario es enviado y la validación pasa';
    if (action.includes('save') || action.includes('guardar')) return 'Los cambios se guardan exitosamente y se muestra la confirmación';
    if (action.includes('create') || action.includes('crear')) return 'El elemento es creado exitosamente con confirmación';
    if (action.includes('update') || action.includes('actualizar')) return 'El elemento es actualizado exitosamente con confirmación';
    if (action.includes('send') || action.includes('enviar')) return 'Los datos se envían exitosamente';
    return 'El envío es exitoso y se muestra la confirmación';
  }

  if (action.includes('form')) return 'Form is submitted and validation passes';
  if (action.includes('save')) return 'Changes are saved successfully and confirmation is displayed';
  if (action.includes('create')) return 'Item is created successfully with confirmation';
  if (action.includes('update')) return 'Item is updated successfully with confirmation';
  if (action.includes('send')) return 'Data is sent successfully';
  return 'Submission is successful and confirmation is shown';
}

function handleDeleteAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('confirm') || action.includes('confirmar')) return 'El elemento es eliminado permanentemente y removido de la vista';
    if (action.includes('clear') || action.includes('limpiar')) return 'El campo o dato es limpiado exitosamente';
    return 'El elemento es eliminado y se muestra el mensaje de confirmación';
  }

  if (action.includes('confirm')) return 'Item is permanently deleted and removed from view';
  if (action.includes('clear')) return 'Field or data is cleared successfully';
  return 'Item is deleted and confirmation message is displayed';
}

function handleCloseAction(action: string, lang: Lang): string {
  if (lang === 'es') {
    if (action.includes('modal') || action.includes('popup') || action.includes('dialog') || action.includes('diálogo') || action.includes('ventana')) return 'El modal se cierra y el usuario regresa a la pantalla anterior';
    if (action.includes('notification') || action.includes('notificación')) return 'La notificación es descartada';
    return 'El elemento se cierra y es removido de la vista';
  }

  if (action.includes('modal') || action.includes('popup') || action.includes('dialog')) return 'Modal is closed and user returns to previous screen';
  if (action.includes('notification')) return 'Notification is dismissed';
  return 'Element is closed and removed from view';
}

// ========== UTILIDADES ==========

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
