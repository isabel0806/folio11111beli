# Folio

Sistema de gestión para estudios de arquitectura — proyectos, honorarios, cronograma de obra y portal del cliente, con la identidad editorial de la marca **Folio**.

Reinterpretación en código del diseño _Folio v2_ (Paper): 25 pantallas, un flujo completo de principio a fin.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **@tabler/icons-react** · **date-fns**
- Datos de ejemplo (`src/lib/mock-data.ts`) — sin backend ni base de datos

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de producción
npm run start   # servir el build
```

## Pantallas principales

- **Inicio** — resumen del estudio: alertas, proyectos activos, próximos eventos.
- **Proyectos** — listado + detalle con sub-tabs: Archivos, Control (Kanban / Lista / **Gantt con zoom Día·Semana·Mes·Trimestre**), Presupuesto, Bitácora, Documentación, Finanzas, Equipo, Configuración.
- **Finanzas** — flujo de fondos, historial mensual interactivo, historial de precios y **facturación electrónica con ARCA** (CAE simulado).
- **Agenda** — vistas Mes / Semana / Día.
- **Cronograma maestro** — Gantt multi-proyecto del estudio con zoom Mes·Trimestre·Semestre·Año.
- **Estudio · Ajustes · Portada / índice**.
- **Vistas públicas para el cliente** (sin login):
  - **Portal del cliente** (`/portal/[id]`) — avance de obra, aprobación de planos, pago, descargas.
  - **Presupuesto público** (`/presupuesto/[id]`) — presupuesto detallado con IVA y honorarios, compartible por link.

## Deploy en Vercel

El proyecto es Next.js _zero-config_ y **no usa variables de entorno**.

1. Entrá a [vercel.com/new](https://vercel.com/new) e ingresá con GitHub.
2. **Import** del repositorio `isabel0806/folio11111beli`.
3. Vercel detecta Next.js automáticamente → **Deploy**.
4. Verificá que la _Production Branch_ sea **`main`** (GitHub → Settings → Branches, o Vercel → Settings → Git).

Cada push a `main` genera un redeploy automático. Para trabajar sin afectar producción, usá otra branch y mergeá a `main` al publicar.

## Notas de la demo

Esta versión funciona sin servidor, así que algunas piezas son simuladas:

- **Compartir presupuesto / portal**: el dato viaja en `localStorage` y codificado en la URL — funciona online, pero es por navegador/dispositivo.
- **ARCA**: genera el comprobante y el CAE localmente; no se conecta al web service real de facturación (WSFE).
- **Pagos**: se informan manualmente (transferencia); no hay pasarela de pago.
- **Sin autenticación ni persistencia real**: los datos se reinician al recargar.

Para un producto multiusuario real haría falta backend (auth, base de datos, integración WSFE de ARCA y pasarela de pagos).
