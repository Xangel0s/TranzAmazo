# TrazAmazon

> Plataforma de Trazabilidad Agroforestal Offline-First, Marketplace B2B con Garantia Escrow y Rutas de Agroturismo Vivencial para la Cuenca Amazonica.
> Proyecto desarrollado para la Impact Startup Competition 2027 | Desafio: Amazonia Viva.

---

## 1. Vision General del Proyecto

**TrazAmazon** conecta a las cooperativas agrarias e indigenas de la cuenca amazonica (Madre de Dios, Ucayali, San Martin, Puno) con tostadores, chocolateros y compradores corporativos internacionales (Francia, Alemania, Belgica, Paises Bajos, EE. UU.).

La plataforma combina tres pilares fundamentales:
1. **App de Campo PWA (Offline-First)**: Registro de parcelas y acopio en selva profunda sin cobertura celular, con captura de coordenadas NMEA y sincronizacion automatica cuando se recupera conectividad.
2. **Marketplace B2B Mayorista & Workbench Operativo (`/panel`)**: Sistema comercial completo con precios escalonados por volumen, custodia de pagos en garantia fiduciaria Escrow, cotizaciones RFQ interactivas y bandeja de mensajeria directa.
3. **Validacion Satelital EUDR (Reglamento UE 2023/1115)**: Auditoria geoespacial en tiempo real con imagenes de satelite Sentinel-2 (ESA) y bases de datos PostGIS, certificando cero perdida de cobertura boscosa desde la fecha de corte regulatoria del 31 de diciembre de 2020.

---

## 2. Modulos y Caracteristicas Clave

### A. Editor de Cosechas en Vivo Estilo WordPress (`/lote/:id?edit=true`)
- **Barra Superior Fija de Administracion (`.wordpress-admin-bar`)**:
  - Control de estado de la ficha, alternancia instantanea entre *"Modo Edicion"* y *"Ver como Comprador"*, boton *"Guardar y Publicar"* con confirmacion toast y retorno directo al panel.
- **Edicion In-Situ sobre el Diseno Real**:
  - Edicion directa de titulo, precios mayoristas escalonados (Tiers 1, 2 y 3), pedido minimo (MOQ), stock disponible y parametros de cata en el layout publico del producto.
- **Ficha Tecnica de Laboratorio & Guia Contextual**:
  - Campos tecnicos para humedad final, fermentacion, altitud, cadmio (< 0.28 ppm UE 488) y puntaje SCAA, con chips de sugerencia rapida del sector para auto-completar valores optimos de exportacion.
- **Gobernanza Territorial Protegida**:
  - Los datos de dirigentes comunitarios, pueblo originario (ej: *Pueblo Amahuaca*) y lengua ancestral (*Pano*) estan vinculados al perfil institucional de la cooperativa y protegidos contra ediciones accidentales por lote.

### B. Galeria Multi-Foto con Visor Lightbox Pantalla Completa
- Soporte para multiples fotos por cosecha (grano seco en mallas, mazorcas en arbol, parcela bajo dosel y acopio en sacos GrainPro).
- Visor modal Lightbox (`HarvestLightboxModal`) con navegacion continua `<` y `>`, indicador numerico, tira de miniaturas inferior y soporte para atajos de teclado (flechas y Escape).

### C. Tres Estructuras Dinamicas de Diseno de Ficha (Layout Templates)
1. **Canopy Grid (Tecnico & Balanceado)**: Hero 5/7 con miniaturas interactivas, tabla de precios escalonados, 6 tarjetas simetricas de control fisico-quimico y radar satelital PostGIS.
2. **Storytelling Biocultural (Editorial & Terroir Inmersivo)**: Portada panoramica cinematografica de impacto visual, relato sobre el bosque primario en el centro y panel lateral pegajoso (*sticky*) de cotizacion.
3. **Trading B2B & Logistica (Comercio Mayorista & Contenedores FCL)**: Ficha de terminal comercial con tabla de tramos fluviales, terrestres y maritimos a Callao, Le Havre y Rotterdam, calculo de fletes y ahorro por contenedor FCL (-14%).
- Conmutador en tiempo real desde la barra de WordPress para alternar y guardar la estructura preferida.

