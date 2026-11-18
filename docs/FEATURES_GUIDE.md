# Guia de Funcionalidades y Manual Operativo B2B · TrazAmazon

Este documento consolida la arquitectura funcional, el manual de usuario para cooperativas productoras y compradores corporativos, y el registro de iteraciones de **TrazAmazon**.

---

## 1. Manual de Operacion para Cooperativas Productoras

### A. Gestion y Publicacion de Cosechas
Las cooperativas pueden gestionar su catalogo en `/panel` (seccion *Gestion de Lotes & Fotos*):
- **Crear Nueva Cosecha**: Permite registrar un lote especificando fruto (Cacao, Cafe, Castana, Aguaje, Copoazu), stock inicial, tiempo estimado a puerto y empaque de exportacion.
- **Editar Ficha en Vivo estilo WordPress**: Al pulsar *"Editar Ficha en Vivo"*, el sistema abre la URL `/lote/:id?edit=true` con una barra superior fija de administracion.
  - La cooperativa puede modificar titulo, tabla de precios escalonados (500-2,000 kg, 2,001-10,000 kg, >=10,000 kg FCL) y parametros de laboratorio directamente en el layout real.
  - Se ofrecen chips de sugerencia tecnica para humedad (< 7.5%), fermentacion (> 80%), cadmio (< 0.28 ppm UE 488) y puntaje SCAA (> 85 pts).
  - Al pulsar *"Guardar y Publicar"*, los cambios se persisten inmediatamente en el catalogo.

### B. Selector de Estructura de Ficha (Layout Templates)
Desde la barra superior de WordPress, la cooperativa puede elegir entre 3 estructuras:
1. **Canopy Grid**: Enfoque tecnico con galeria de 4 fotos, ficha simetrica de laboratorio y mapa interactivo.
2. **Storytelling Biocultural**: Portada panoramica de alta resolucion, relato del bosque en tipografia destacada y panel lateral pegajoso de precios.
3. **Trading B2B & Logistica**: Terminal de comercio mayorista con tabla de fletes (fluvial, terrestre refrigerado, maritimo Maersk/Hapag) a Callao, Rotterdam y Le Havre.

### C. Galeria Multi-Foto y Visor Lightbox
- Cada cosecha incluye una galeria de 4 fotos representativas.
- Al hacer clic en cualquier imagen, se abre el visor Lightbox en pantalla completa para inspeccionar grano, parcelas y acopio.
- En modo edicion, se pueden subir nuevas fotografias o ingresar URLs publicas.

### D. Gobernanza Territorial Auditada
- Los datos de dirigentes, pueblo originario (ej: *Pueblo Amahuaca*) y lengua indigena (*Pano*) estan vinculados al perfil institucional de la cooperativa y bloqueados a nivel de lote.
- Esto garantiza coherencia institucional en todas las cosechas del mismo productor.

---

## 2. Manual para Compradores Corporativos B2B

### A. Exploracion y Filtros en Marketplace
En `/marketplace`, los compradores internacionales pueden explorar lotes auditados filtrando por:
- Variedad y especie nativa.
- Region amazonica (Madre de Dios, Ucayali, San Martin, Puno).
- Puntaje de cata SCAA y certificaciones internacionales.
- Poligonos Sentinel-2 con cero deforestacion demostrable.

### B. Muestreo y Cotizacion Directa
Al seleccionar *"Solicitar Muestra (500g)"* o *"Solicitar Cotizacion Formal"*:
- Se abre un dialogo con la cooperativa verificada.
- Se precarga un mensaje formal editable solicitando precinto SENASA y guia DHL Green Express.
- Al confirmar, se genera la orden en el sistema y se abre de inmediato el chat B2B con la cooperativa para afinar detalles logísticos.

### C. Garantia Comercial Escrow
- Todos los pagos quedan custodiados en una cuenta fiduciaria bancaria segura.
- Los fondos solo se liberan a la cooperativa cuando el courier DHL o la naviera confirma el conocimiento de embarque (BL) con precinto fitosanitario oficial validado.

---

## 3. Asistente RAG Lorra IA
- Ubicado en la esquina inferior derecha de todas las pantallas.
- Responde dudas en tiempo real sobre parametros de laboratorio, disponibilidad de stock, normativas europeas EUDR (UE 2023/1115), rutas de despacho y estado de pedidos.
