## Qase Bulk Test Case Creator

Herramienta de automatización para creación masiva de test cases en Qase mediante API, diseñada para integrarse con Claude Code como asistente de diseño de pruebas.

## 🚀 Características

- ✅ Creación masiva de test cases via API de Qase
- ✅ Parser bilingüe: detecta el idioma de los steps y genera expected results en el mismo idioma
- ✅ Generación inteligente de expected results con contexto por tipo de acción
- ✅ Selección interactiva de suite con soporte de paginación (100+ suites)
- ✅ Preview y confirmación antes de crear
- ✅ Rate limiting automático
- ✅ Integración con Claude Code vía MCP (Jira, Playwright)

## 📋 Prerequisitos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta en Qase.io con API Token

## 🔧 Instalación

1. **Clonar el repositorio:**

```bash
git clone https://github.com/FalonStrada/Qase-Bulk-Test-Case-Creator.git
cd Qase-Bulk-Test-Case-Creator
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno** — crear `.env` en la raíz:

```env
QASE_API_TOKEN=tu_token_de_api_aqui
QASE_PROJECT_CODE=CODIGO_PROYECTO
```

Para obtener tu API token: Qase.io → Settings → API Tokens

4. **Preparar tu archivo de trabajo:**

```bash
cp src/bulk-create.example.ts src/bulk-create.ts
```

> `bulk-create.ts` está configurado como untracked localmente (`git update-index --skip-worktree`) — editalo libremente sin riesgo de committear test cases de proyectos específicos.

## 🤖 Flujo con Claude Code

Este proyecto incluye un `CLAUDE.md` con instrucciones para que Claude Code actúe como QA engineer senior. El flujo típico es:

1. **Pasás una US, descripción o screenshot** de la funcionalidad a testear
2. **Claude realiza un pre-análisis**: identifica supuestos, puntos ciegos, dimensiones a cubrir y aplica técnicas de diseño (equivalence partitioning, boundary value, state transition, etc.)
3. **Claude genera los test cases** en el mismo idioma de la US o screenshot, y los muestra para aprobación
4. **Una vez aprobados**, los escribe en `src/bulk-create.ts`
5. **Ejecutás `npm run bulk`** para subirlos a Qase

### Integración con MCPs

Con los MCPs de **Jira** y **Playwright** activos en Claude Code:

- **Jira MCP**: Claude puede leer tickets directamente y generar test cases a partir de los criterios de aceptación
- **Playwright MCP**: Claude puede iterar con el ambiente de prueba para validar comportamientos antes de documentarlos

## 📖 Uso manual

Editá el array `testCases` en `src/bulk-create.ts`:

```typescript
const testCases = [
  {
    title: "Verificar login con credenciales válidas",
    steps: createSteps(`
      Navegar a la página de login
      Ingresar usuario válido
      Ingresar contraseña válida
      Hacer clic en el botón iniciar sesión
      Verificar redirección al dashboard
    `),
  },
];
```

Luego ejecutá:

```bash
npm run bulk
```

## 🧠 Parser bilingüe — `createSteps()`

Detecta el idioma por los verbos de cada línea y genera el `expected_result` en ese mismo idioma. Funciona tanto si los steps vienen generados por Claude como si los escribís manualmente.

**Steps en español** → expected results en español:

```typescript
createSteps(`
  Navegar a la página de login
  Ingresar usuario válido
  Hacer clic en el botón enviar
  Verificar mensaje de error
`)
```

**Steps en inglés** → expected results en inglés:

```typescript
createSteps(`
  Navigate to login page
  Enter valid username
  Click submit button
  Verify error message is displayed
`)
```

Para casos donde el expected result necesita precisión exacta (negativos, borde, seguridad), usá el formato directo:

```typescript
steps: [
  { action: "Ingresar 256 caracteres en el campo nombre", expected_result: "El campo rechaza el input y muestra el error de límite" },
  { action: "Hacer clic en Guardar", expected_result: "El formulario no se envía" }
]
```

**Categorías reconocidas por el parser:**

| Categoría | EN | ES |
|-----------|----|----|
| Navegación | `navigate`, `open`, `go to` | `navegar`, `abrir`, `ir a` |
| Clicks | `click`, `press`, `tap` | `hacer clic`, `presionar` |
| Input | `enter`, `type`, `fill` | `ingresar`, `tipear`, `completar` |
| Verificación | `verify`, `check`, `validate` | `verificar`, `comprobar`, `validar` |
| Login/Logout | `login`, `sign in/out` | `iniciar/cerrar sesión` |
| Email | `email`, `mail` | `correo`, `mensaje` |
| Archivos | `upload`, `download`, `attach` | `subir`, `descargar`, `adjuntar` |
| Búsqueda | `search`, `filter` | `buscar`, `filtrar` |
| Submit/Guardar | `submit`, `save`, `create` | `enviar`, `guardar`, `crear` |
| Eliminar | `delete`, `remove`, `clear` | `eliminar`, `borrar`, `limpiar` |
| Scroll | `scroll`, `swipe` | `desplazar`, `deslizar` |

## 📁 Estructura del proyecto

```
Qase-Bulk-Test-Case-Creator/
├── src/
│   ├── qase-api.ts                 # API client + types
│   ├── bulk-create.ts              # Tu archivo de trabajo (untracked)
│   ├── bulk-create.example.ts      # Plantilla de referencia (trackeado)
│   └── utils/
│       ├── step-parser.ts          # Parser bilingüe con expected results inteligentes
│       ├── suite-selector.ts       # Selección interactiva de suite
│       ├── prompt.ts               # Helpers de input por consola
│       └── bulk-manager.ts         # Orquestador principal
├── CLAUDE.md                       # Instrucciones para Claude Code (untracked)
├── .env                            # Variables de entorno (no committear)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

> Archivos untracked localmente: `bulk-create.ts` y `CLAUDE.md` (`git update-index --skip-worktree`). Para volver a trackear alguno: `git update-index --no-skip-worktree <archivo>`

## 🔒 Seguridad

- Nunca commitees `.env`
- `bulk-create.ts` es untracked para evitar filtrar test cases de proyectos internos
- `CLAUDE.md` es untracked para mantener instrucciones personales fuera del repo
- No compartas tu API token públicamente

## 🚦 Rate Limiting

| Volumen | Tiempo estimado |
|---------|----------------|
| 10–100 TCs | < 10 seg |
| ~200 TCs | ~20 seg |
| 500+ TCs | Dividir en múltiples ejecuciones |

Rate limit de Qase: 600 requests/minuto.

## 🛠️ Comandos

```bash
npm run bulk   # Crear test cases en Qase
npm run dev    # Modo desarrollo
npm run build  # Compilar TypeScript
```

## 🤝 Contribuciones

Issues y PRs bienvenidos en [FalonStrada/Qase-Bulk-Test-Case-Creator](https://github.com/FalonStrada/Qase-Bulk-Test-Case-Creator).

## 📄 Licencia

MIT — Falon Strada, QA Engineer.

## 🔗 Links útiles

- [Documentación de Qase API](https://developers.qase.io/)
- [Qase.io](https://qase.io/)

---

**Nota:** Esta herramienta no está afiliada oficialmente con Qase.io.
