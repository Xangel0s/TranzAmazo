# DOCUMENTO MAESTRO DE ARQUITECTURA Y ESPECIFICACIÓN — PROYECTO TRAZAMAZON
# Impact Startup Competition 2027 | Desafío: Amazonía Viva

---

## 1. Visión General del Proyecto
**TrazAmazon** es un ecosistema digital de doble vía diseñado para resolver la exclusión tecnológica y regulatoria de los pequeños productores y cooperativas de la Amazonía (cacao, café, castaña, aguaje). Permite registrar trazabilidad ambiental sin internet en parcela, comercializar cosechas a escala global mediante un modelo B2B (tipo Alibaba) impulsado por acreditación de cero deforestación, y activar rutas de agroturismo vivencial como estrategia de marketing y diversificación de ingresos.

---

## 2. Requerimientos de UI/UX y Vistas Principales

### Paleta de Colores e Identidad Visual
- **Primario Verde Esmeralda Selva**: `#1B4332` / `#2D6A4F`
- **Acentos Tierra y Ámbar Cacao**: `#B07D3B` / `#D4A373`
- **Fondos Claros y Naturales**: `#F9F7F2` / `#FAF6F0` / `#FFFFFF`
- **Estilo**: Ultra moderno, limpio, con micro-interacciones sutiles (Framer Motion / Lucide Icons).

### Componente de Navegación Global
Barra o componente flotante superior persistente para alternar fácilmente entre las vistas principales del prototipo:
1. **Landing Page Inicial y Marketplace Web** (`/` o `/marketplace`)
2. **Visor de Detalle por Código QR** (`/lote/[id]`)
3. **App Móvil de Campo Offline-First** (`/app`)
4. **Ruta de Agroturismo Vivencial**

---

### Módulos y Especificación de Vistas

#### 1. LANDING PAGE INICIAL Y MARKETPLACE WEB (`/` y `/marketplace`)
- **Navbar Superior**: Logo "TrazAmazon", enlaces a "Inicio", "Marketplace B2B", "Visor QR" y "Ruta Agroturismo".
- **Buscador y Filtros**:
  - Buscador textual en tiempo real (por nombre de producto, cooperativa o región).
  - Filtro por tipo de fruto: Cacao, Café, Castaña, Aguaje.
  - Filtro por región amazónica (Madre de Dios, Puno, Loreto, Ucayali, San Martín).
  - Toggle de certificación ambiental "Cero Deforestación".
- **Grid de Productos Amazónicos**:
  - Fotografía de alta fidelidad de la cosecha.
  - Cooperativa u organización de origen.
  - Precio por volumen unitario (USD/kg) y pedido mínimo.
  - Sellos de acreditación ambiental verificada.
  - Botón interactivo "Solicitar Cotización / Ver Trazabilidad".
- **Sección de Impacto Social y Ambiental**:
  - Métricas de ODS vinculados (ODS 1, 5, 8, 12, 13, 15).
  - Explicación del modelo de Bioeconomía circular y conservación de bosques en pie.

#### 2. VISTA DE DETALLE / VISOR POR CÓDIGO QR (`/lote/[id]`)
- **Ficha Técnica del Lote**:
  - Código único de lote y fecha exacta de cosecha.
  - Perfil de la familia productora con fotografía real, ubicación e insignias verificadas.
- **Mapa Satelital de Parcela**:
  - Componente visual estilizado con vista satelital/aérea de la parcela y polígono georreferenciado.
  - Coordenadas geográficas y radio de monitoreo de no-deforestación.
- **Sección "Ruta TrazAmazon: Vive la experiencia en nuestra comunidad"**:
  - Galería fotográfica de agroturismo vivencial.
  - Beneficios directos para la comunidad local.
  - Formulario modal funcional para "Reservar Agroturismo Vivencial" con confirmación interactiva.

#### 3. VISTA MÓVIL - APP DE CAMPO OFFLINE-FIRST (`/app`)
- **Header y Estado de Conectividad**:
  - Indicador en tiempo real con switch/toggle manual de simulación:
    - `🟢 Sincronizado`
    - `🟡 X lotes pendientes en caché local`
    - `🔴 Sin conexión`
- **Acción Rápida Destacada**:
  - Botón grande **"➕ Nuevo Registro en Parcela"**.
- **Formulario Modal Interactivo de Cosecha**:
  - Tipo de fruto (Cacao, Café, Castaña, Aguaje).
  - Peso estimado en kg.
  - Selector de coordenadas GPS (con botón de auto-captura simulada de precisión).
  - Selector y preview de fotografía de cosecha.
  - Al guardar: persistencia inmediata en la cola de almacenamiento local (IndexedDB / Dexie.js o caché).
- **Lista de Lotes Locales en Caché**:
  - Barra de estado de sincronización visual.
  - Botón interactivo para simular la subida a la nube (Supabase Cloud).
- **Tarjeta de Perfil de Productor**:
  - Datos del productor y su insignia digital "Cero Deforestación TrazAmazon".
- **Contenedor Responsive**:
  - En pantallas de escritorio, se presenta dentro de un marco simulador de smartphone estilizado con controles de estado.

---

## 3. Arquitectura Tecnológica y Stack
- **Frontend / Web / PWA**: Next.js (App Router) / React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Almacenamiento Local (Offline)**: Dexie.js (Wrapper tipado de IndexedDB) para guardar lotes en campo sin señal con cola de sincronización transaccional.
- **Sincronización P2P Offline Alternativa**: Generación y escaneo de Códigos QR con payload JSON comprimido (para transferencia directa entre dispositivos sin red).
- **Backend & Base de Datos**: Supabase Cloud (PostgreSQL + PostGIS para gestión geoespacial de polígonos de parcelas y Supabase Storage para compresión de imágenes de cosechas).
- **Infraestructura de Soporte**: Despliegue en Vercel (Web/PWA) y contenedores Docker para nodos locales de prueba.

---

## 4. Módulos y Flujos del Sistema
1. **Módulo Mobile Offline**: Captura de coordenadas GPS, datos de cosecha y fotos comprimidas en campo con almacenamiento local en Dexie.js y estado `pending`.
2. **Módulo de Sincronización**: Al detectar conectividad (`navigator.onLine`), volcado automático de lotes hacia Supabase PostgreSQL, generación de hash/código QR único y actualización de estado a `synced`.
3. **Marketplace B2B (Web)**: Vitrina comercial para compradores internacionales y mayoristas con filtros de región, volumen y acreditación ambiental TrazAmazon.
4. **Visor Público QR (Web)**: Ruta dinámica `/lote/[codigo]` que despliega el expediente de la cosecha, mapa de la parcela y validación de cero deforestación.
5. **Módulo de Agroturismo (Web)**: Sección integrada de marketing y reservas para conectar al consumidor final con las comunidades productoras locales.

---

## 5. Instrucción Operativa para el Equipo
Actuar como Arquitecto de Software y Desarrollador Full-Stack líder para el proyecto TrazAmazon. El objetivo es estructurar, programar y mantener la coherencia técnica de todo el monorepo (Next.js/React + Supabase + Dexie). Validar esquemas de datos geoespaciales en PostGIS, optimizar la compresión de imágenes en el cliente antes de guardar en IndexedDB, y mantener limpios los componentes UI para el despliegue del MVP en las 3 semanas de la competencia Impact Startup Competition 2027.