### D. Lorra IA · Asistente Flotante RAG
- Chatbot en esquina inferior derecha con avatar del lorito amazonico (*Curichaco / Loro Verde B2B*).
- Motor de recuperacion RAG con datos en vivo sobre cosechas, precios FOB, trazabilidad fitosanitaria (precintos SENASA y guias DHL Green Express), custodia Escrow y normativa europea EUDR.
- Chips de consultas frecuentes con respuestas inmediatas.

### E. Muestreo B2B Directo hacia Chat con el Vendedor
- Sustitucion de formularios genericos por un canal de negociacion directa:
  - Muestra la cooperativa vendedora con su sello de *Vendedor Verificado*.
  - Selector entre Muestra Tecnica (500g) o Cotizacion por Volumen.
  - Mensaje profesional precargado y editable.
  - Envio directo a la bandeja de mensajes en `/panel` para negociar en tiempo real.

---

## 3. Arquitectura del Monorepo

El proyecto esta organizado bajo una arquitectura de monorepo gestionada con `pnpm`:

```
TrazAmazon/
├── artifacts/
│   ├── trazamazon/         # Frontend Web & PWA (React 18, Vite, Tailwind CSS, Lucide, Framer Motion)
│   ├── api-server/         # Servidor backend Express API
│   └── mockup-sandbox/     # Entorno aislado para pruebas UI
├── lib/
│   ├── api-client-react/   # Hooks generados de React Query (Orval)
│   ├── api-spec/           # Especificacion OpenAPI y configuracion codegen
│   ├── api-zod/            # Esquemas de validacion Zod
│   └── db/                 # Esquemas y migraciones de Drizzle ORM (PostgreSQL/Supabase)
├── docs/                   # Documentacion tecnica y de producto
├── ARCHITECTURE.md         # Documento maestro de arquitectura tecnica
├── AGENTS.md               # Normas y convenciones para desarrolladores y agentes IA
└── package.json            # Configuracion raiz del workspace
```

---

## 4. Instalacion y Ejecucion Local

### Requisitos Previos
- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Pasos de Instalacion

1. Clonar el repositorio:
```bash
git clone https://github.com/Xangel0s/TranzAmazo.git
cd TranzAmazo
```

2. Instalar dependencias del workspace:
```bash
pnpm install
```

3. Iniciar el servidor de desarrollo del Frontend:
```bash
pnpm --filter @workspace/trazamazon run dev
```
La aplicacion estara disponible en `http://localhost:5173/`.

4. Ejecutar verificacion de tipos TypeScript:
```bash
pnpm run typecheck
```

5. Compilar para produccion:
```bash
pnpm --filter @workspace/trazamazon run build
```

---

## 5. Rutas Principales de la Aplicacion

| Ruta | Descripcion |
| :--- | :--- |
| `/` | Landing page principal con propuesta de valor y metricas de impacto. |
| `/marketplace` | Catalogo mayorista B2B con filtros por region, fruto y acreditaciones EUDR. |
| `/lote/:id` | Ficha tecnica publica de la cosecha con trazabilidad satelital y galeria. |
| `/lote/:id?edit=true` | Editor en vivo estilo WordPress con barra fija superior y diseno in-situ. |
| `/panel` | Workbench B2B para Cooperativas y Compradores (KPIs, Lotes, Bandeja RFQ y Perfil). |
| `/agroturismo` | Portal de rutas vivenciales agroforestales y bioeconomia. |
| `/app` | Portal informativo de la aplicacion de campo offline-first. |

---

## 6. Estandares de Calidad y Codigo

- **SOLID, DRY & KISS**: Arquitectura modular con separacion clara de responsabilidades.
- **Politica Estricta de 0 Emojis**: Comunicacion e interfaz sobria orientada al comercio corporativo internacional.
- **Cumplimiento EUDR**: Alineado con el Reglamento UE 2023/1115 de Cero Deforestacion.
- **Trazabilidad Inmutable**: Registro de hashes PostGIS y sellos fitosanitarios SENASA.

---

*TrazAmazon · Impact Startup Competition 2027 · Amazonia Viva*
