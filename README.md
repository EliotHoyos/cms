# CMS — Panel de Administración

<div align="center">

```
╔══════════════════════════════════════════════╗
║                                              ║
║   ██████╗ ███╗   ██╗███████╗               ║
║   ██╔══██╗████╗  ██║██╔════╝               ║
║   ██████╔╝██╔██╗ ██║███████╗               ║
║   ██╔══██╗██║╚██╗██║╚════██║               ║
║   ██║  ██║██║ ╚████║███████║               ║
║   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝               ║
║                                              ║
║        Panel de Administración               ║
║        Gestión de Clientes e Instructores    ║
║                                              ║
╚══════════════════════════════════════════════╝
```

[![Angular](https://img.shields.io/badge/Angular-21.0.3-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-21.0.2-7B1FA2?style=flat-square)](https://material.angular.dev)
[![RxJS](https://img.shields.io/badge/RxJS-7.8.2-FF6384?style=flat-square&logo=reactivex)](https://rxjs.dev)
[![License](https://img.shields.io/badge/License-MIT-28A745?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## Índice de contenido

- [Descripción del sistema](#descripción-del-sistema)
- [Arquitectura y patrones de diseño](#arquitectura-y-patrones-de-diseño)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Conexión con el backend](#conexión-con-el-backend)
- [Rutas y navegación](#rutas-y-navegación)
- [Módulos y componentes principales](#módulos-y-componentes-principales)
- [Validación de formularios](#validación-de-formularios)
- [Gestión de archivos e imágenes](#gestión-de-archivos-e-imágenes)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Configuración y ejecución](#configuración-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Comandos disponibles](#comandos-disponibles)

---

## Descripción del sistema

Este proyecto es un **panel de administración** desarrollado con Angular 21 y Angular Material. Su propósito es centralizar la gestión operativa de **clientes** e **instructores**, proporcionando una interfaz responsive y con retroalimentación en tiempo real mediante sincronización automática con el backend.

**Funcionalidades principales:**

| Módulo | Operaciones |
|---|---|
| Clientes | Listado, búsqueda filtrada, creación con foto |
| Instructores | Listado, creación, edición, activar/inactivar, publicar/despublicado |
| Dashboard | Visualización de métricas mediante gráficos (ApexCharts) |
| Autenticación | Pantallas de login y registro (pendiente de implementación en el backend) |

---

## Arquitectura y patrones de diseño

El proyecto aplica los siguientes patrones y principios arquitectónicos:

### Standalone Components
Todos los componentes de página y layout se implementan como **standalone**, eliminando la necesidad de declararlos en un `NgModule`. Esto simplifica las importaciones y mejora el tree-shaking en producción.

```
src/app/demo/pages/clients/client-list/
└── client-list.component.ts      ← standalone: true (implícito en Angular 21)
```

### Lazy Loading por ruta
Cada ruta carga su componente de forma perezosa mediante `loadComponent` o `loadChildren`, reduciendo el tamaño del bundle inicial.

```typescript
// app-routing.module.ts
{
  path: 'clients',
  loadComponent: () => import('./demo/pages/clients/client-list/client-list.component')
}
```

### Servicio como capa de acceso a datos (Repository)
Los servicios en `core/services/` encapsulan toda la lógica de comunicación HTTP. Los componentes no interactúan directamente con `HttpClient`; siempre delegan al servicio correspondiente.

```
Componente  →  ClientService  →  HttpClient  →  Backend REST
```

### Singleton por defecto
Los servicios se proporcionan en la raíz de la aplicación con `providedIn: 'root'`, garantizando una única instancia durante todo el ciclo de vida.

```typescript
@Injectable({ providedIn: 'root' })
export class ClientService { ... }
```

### Inyección por función `inject()`
En lugar del constructor tradicional, los servicios y utilidades se obtienen mediante la función `inject()` de Angular, un patrón moderno y más flexible.

```typescript
private http = inject(HttpClient);
```

### Polling silencioso para sincronización
Las listas de clientes e instructores se actualizan automáticamente cada **10 segundos** en segundo plano. Solo se refrescan los datos visibles si el backend retorna información diferente a la actual (comparación mediante `JSON.stringify`).

### Formularios Reactivos con validación dinámica
Se utiliza `FormBuilder` y `ReactiveFormsModule`. La validación del campo de documento cambia en tiempo real dependiendo de si el usuario selecciona **DNI** o **RUC**.

### Layout responsivo con BreakpointObserver
El layout principal (`AdminComponent`) observa el ancho de pantalla y conmuta el sidebar entre modo `side` (escritorio) y modo `over` (móvil/tablet) usando el breakpoint de **1024px**.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── @theme/                        # Capa de tema y layout global
│   │   ├── components/
│   │   │   └── card/                  # Componente de tarjeta reutilizable
│   │   ├── layouts/
│   │   │   ├── breadcrumb/            # Migas de pan
│   │   │   ├── footer/                # Pie de página
│   │   │   ├── menu/
│   │   │   │   └── vertical-menu/     # Sistema de menú lateral
│   │   │   └── toolbar/               # Barra superior con toggle del sidebar
│   │   ├── services/
│   │   │   └── layout.service.ts      # Estado del sidebar (Subject + Signal)
│   │   ├── types/
│   │   │   └── navigation.ts          # Interfaces del menú de navegación
│   │   └── styles/                    # SCSS de Material overrides y layouts
│   │
│   ├── core/                          # Núcleo de la aplicación
│   │   ├── models/
│   │   │   ├── client.model.ts        # Interfaces ClientResponse / ClientRequest
│   │   │   └── instructor.model.ts    # Interfaces InstructorResponse / InstructorRequest
│   │   └── services/
│   │       ├── client.service.ts      # Servicio HTTP de clientes
│   │       └── instructor.service.ts  # Servicio HTTP de instructores
│   │
│   ├── demo/
│   │   ├── data/
│   │   │   └── menu.ts                # Configuración estática del menú
│   │   ├── layout/
│   │   │   ├── admin/                 # Layout principal (sidebar + toolbar + footer)
│   │   │   └── empty/                 # Layout mínimo para pantallas de auth
│   │   ├── pages/
│   │   │   ├── auth/                  # Login y Register (lazy loaded)
│   │   │   ├── clients/               # Gestión de clientes
│   │   │   │   ├── client-list/       # Listado con panel lateral
│   │   │   │   └── client-form/       # Formulario de creación
│   │   │   ├── instructors/           # Gestión de instructores
│   │   │   │   └── instructor-list/   # Listado con CRUD completo
│   │   │   ├── dashboard/             # Dashboard con gráficos
│   │   │   └── components/            # Páginas de demo (tipografía, colores)
│   │   └── shared/
│   │       └── shared.module.ts       # Re-exporta módulos de Material y forms
│   │
│   ├── fake-data/
│   │   └── chartDB.ts                 # Datos mock para los gráficos del dashboard
│   │
│   ├── app-routing.module.ts          # Configuración de rutas raíz
│   └── app.component.ts               # Componente raíz con spinner de carga
│
├── environments/
│   ├── environment.ts                 # Configuración desarrollo
│   └── environment.prod.ts            # Configuración producción
│
├── main.ts                            # Bootstrap de la aplicación
└── styles.scss                        # Estilos globales
```

---

## Conexión con el backend

### Configuración base

La URL del backend se define en los archivos de entorno y se consume desde los servicios:

```typescript
// environments/environment.ts
export const environment = {
  appVersion: packageInfo.version,
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

El `HttpClient` se registra globalmente en el bootstrap de la aplicación:

```typescript
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule),
    provideHttpClient()
  ]
});
```

### Endpoints consumidos

| Método | Endpoint | Servicio | Descripción |
|---|---|---|---|
| `GET` | `/api/clients` | `ClientService` | Obtener todos los clientes |
| `POST` | `/api/clients` | `ClientService` | Crear cliente (multipart/form-data) |
| `GET` | `/api/instructors` | `InstructorService` | Obtener todos los instructores |
| `POST` | `/api/instructors` | `InstructorService` | Crear instructor (multipart/form-data) |
| `PUT` | `/api/instructors/:id` | `InstructorService` | Actualizar instructor |
| `PATCH` | `/api/instructors/:id/inactivar` | `InstructorService` | Inactivar instructor |
| `PATCH` | `/api/instructors/:id/publish` | `InstructorService` | Publicar instructor |
| `PATCH` | `/api/instructors/:id/unpublish` | `InstructorService` | Despublicado instructor |

### Transmisión de datos

Tanto la creación como la actualización de registros utilizan **FormData** para enviar datos junto con archivos de imagen en una sola petición `multipart/form-data`:

```typescript
createClient(client: ClientRequest): Observable<{ Succes: string }> {
  const formData = new FormData();
  formData.append('photo', client.photo);
  formData.append('name', client.name);
  // ... resto de campos
  return this.http.post<{ Succes: string }>(this.apiUrl, formData);
}
```

### Modelos de datos

**Cliente:**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `number` | Identificador único |
| `name` | `string` | Nombre |
| `last_name` | `string` | Apellido |
| `document_type` | `'DNI' \| 'RUC'` | Tipo de documento |
| `document` | `string` | Número de documento |
| `address` | `string` | Dirección |
| `cellphome` | `string` | Teléfono celular |
| `email` | `string` | Correo electrónico |
| `gender` | `string` | Género |
| `birthday` | `string` | Fecha de nacimiento |
| `photo` | `string \| File` | URL (respuesta) o archivo (petición) |

**Instructor:**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `number` | Identificador único |
| `name` | `string` | Nombre |
| `last_name` | `string` | Apellido |
| `specialty` | `string` | Especialidad |
| `belt_level` | `string` | Nivel de cinturón |
| `bio` | `string?` | Breve descripción |
| `email` | `string` | Correo electrónico |
| `phone` | `string` | Teléfono |
| `experience_years` | `number` | Años de experiencia |
| `certifications` | `string?` | Certificaciones |
| `social_media_*` | `string?` | Facebook, Instagram, Twitter |
| `status` | `'active' \| 'inactive'` | Estado del instructor |
| `is_published` | `boolean` | Visibilidad pública |
| `photo` | `string \| File` | URL (respuesta) o archivo (petición) |

---

## Rutas y navegación

La aplicación dispone de dos layouts contenedores:

- **`AdminComponent`** — layout completo con sidebar, toolbar y footer. Contiene todas las rutas principales.
- **`EmptyComponent`** — layout mínimo destinado a las pantallas de autenticación.

```
/                          → Redirige a /dashboard
/dashboard                 → Panel principal con gráficos
/clients                   → Listado de clientes
/clients/new               → Formulario de nuevo cliente
/instructors               → Listado y CRUD de instructores
/auth/login                → Pantalla de inicio de sesión
/auth/register             → Pantalla de registro
/component/typography      → Demo de tipografía
/component/color           → Demo de paleta de colores
/sample-page               → Página de ejemplo
```

---

## Módulos y componentes principales

### AdminComponent
Componente layout principal. Gestiona el sidebar responsive usando `BreakpointObserver` del CDK de Angular. Escucha los eventos de toggle emitidos por `LayoutService`.

### LayoutService
Servicio que comunica el estado del sidebar entre la barra superior (toolbar) y el layout admin. Utiliza un `Subject` para emitir eventos de toggle y un `Signal` para el estado de apertura.

### SharedModule
Módulo que centraliza la re-exportación de todos los módulos de Angular Material y de formularios utilizados en la aplicación. Cualquier componente que lo importe tiene acceso inmediato a los componentes de Material.

### ClientListComponent
- Listado filtrable de clientes con búsqueda por nombre, apellido, email y número de documento.
- Panel lateral para crear o visualizar un cliente.
- Sincronización automática cada 10 segundos.

### InstructorListComponent
- Listado completo de instructores con panel lateral multimodal (crear / ver / editar).
- Operaciones de estado: activar, inactivar, publicar, despublicado.
- Confirmaciones mediante SweetAlert2.
- Sincronización automática cada 10 segundos.

### DashboardComponent
- Visualiza métricas del sistema mediante gráficos de línea, barra y pastel.
- Datos proporcionados por `chartDB.ts` (mock data).
- Implementado con ApexCharts mediante `ng-apexcharts`.

---

## Validación de formularios

Los formularios utilizan **Reactive Forms** con validadores nativos y personalizados:

| Campo | Regla de validación |
|---|---|
| Nombre / Apellido | Obligatorio |
| Documento (DNI) | Obligatorio, patrón `/^\d{8}$/` (8 dígitos) |
| Documento (RUC) | Obligatorio, patrón `/^\d{11}$/` (11 dígitos) |
| Teléfono | Obligatorio, patrón `/^9\d{8}$/` (formato peruano) |
| Email | Obligatorio, validador `email` |
| Años experiencia | Obligatorio, mínimo 0 |

La validación del campo **documento** se actualiza dinámicamente al cambiar entre DNI y RUC mediante una suscripción a `valueChanges` del campo `document_type`.

---

## Gestión de archivos e imágenes

El flujo de subida de imágenes funciona en dos etapas:

1. **Vista previa en el cliente:** Se usa `FileReader` para generar una URL base64 y mostrar la imagen inmediatamente sin esperar la respuesta del servidor.
2. **Envío al backend:** El archivo se incluye en un objeto `FormData` junto con el resto de los campos del formulario y se envía en una petición POST o PUT.

```typescript
onFileSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result as string; };
    reader.readAsDataURL(file);
  }
}
```

Las imágenes almacenadas en el backend se sirven desde `/uploads/{nombre_archivo}`.

---

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21.0.3 | Framework principal |
| Angular Material | 21.0.2 | Componentes UI |
| Angular CDK | 21.0.2 | Breakpoints, layout utilities |
| TypeScript | 5.9.3 | Lenguaje de desarrollo |
| RxJS | 7.8.2 | Programación reactiva |
| ApexCharts / ng-apexcharts | 5.3.6 / 2.0.4 | Gráficos del dashboard |
| SweetAlert2 | 11.26.18 | Dialógos de confirmación |
| ngx-scrollbar | 18.0.0 | Scrollbar personalizado |
| SCSS | — | Estilos con preprocesador |

---

## Configuración y ejecución

### Requisitos previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- **Angular CLI** instalado globalmente (`npm install -g @angular/cli`)
- Backend disponible en `http://localhost:8080`

### Instalación

```bash
npm install
```

### Ejecución en desarrollo

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

### Compilación para producción

```bash
npm run build
```

El bundle de salida se genera en la carpeta `dist/` con `base-href` configurado en `/angular/free/`.

---

## Variables de entorno

| Variable | Desarrollo | Producción |
|---|---|---|
| `production` | `false` | `true` |
| `apiUrl` | `http://localhost:8080/api` | `http://localhost:8080/api` |
| `appVersion` | Se lee de `package.json` | Se lee de `package.json` |

Para modificar la URL del backend en producción, editar `src/environments/environment.prod.ts` antes de compilar.

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run watch` | Compilación continua en modo desarrollo |
| `npm test` | Ejecuta las pruebas unitarias |
| `npm run lint` | Analiza el código con ESLint |
| `npm run lint:fix` | Corrige automáticamente errores de lint |
| `npm run prettier` | Formatea el código fuente |
