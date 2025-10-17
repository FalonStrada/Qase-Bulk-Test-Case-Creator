## Qase Bulk Test Case Creator

Herramienta de automatización para creación masiva de test cases en Qase mediante API, desarrollada para agilizar el proceso de documentación de pruebas.

## 🚀 Características

- ✅ Creación masiva de test cases (bulk creation)
- ✅ Conversión automática de steps en formato natural a JSON
- ✅ Generación inteligente de expected results
- ✅ Rate limiting automático para evitar problemas con la API
- ✅ Type safety con TypeScript
- ✅ Configuración mediante variables de entorno

## 📋 Prerequisitos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta en Qase.io
- API Token de Qase

## 🔧 Instalación

1. **Clonar el repositorio:**

```bash
git clone https://github.com/tu-usuario/qase-bulk-automation.git
cd qase-bulk-automation
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

Crear un archivo `.env` en la raíz del proyecto:

```env
QASE_API_TOKEN=tu_token_de_api_aqui
QASE_PROJECT_CODE=CODIGO_PROYECTO
```

Para obtener tu API token:

- Ve a Qase.io → Settings → API Tokens
- Genera un nuevo token y cópialo

## 📖 Uso

### Creación básica de test cases

1. Abre el archivo `src/bulk-create.ts`

2. Edita el array `testCases` con tus casos de prueba:

```typescript
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
];
```

3. Ejecuta el script:

```bash
npm run bulk
```

4. Selecciona la carpeta de destino:

📁 Selección de carpeta (Suite)

Carpetas disponibles:

1. Login Feature (3 test cases)
2. Regression (0 test cases)
3. Crear nueva carpeta
4. No usar carpeta (root level)

Elegí una opción: ...

5. Confirmar creación

## 🤖 Generación automática de Expected Results

La función `createSteps()` genera automáticamente los expected results basándose en palabras clave:

- **"navigate", "open"** → "Page is displayed"
- **"click"** → "Element is clicked and action performed"
- **"enter", "type"** → "Data is entered correctly"
- **"verify"** → "[condición] is correct"
- **Por defecto** → "Step completed successfully"

## 📁 Estructura del proyecto

```bash
qase-bulk-automation
├── src/
│   ├── qase-api.ts             # API client
│   ├── bulk-create.ts          # Script principal de creación de TC
│   └── utils/
│       ├── step-parser.ts      # Autogenerador de Expected results
│       ├── suite-selector.ts
│       ├── prompt.ts
│       └── bulk-manager.ts
├── .env                        # Variables de entorno (no commitear)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md


```

## 🔒 Seguridad

**IMPORTANTE:**

- Nunca commitees el archivo `.env` a Git
- El `.gitignore` está configurado para excluirlo automáticamente
- No compartas tu API token públicamente

## 🚦 Rate Limiting

La herramienta incluye un delay de 100ms entre cada request para respetar los límites de la API de Qase:

- Máximo recomendado: 10 requests/segundo
- Para grandes volúmenes (500+ tests), considera dividir en múltiples ejecuciones

## 🛠️ Desarrollo

### Compilar TypeScript:

```bash
npm run build
```

### Ejecutar en modo desarrollo:

```bash
npm run dev
```

## 📝 Ejemplos

### Crear tests de login:

```typescript
const loginTests = [
  {
    title: "Login con credenciales válidas",
    steps: createSteps(`
      Abrir página de login
      Ingresar usuario válido
      Ingresar contraseña válida
      Click en botón login
      Verificar redirección a dashboard
    `),
  },
  {
    title: "Login con password incorrecto",
    steps: createSteps(`
      Abrir página de login
      Ingresar usuario válido
      Ingresar contraseña inválida
      Click en botón login
      Verificar mensaje de error
    `),
  },
];
```

### Crear tests de API:

```typescript
const apiTests = [
  {
    title: "GET /users endpoint returns 200",
    steps: createSteps(`
      Send GET request to /users endpoint
      Verify response status is 200
      Verify response contains user array
    `),
  },
];
```

## 🤝 Contribuciones

Si encontrás bugs o tenés sugerencias, creá un issue o pull request.

## 📄 Licencia

MIT

## 👤 Autor

Falon Strada QA Engineer - Automatización de procesos de testing

## 🔗 Links útiles

- [Documentación de Qase API](https://developers.qase.io/)
- [Qase.io](https://qase.io/)

---

**Nota:** Esta herramienta fue desarrollada para uso interno del equipo de QA y no está afiliada oficialmente con Qase.io.
