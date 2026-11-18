import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Cloud, CloudOff, CloudUpload,
  Coffee, Compass, Download, Eye, FileText, Filter, Globe2, Handshake, Heart, Info,
  Layers, LayoutGrid, Leaf, List, LocateFixed, MapPin, Menu, Minus, PackageCheck,
  Plus, QrCode, RefreshCw, Search, Send, ShieldCheck, Ship, SlidersHorizontal,
  Smartphone, Sprout, TreePine, Truck, Upload, Wifi, WifiOff, X
} from 'lucide-react';

const queryClient = new QueryClient();

/**
 * Entidad de Lote de Producto Agrícola Mayorista B2B
 */
export type ProductLot = {
  id: string;
  fruit: 'Cacao' | 'Café' | 'Castaña' | 'Aguaje' | 'Copoazú';
  name: string;
  cooperative: string;
  region: string;
  community: string;
  priceFob: number;
  unit: string;
  minimumMoq: string;
  availableKg: number;
  totalKg: number;
  dispatchStatus: string;
  harvestTag: string;
  certifications: string[];
  image: string;
  harvestDate: string;
  farmerName: string;
  farmerImage: string;
  coordinates: string;
  sensoryScore: string;
  specs: {
    k1: string; v1: string;
    k2: string; v2: string;
    k3: string; v3: string;
  };
  sensoryNotes: string;
  story: string;
  ndviScore: number;
  lotHash: string;
};

/**
 * Registro de Cosecha Almacenado en Caché Local (Offline-first)
 */
export type LocalHarvestRecord = {
  id: string;
  fruit: string;
  estimatedKg: number;
  coordinates: string;
  photoPreview: string;
  createdAt: string;
  syncStatus: 'pending' | 'synced';
  cloudHash?: string;
};

/**
 * Catálogo Maestro B2B de Cosechas Vivas (Canopy & Provenance)
 */
export const initialLots: ProductLot[] = [
  {
    id: 'TA-0427',
    fruit: 'Cacao',
    name: 'Cacao Nativo Criollo de Aroma Fino',
    cooperative: 'Asociación Bosque Vivo',
    community: 'Boca Pariamanu · Pueblo Amahuaca',
    region: 'Madre de Dios',
    priceFob: 8.40,
    unit: 'USD / kg FOB Callao',
    minimumMoq: 'MOQ: 500 kg (Sacos GrainPro 60kg)',
    availableKg: 1800,
    totalKg: 3200,
    dispatchStatus: 'Listo en Puerto',
    harvestTag: 'Cosecha Mayo 2025',
    certifications: ['Cero Deforestación', 'QR Satelital', 'Criollo Nativo'],
    image: `${import.meta.env.BASE_URL}amazon-cacao-hero.jpg`,
    harvestDate: '18 May 2025',
    farmerName: 'María Quispe',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-illustration.jpg`,
    coordinates: "12° 28' S, 69° 12' W",
    sensoryScore: '88 Pts SCAA',
    specs: {
      k1: 'Humedad', v1: '6.8%',
      k2: 'Fermentación', v2: '84%',
      k3: 'Altitud', v3: '260 msnm'
    },
    sensoryNotes: 'Cacao profundo, notas de frutos rojos secos, panela de caña y jazmín silvestre.',
    story: 'Cultivado bajo dosel primario de castañales y shihuahuacos en Pariamanu. Fermentado en cajones de madera nativa que acentúan notas florales y frutales.',
    ndviScore: 0.89,
    lotHash: '0x7e4a18f9c21b38e0'
  },
  {
    id: 'TA-0319',
    fruit: 'Café',
    name: 'Café de Sombra Altura · Lavado Anaeróbico',
    cooperative: 'Coop. Agraria Cafetalera San Juan del Oro',
    community: 'Alto Tambopata · Valle de Sandia',
    region: 'Puno',
    priceFob: 11.20,
    unit: 'USD / kg FOB Callao',
    minimumMoq: 'MOQ: 300 kg (Sacos de yute con GrainPro)',
    availableKg: 2100,
    totalKg: 4500,
    dispatchStatus: 'Almacén Lima',
    harvestTag: 'Disponible',
    certifications: ['Geisha & Typica', 'Orgánico USDA/EU', 'Lavado 48h'],
    image: `${import.meta.env.BASE_URL}coffee.jpg`,
    harvestDate: '02 Jun 2025',
    farmerName: 'Luis Mamani',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-illustration.jpg`,
    coordinates: "14° 19' S, 69° 25' W",
    sensoryScore: '87.5 Pts SCA',
    specs: {
      k1: 'Altitud', v1: '1,750 msnm',
      k2: 'Humedad', v2: '10.5%',
      k3: 'Proceso', v3: 'Bajo dosel'
    },
    sensoryNotes: 'Flor de azahar, mandarina andina madura, caña dulce y miel de abeja melipona nativa.',
    story: 'Madurado lentamente bajo sombra de árboles nativos de pacae y nogal en las laderas de Sandia. Cosechado a mano grano por grano.',
    ndviScore: 0.92,
    lotHash: '0x3c9d74a10e82f5b6'
  },
  {
    id: 'TA-0186',
    fruit: 'Castaña',
    name: 'Castaña Amazónica Silvestre Pelada',
    cooperative: 'Madre de Dios Castañeros',
    community: 'Cuenca del Río Las Piedras · Tahuamanu',
    region: 'Madre de Dios',
    priceFob: 6.75,
    unit: 'USD / kg FOB Callao',
    minimumMoq: 'MOQ: 250 kg (Cajas al vacío 20kg con N2)',
    availableKg: 4500,
    totalKg: 8000,
    dispatchStatus: 'Despacho Inmediato',
    harvestTag: '100% Silvestre',
    certifications: ['Aflatoxinas < 2 ppb', 'Comercio Ético', 'Selección Manual'],
    image: `${import.meta.env.BASE_URL}nuts.jpg`,
    harvestDate: '11 Abr 2025',
    farmerName: 'Elena Huamán',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-portrait.jpg`,
    coordinates: "11° 45' S, 69° 40' W",
    sensoryScore: '2,400 Árboles GPS',
    specs: {
      k1: 'Calibre', v1: 'Med/Lrg (90-110)',
      k2: 'Humedad', v2: '4.2%',
      k3: 'Empaque', v3: 'Vacío N2'
    },
    sensoryNotes: 'Textura crocante, sabor mantecoso puro, sin amargor. Altamente rica en selenio orgánico natural.',
    story: 'Recolectada en concesiones familiares de bosque primario sin tala. Cada coco cae naturalmente de los árboles de Bertholletia excelsa.',
    ndviScore: 0.95,
    lotHash: '0x992b41f802ca3e77'
  },
  {
    id: 'TA-0512',
    fruit: 'Copoazú',
    name: 'Copoazú Silvestre Deshidratado en Frío',
    cooperative: 'Familias Guardianas de Palma Real',
    community: 'Comunidad Palma Real · Pueblo Ese Eja',
    region: 'Madre de Dios',
    priceFob: 14.50,
    unit: 'USD / kg FOB Callao',
    minimumMoq: 'MOQ: 100 kg (Bolsas barrera aluminizada 5kg)',
    availableKg: 800,
    totalKg: 1500,
    dispatchStatus: 'Despacho 72h',
    harvestTag: 'Superfruto',
    certifications: ['Liofilizado en frío', 'Pueblo Ese Eja', 'Sin Azúcar'],
    image: `${import.meta.env.BASE_URL}amazon-parcel-map.jpg`,
    harvestDate: '04 May 2025',
    farmerName: 'Mateo Mishaja',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-portrait.jpg`,
    coordinates: "12° 34' S, 69° 01' W",
    sensoryScore: 'Polifenoles 1,420mg',
    specs: {
      k1: 'Formato', v1: 'Hojuelas',
      k2: 'Humedad', v2: '3.5%',
      k3: 'Grado', v3: 'Nutracéutico'
    },
    sensoryNotes: 'Sabor cítrico frutal único similar al cacao blanco con notas de piña silvestre y maracuyá.',
    story: 'Cosechado en el sotobosque amazónico por familias Ese Eja. Liofilizado a baja temperatura para preservar bioactivos.',
    ndviScore: 0.94,
    lotHash: '0x44c1a78e129b803f'
  },
  {
    id: 'TA-0244',
    fruit: 'Cacao',
    name: 'Cacao Chuncho Nativo de Selva Alta',
    cooperative: 'Red de Productores Chuncho Ancestral',
    community: 'Quillabamba · Valle Urubamba',
    region: 'Cusco',
    priceFob: 16.00,
    unit: 'USD / kg FOB Callao',
    minimumMoq: 'MOQ: 100 kg (Cajas especiales herméticas 25kg)',
    availableKg: 400,
    totalKg: 950,
    dispatchStatus: 'Últimos sacos',
    harvestTag: 'Rare Reserve',
    certifications: ['Genética Pura Chuncho', 'Microlote', 'Cajón Laurel'],
    image: `${import.meta.env.BASE_URL}amazon-cacao-hero.jpg`,
    harvestDate: '15 May 2025',
    farmerName: 'Esteban Ccora',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-illustration.jpg`,
    coordinates: "12° 51' S, 72° 41' W",
    sensoryScore: '91 Pts Sensorial',
    specs: {
      k1: 'Humedad', v1: '6.5%',
      k2: 'Grasa Nat.', v2: '54.2%',
      k3: 'Cata', v3: 'Chocolatier'
    },
    sensoryNotes: 'Manteca sedosa inigualable, maracuyá maduro, nibs florales y final prolongado a cacao fino.',
    story: 'Genética ancestral Chuncho preservada en parcelas agroforestales de selva alta. Considerado uno de los cacaos más finos del planeta.',
    ndviScore: 0.91,
    lotHash: '0x55d098ef31a29810'
  },
  {
    id: 'TA-0601',
    fruit: 'Aguaje',
    name: 'Aceite Virgen de Aguaje (Mauritia flexuosa)',
    cooperative: 'Asoc. de Mujeres Colectoras del Aguajal',
    community: 'Comunidad Bélgica · Cuenca Ucayali',
    region: 'Ucayali',
    priceFob: 28.00,
    unit: 'USD / Litro FOB Callao',
    minimumMoq: 'MOQ: 50 L (Tambos alimentarios con precinto)',
    availableKg: 650,
    totalKg: 1200,
    dispatchStatus: 'Disponible',
    harvestTag: 'Sin Tala de Palmera',
    certifications: ['Prensado Mecánico', 'Alto Beta-caroteno', 'Cosmético/Pharma'],
    image: `${import.meta.env.BASE_URL}aguaje.jpg`,
    harvestDate: '26 May 2025',
    farmerName: 'Rosa Soria',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-portrait.jpg`,
    coordinates: "08° 23' S, 74° 31' W",
    sensoryScore: '100% Virgen',
    specs: {
      k1: 'Acidez Libre', v1: '< 0.8%',
      k2: 'Peróxidos', v2: '< 3 meq/kg',
      k3: 'Vit. A Act.', v3: 'Natural'
    },
    sensoryNotes: 'Extracción sin solventes químicos. Color naranja rubí intenso, rico en ácido oleico y tocoferoles.',
    story: 'Cosechado mediante arneses de ascenso vertical sin talar la palmera hembra. Protege el ecosistema de aguajales y turberas.',
    ndviScore: 0.93,
    lotHash: '0x15f7c32a9d846e20'
  }
];

/**
 * Carga registros persistidos en caché local
 */
function loadLocalRecords(): LocalHarvestRecord[] {
  try {
    const saved = localStorage.getItem('trazamazon-harvest-records');
    if (saved) {
      return JSON.parse(saved) as LocalHarvestRecord[];
    }
  } catch (error) {
    console.error('Error al leer registros locales de cosecha:', error);
  }
  return [
    {
      id: 'HR-849102',
      fruit: 'Cacao',
      estimatedKg: 185.5,
      coordinates: "12° 28' S, 69° 12' W",
      photoPreview: '',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      syncStatus: 'pending'
    },
    {
      id: 'HR-849089',
      fruit: 'Café',
      estimatedKg: 92.0,
      coordinates: "14° 19' S, 69° 25' W",
      photoPreview: '',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      syncStatus: 'synced',
      cloudHash: '0x9f1a2384'
    },
    {
      id: 'HR-848911',
      fruit: 'Castaña',
      estimatedKg: 240.0,
      coordinates: "11° 45' S, 69° 40' W",
      photoPreview: '',
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      syncStatus: 'synced',
      cloudHash: '0x5b77c10d'
    }
  ];
}

/**
 * Barra Flotante Global de Demostración (Clean Production Navigator)
 */
function PrototypeFloatingNav() {
  const [location] = useLocation();

  return (
    <nav className="floating-prototype-nav" aria-label="Navegación Rápida">
      <Link
        href="/marketplace"
        className={`nav-pill-item ${location === '/' || location === '/marketplace' ? 'active' : ''}`}
        data-testid="pill-marketplace"
      >
        <Leaf size={13} /> Marketplace B2B
      </Link>
      <Link
        href="/lote/TA-0427"
        className={`nav-pill-item ${location.startsWith('/lote') ? 'active' : ''}`}
        data-testid="pill-lot-qr"
      >
        <QrCode size={13} /> Visor QR Lote
      </Link>
      <Link
        href="/app"
        className={`nav-pill-item ${location === '/app' ? 'active' : ''}`}
        data-testid="pill-field-app"
      >
        <Smartphone size={13} /> App Campo Offline
      </Link>
    </nav>
  );
}

/**
 * Header de Navegación Estándar de la Plataforma
 */
function Header({ active }: { active?: string }) {
  const [menu, setMenu] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={`main-nav ${menu ? 'nav-open' : ''}`} aria-label="Navegación principal">
          <Link href="/" className={active === 'home' || !active ? 'nav-link active' : 'nav-link'} data-testid="link-home">
            Inicio
          </Link>
          <Link href="/marketplace" className={active === 'marketplace' ? 'nav-link active' : 'nav-link'} data-testid="link-marketplace">
            Marketplace B2B
          </Link>
          <Link href="/lote/TA-0427" className={active === 'lot' ? 'nav-link active' : 'nav-link'} data-testid="link-qr-viewer">
            Visor QR
          </Link>
          <Link
            href="/lote/TA-0427"
            className="nav-link"
            data-testid="link-agrotourism"
            onClick={() => {
              window.setTimeout(() => {
                const el = document.getElementById('ruta-agroturismo');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 300);
            }}
          >
            Ruta Agroturismo
          </Link>
          <Link href="/app" className={active === 'app' ? 'nav-link active' : 'nav-link'} data-testid="link-field-app">
            App de campo
          </Link>
        </nav>
        <div className="header-actions">
          <span className="header-note">
            <span className="live-dot" /> Trazabilidad Satelital · EUDR Ready
          </span>
          <Link href="/marketplace" className="button button-dark button-small" data-testid="button-source">
            Explorar Catálogo <ArrowUpRight size={15} />
          </Link>
        </div>
        <button
          className="menu-button"
          aria-label="Abrir menú"
          onClick={() => setMenu(!menu)}
          data-testid="button-menu"
        >
          {menu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

/**
 * Logotipo y Marca TrazAmazon
 */
function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brandmark ${light ? 'text-[#f6f2e8]' : 'text-[#1b4332]'}`} data-testid="link-brand-home">
      <span className="brand-icon">
        <TreePine size={18} strokeWidth={2.2} />
      </span>
      <span>
        traz<span className="font-semibold">amazon</span>
      </span>
    </Link>
  );
}

/**
 * Footer Institucional
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Brand light />
          <p>Comercio y tecnología que mantienen la Amazonía en pie.</p>
        </div>
        <div className="footer-links">
          <Link href="/marketplace" data-testid="footer-marketplace">
            Catálogo Mayorista B2B
          </Link>
          <Link href="/lote/TA-0427" data-testid="footer-qr">
            Visor Trazabilidad QR
          </Link>
          <Link href="/app" data-testid="footer-field-app">
            App de Campo Offline
          </Link>
          <a href="mailto:abastecimiento@trazamazon.org">Mesa de Abastecimiento Directo</a>
        </div>
        <div className="footer-place">
          <MapPin size={15} /> Madre de Dios · Puno · Ucayali, Perú
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 TrazAmazon · Plataforma de Trazabilidad Agrícola y Marketplace B2B</span>
        <span>Acreditación Cero Deforestación vía Sentinel-2 / PostGIS</span>
      </div>
    </footer>
  );
}

/**
 * Modal Interactivo para Solicitar Muestra Técnica o Cotización B2B
 */
function SampleQuoteDialog({ lot, onClose }: { lot: ProductLot | null; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [company, setCompany] = useState('');
  const [requestType, setRequestType] = useState('Muestra Técnica (500g)');

  useEffect(() => {
    setSent(false);
  }, [lot]);

  if (!lot) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar ventana" data-testid="button-close-quote">
          <X size={19} />
        </button>
        {sent ? (
          <div className="success-state">
            <span className="success-icon">
              <Check size={25} />
            </span>
            <p className="eyebrow">Solicitud B2B Registrada</p>
            <h2 className="serif">Muestra en Camino</h2>
            <p>
              Hemos enviado tu solicitud para el lote <b>{lot.id} · {lot.name}</b> a la cooperativa <b>{lot.cooperative}</b>.
              El envío se gestionará vía DHL Green Express con certificado fitosanitario SENASA emitido.
            </p>
            <button className="button button-dark" onClick={onClose} data-testid="button-done-quote">
              Volver al Catálogo <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Muestreo y Cotización Corporativa</p>
            <h2 id="quote-title" className="serif">Solicitar Muestra / Cotizar</h2>
            <p className="modal-intro">
              Lote <b>{lot.id}</b> ({lot.name}). Precio base: <b>${lot.priceFob.toFixed(2)} {lot.unit}</b>.
            </p>
            <form onSubmit={handleSubmit} className="quote-form">
              <label>
                Tipo de Requerimiento
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  data-testid="select-request-type"
                >
                  <option value="Muestra Técnica (500g)">Muestra Técnica de Laboratorio (500g)</option>
                  <option value="Cotización por Pallet (500 - 2,000 kg)">Cotización por Pallet (500 - 2,000 kg)</option>
                  <option value="Contenedor Completo (FCL 10t+)">Contenedor Completo (FCL 10t+)</option>
                  <option value="Reserva Pre-cosecha Forward">Reserva Pre-cosecha Forward</option>
                </select>
              </label>
              <label>
                Nombre del Responsable de Compras
                <input
                  required
                  placeholder="Ej. Sofía Valenzuela"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  data-testid="input-quote-name"
                />
              </label>
              <label>
                Empresa / Tostaduría / Chocolatería
                <input
                  required
                  placeholder="Ej. Casa Cacao Gourmet B.V."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  data-testid="input-quote-company"
                />
              </label>
              <label>
                Correo Corporativo
                <input
                  required
                  type="email"
                  placeholder="compras@empresa.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  data-testid="input-quote-email"
                />
              </label>
              <button className="button button-earth button-wide" type="submit" data-testid="button-submit-quote">
                Confirmar Solicitud con Cooperativa <Send size={15} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * VISTA 1: Landing Page Principal
 */
function Home() {
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);

  return (
    <main className="grain">
      <PrototypeFloatingNav />
      <Header active="home" />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content page-in">
          <div className="eyebrow hero-eyebrow">
            <span className="eyebrow-line" /> TRAZABILIDAD SATELITAL · CUMPLIMIENTO EUDR
          </div>
          <h1 className="serif">
            Comercio justo.<br />
            <em>Bosque en pie.</em>
          </h1>
          <p className="hero-copy">
            Plataforma offline-first de trazabilidad agrícola y marketplace B2B para la Amazonía.
            Conectamos cosechas familiares verificadas con compradores globales que valoran la conservación del bosque.
          </p>
          <div className="hero-cta">
            <Link href="/marketplace" className="button button-earth" data-testid="button-explore-lots">
              Explorar Catálogo Mayorista <ArrowRight size={16} />
            </Link>
            <Link href="/app" className="button button-dark" data-testid="button-try-app">
              <Smartphone size={15} /> Probar App de Campo Offline
            </Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              <span>MQ</span>
              <span>LM</span>
              <span>EH</span>
              <span>RS</span>
            </div>
            <p>
              <strong>7 Comunidades Indígenas y Concesiones</strong>
              <br />
              Monitoreo satelital continuo Sentinel-2 & Planet
            </p>
          </div>
        </div>

        <div className="hero-image-wrap">
          <img src={`${import.meta.env.BASE_URL}amazon-cacao-hero.jpg`} alt="Cacao nativo cultivado bajo el dosel amazónico" />
          <div className="hero-image-shade" />
          <div className="hero-image-caption">
            <span className="caption-dot" />
            <span>PARIAMANU · MADRE DE DIOS · PERÚ</span>
            <span className="caption-rule" />
          </div>
          <div className="hero-stamp">
            <TreePine size={20} />
            <span>CERO<br />DEFORESTACIÓN</span>
          </div>
        </div>
        <div className="hero-side-note">
          TRAZABILIDAD SATELITAL <span>·</span> 12° 28' S / 69° 12' W
        </div>
      </section>

      {/* Ticker de Productos y Bioeconomía */}
      <section className="ticker" aria-label="Líneas de producción amazónica">
        <div className="ticker-inner">
          <span>CATÁLOGO MAYORISTA DE COSECHAS VIVAS</span>
          <i /> CACAO NATIVO CRIOLLO Y CHUNCHO
          <i /> CAFÉ DE SOMBRA ESPECIAL
          <i /> CASTAÑA SILVESTRE RECOLECTADA
          <i /> ACEITE VIRGEN DE AGUAJE
          <i /> COPOAZÚ LIOFILIZADO
          <i /> DILIGENCIA REGLAMENTO EUDR
        </div>
      </section>

      {/* Lotes Destacados */}
      <section className="section featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cosechas con Trazabilidad Verificada</p>
            <h2 className="serif">
              Lotes con un <em>territorio vivo</em> detrás.
            </h2>
          </div>
          <Link href="/marketplace" className="text-link" data-testid="link-view-marketplace">
            Ver catálogo B2B completo ({initialLots.length} lotes) <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialLots.slice(0, 3).map((lot) => (
            <article key={lot.id} className="b2b-lot-card-pro">
              <div className="b2b-card-image-wrap">
                <img src={lot.image} alt={lot.name} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-bold">
                  <span className="px-2 py-0.5 bg-white/90 text-[#001208] rounded-full uppercase tracking-wider">
                    Lote {lot.id}
                  </span>
                  <span className="px-2 py-0.5 bg-[#2a7a4c] text-white rounded-full uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                    {lot.harvestTag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-amber-400" /> {lot.coordinates}
                  </span>
                  <span className="bg-[#1b4332]/90 px-1.5 py-0.5 rounded text-[10px] font-semibold text-emerald-200">
                    {lot.sensoryScore}
                  </span>
                </div>
              </div>
              <div className="b2b-card-content">
                <div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {lot.certifications.map((c) => (
                      <span key={c} className="text-[9px] px-2 py-0.5 bg-[#f5f4ef] text-[#424843] rounded font-semibold uppercase">
                        {c}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-newsreader text-xl font-medium text-[#001208] hover:text-[#1b4332] transition-colors leading-snug">
                    {lot.name}
                  </h3>
                  <p className="text-xs text-[#727973] mt-1 line-clamp-2">
                    {lot.community}. Manejado por {lot.cooperative}.
                  </p>
                </div>
                <div className="specs-grid-3">
                  <div className="specs-grid-item">
                    <span>{lot.specs.k1}</span>
                    <span>{lot.specs.v1}</span>
                  </div>
                  <div className="specs-grid-item">
                    <span>{lot.specs.k2}</span>
                    <span>{lot.specs.v2}</span>
                  </div>
                  <div className="specs-grid-item">
                    <span>{lot.specs.k3}</span>
                    <span>{lot.specs.v3}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-xl font-bold text-[#001208]">${lot.priceFob.toFixed(2)}</span>
                      <span className="text-[11px] text-[#727973] ml-1.5">{lot.unit}</span>
                    </div>
                    <span className="text-xs text-[#2a7a4c] font-semibold">{lot.dispatchStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      className="btn-sample-action"
                      onClick={() => setSelectedLot(lot)}
                    >
                      Solicitar Muestra
                    </button>
                    <Link
                      href={`/lote/${lot.id}`}
                      className="btn-trace-action"
                    >
                      <QrCode size={14} className="text-[#2a7a4c]" /> Trazabilidad
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Sección de Impacto Social, Ambiental y ODS */}
      <section className="impact-section">
        <div className="impact-intro">
          <p className="eyebrow">Alineación Estratégica con la Bioeconomía</p>
          <h2 className="serif">
            Generamos prosperidad económica <em>sin talar una sola hectárea.</em>
          </h2>
          <p>
            TrazAmazon resuelve la exclusión tecnológica de los pequeños productores amazónicos.
            Permite registrar datos de cosecha en campo sin señal telefónica, validar la no-deforestación
            mediante monitoreo satelital PostGIS y conectar directamente con el mercado internacional.
          </p>
          <span className="impact-disclaimer">
            <ShieldCheck size={15} /> Validación continua de cobertura boscosa con imágenes Sentinel-2 y límites comunales reconocidos.
          </span>
        </div>
        <div className="impact-outcomes">
          <article>
            <span className="impact-icon">
              <Handshake size={19} />
            </span>
            <p className="eyebrow">Comercio B2B Directo</p>
            <h3 className="serif">+35% ingreso neto familiar.</h3>
            <p>Eliminación de intermediarios especulativos mediante contratos directos con tostadores y fabricantes internacionales.</p>
          </article>
          <article>
            <span className="impact-icon">
              <TreePine size={19} />
            </span>
            <p className="eyebrow">Conservación Activa</p>
            <h3 className="serif">4,250 ha protegidas.</h3>
            <p>La recolección silvestre y los sistemas agroforestales otorgan mayor valor económico al bosque vivo que a la tala.</p>
          </article>
        </div>

        {/* Banda de Objetivos de Desarrollo Sostenible (ODS) */}
        <div className="ods-band">
          <div className="ods-label">
            <span>AGENDA GLOBAL</span>
            <b>ODS Vinculados</b>
          </div>
          <div className="ods-list">
            <span><b>1</b> Fin de la pobreza</span>
            <span><b>5</b> Igualdad de género</span>
            <span><b>8</b> Trabajo decente y crecimiento</span>
            <span><b>12</b> Producción responsable</span>
            <span><b>13</b> Acción por el clima</span>
            <span><b>15</b> Vida de ecosistemas terrestres</span>
          </div>
        </div>
      </section>

      <Footer />
      <SampleQuoteDialog lot={selectedLot} onClose={() => setSelectedLot(null)} />
    </main>
  );
}

/**
 * VISTA 1 (Extensión): Catálogo Mayorista B2B (Diseño Canopy & Provenance)
 */
function Marketplace() {
  const [query, setQuery] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('Todas');
  const [selectedProductType, setSelectedProductType] = useState<string>('Todos');
  const [zeroDeforestOnly, setZeroDeforestOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('reciente');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);

  // Filtrado reactivo de lotes
  const filteredLots = useMemo(() => {
    let result = initialLots.filter((lot) => {
      const matchCommunity =
        selectedCommunity === 'Todas' ||
        lot.community.toLowerCase().includes(selectedCommunity.toLowerCase()) ||
        lot.cooperative.toLowerCase().includes(selectedCommunity.toLowerCase());

      const matchProductType =
        selectedProductType === 'Todos' ||
        lot.fruit.toLowerCase() === selectedProductType.toLowerCase() ||
        lot.name.toLowerCase().includes(selectedProductType.toLowerCase());

      const matchZeroDeforest =
        !zeroDeforestOnly ||
        lot.certifications.some((c) => c.toLowerCase().includes('deforestación'));

      const matchQuery =
        !query ||
        `${lot.name} ${lot.id} ${lot.community} ${lot.cooperative} ${lot.fruit} ${lot.region}`
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchCommunity && matchProductType && matchZeroDeforest && matchQuery;
    });

    if (sortBy === 'precio_asc') {
      result.sort((a, b) => a.priceFob - b.priceFob);
    } else if (sortBy === 'precio_desc') {
      result.sort((a, b) => b.priceFob - a.priceFob);
    } else if (sortBy === 'volumen') {
      result.sort((a, b) => b.availableKg - a.availableKg);
    }

    return result;
  }, [query, selectedCommunity, selectedProductType, zeroDeforestOnly, sortBy]);

  const clearAllFilters = () => {
    setQuery('');
    setSelectedCommunity('Todas');
    setSelectedProductType('Todos');
    setZeroDeforestOnly(false);
    setSortBy('reciente');
  };

  return (
    <main className="bg-[#faf9f4] min-h-screen text-[#1b1c19] font-dmsans">
      <PrototypeFloatingNav />
      <Header active="marketplace" />

      {/* TOP EDITORIAL HEADER */}
      <section className="w-full bg-[#faf9f4] pt-8 pb-10 border-b border-[rgba(11,41,27,0.06)]">
        <div className="max-w-[1320px] mx-auto px-6 flex flex-col gap-6">
          {/* Breadcrumb */}
          <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#727973] font-semibold">
            <Link href="/" className="hover:text-[#001208] transition-colors">Inicio</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#1b4332] font-bold">Marketplace B2B</span>
            <span className="text-gray-300">/</span>
            <span className="text-[#727973]">Catálogo de cosechas activas</span>
          </nav>

          {/* Editorial Title & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#efeee9] rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-[#2a7a4c] animate-pulse" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#143d29]">
                  Campañas Vivas · Lotes Auditados EUDR
                </span>
              </div>
              <h1 className="font-newsreader text-4xl sm:text-5xl text-[#001208] tracking-tight">
                Catálogo Mayorista de <span className="italic font-normal text-[#1b4332]">Cosechas Vivas</span>
              </h1>
              <p className="text-base text-[#424843] max-w-2xl leading-relaxed">
                Conexión directa entre compradores éticos y cooperativas amazónicas. Cada lote incluye georreferenciación satelital, análisis de humedad, perfil sensorial y contrato de precio justo garantizado.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                className="inline-flex items-center justify-between px-5 py-3.5 bg-[#954a17] text-white rounded-lg text-xs font-semibold hover:bg-[#d97736] transition-all shadow-md"
                onClick={() => alert('Descargando catálogo técnico consolidado TrazAmazon (PDF con análisis físico-químico y polígonos GeoJSON)...')}
              >
                <span className="flex items-center gap-2">
                  <Download size={16} />
                  <span>Descargar Catálogo PDF (Fichas Técnicas)</span>
                </span>
                <ArrowUpRight size={15} />
              </button>
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#f5f4ef] rounded-lg text-[#424843] border border-gray-200/50">
                <span className="text-xs flex items-center gap-1.5 font-medium">
                  <Globe2 size={14} className="text-[#1b4332]" /> Auditoría Sentinel-2 & Planet
                </span>
                <span className="text-[10px] text-[#2a7a4c] font-bold tracking-wider">
                  100% CERO DEFORESTACIÓN
                </span>
              </div>
            </div>
          </div>

          {/* Live Telemetry Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            <div className="b2b-telemetry-box">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#727973]">Disponibilidad en almacén</span>
              <div className="flex items-baseline gap-2">
                <span className="font-newsreader text-3xl font-medium text-[#001208]">18</span>
                <span className="text-xs text-[#1b4332] font-semibold">Lotes listos ahora</span>
              </div>
              <span className="text-[11px] text-[#727973]">Cosechas Mayo 2025</span>
            </div>

            <div className="b2b-telemetry-box">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#727973]">Gobernanza territorial</span>
              <div className="flex items-baseline gap-2">
                <span className="font-newsreader text-3xl font-medium text-[#001208]">7</span>
                <span className="text-xs text-[#1b4332] font-semibold">Comunidades y concesiones</span>
              </div>
              <span className="text-[11px] text-[#727973]">Amahuaca, Ese Eja, Shipibo</span>
            </div>

            <div className="b2b-telemetry-box">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#727973]">Dosel en pie verificado</span>
              <div className="flex items-baseline gap-2">
                <span className="font-newsreader text-3xl font-medium text-[#001208]">4,250</span>
                <span className="text-xs text-[#1b4332] font-semibold">Hectáreas de bosque</span>
              </div>
              <span className="text-[11px] text-[#727973]">Custodia activa comunitaria</span>
            </div>

            <div className="b2b-telemetry-box">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#727973]">Cadena de custodia</span>
              <div className="flex items-baseline gap-2">
                <span className="font-newsreader text-3xl font-medium text-[#001208]">100%</span>
                <span className="text-xs text-[#2a7a4c] font-semibold">Árbol a Puerto</span>
              </div>
              <span className="text-[11px] text-[#727973]">Trazabilidad biométrica y QR</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & CONTROL STRIP */}
      <section className="w-full bg-[#f4f1ea]/95 py-3 sticky top-0 z-40 shadow-xs backdrop-blur-md border-b border-[rgba(11,41,27,0.06)]">
        <div className="max-w-[1320px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-7/12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              className="w-full pl-11 pr-12 py-2.5 bg-white rounded-lg text-xs text-[#001208] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#143d29] shadow-xs border border-gray-200/80"
              placeholder="Buscar por lote (ej. TA-0427), producto, comunidad, o cooperativa..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
            />
            {query ? (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setQuery('')}
              >
                <X size={14} />
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-gray-100 text-gray-500 rounded border">⌘K</kbd>
              </div>
            )}
          </div>

          {/* Controls & Ordering */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs">
              <label className="text-[11px] uppercase font-bold tracking-wider text-[#727973] hidden lg:inline" htmlFor="order-select">
                Ordenar:
              </label>
              <div className="relative">
                <select
                  className="appearance-none bg-white pl-3.5 pr-8 py-2 rounded-lg text-xs text-[#001208] focus:outline-none shadow-xs border border-gray-200/80 cursor-pointer font-medium"
                  id="order-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="reciente">Cosecha más reciente</option>
                  <option value="volumen">Mayor volumen disponible</option>
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={14} />
              </div>
            </div>

            {/* Grid / List Toggle */}
            <div className="flex items-center p-0.5 bg-[#efeee9] rounded-lg border border-gray-200/60">
              <button
                aria-label="Vista cuadrícula"
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-[#1b4332] shadow-xs' : 'text-gray-500 hover:text-[#001208]'}`}
                type="button"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                aria-label="Vista lista"
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-[#1b4332] shadow-xs' : 'text-gray-500 hover:text-[#001208]'}`}
                type="button"
                onClick={() => setViewMode('list')}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN WORKSPACE: FILTERS + HIGH-DENSITY LOTS */}
      <section className="w-full bg-[#faf9f4] py-8">
        <div className="max-w-[1320px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: ADVANCED FACETED FILTERS */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            {/* Active Filter Chips */}
            <div className="flex flex-col gap-2 p-4 bg-[#f5f4ef] rounded-xl border border-gray-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#001208]">
                  Filtros Activos ({[selectedCommunity !== 'Todas', selectedProductType !== 'Todos', zeroDeforestOnly, query].filter(Boolean).length})
                </span>
                <button
                  className="text-[10px] font-bold uppercase tracking-wider text-[#954a17] hover:underline"
                  onClick={clearAllFilters}
                >
                  Limpiar todo
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCommunity !== 'Todas' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#001208] rounded-full text-[11px] shadow-xs border">
                    {selectedCommunity}
                    <X size={12} className="cursor-pointer hover:text-red-600" onClick={() => setSelectedCommunity('Todas')} />
                  </span>
                )}
                {selectedProductType !== 'Todos' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#001208] rounded-full text-[11px] shadow-xs border">
                    {selectedProductType}
                    <X size={12} className="cursor-pointer hover:text-red-600" onClick={() => setSelectedProductType('Todos')} />
                  </span>
                )}
                {zeroDeforestOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#2a7a4c] font-semibold rounded-full text-[11px] shadow-xs border">
                    Cero Deforestación
                    <X size={12} className="cursor-pointer hover:text-red-600" onClick={() => setZeroDeforestOnly(false)} />
                  </span>
                )}
                {query && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#001208] rounded-full text-[11px] shadow-xs border">
                    "{query}"
                    <X size={12} className="cursor-pointer hover:text-red-600" onClick={() => setQuery('')} />
                  </span>
                )}
                {selectedCommunity === 'Todas' && selectedProductType === 'Todos' && !zeroDeforestOnly && !query && (
                  <span className="text-[11px] text-[#727973] italic">Sin filtros restrictivos</span>
                )}
              </div>
            </div>

            {/* Filter Group: Comunidades y Cooperativas */}
            <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-xs border border-gray-200/60">
              <div className="flex items-center justify-between text-[#001208]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#143d29]">Comunidad / Cooperativa</h3>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#1b1c19]">
                {[
                  { name: 'Todas', desc: 'Todas las comunidades', count: 18 },
                  { name: 'Boca Pariamanu', desc: 'Pueblo Amahuaca · MDD', count: 4 },
                  { name: 'Palma Real', desc: 'Pueblo Ese Eja · MDD', count: 3 },
                  { name: 'Alto Tambopata', desc: 'Puno / Selva Alta', count: 5 },
                  { name: 'Río Las Piedras', desc: 'Castañeros Tahuamanu', count: 3 },
                  { name: 'Comunidad Bélgica', desc: 'Pueblo Shipibo / Ucayali', count: 2 },
                  { name: 'Bosque Vivo', desc: 'Tahuamanu Ancestral', count: 1 }
                ].map((item) => (
                  <label key={item.name} className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="community-filter"
                      className="mt-0.5 accent-[#143d29]"
                      checked={selectedCommunity === item.name}
                      onChange={() => setSelectedCommunity(item.name)}
                    />
                    <div className="flex flex-col flex-1 leading-snug">
                      <span className="group-hover:text-[#1b4332] font-medium">{item.name}</span>
                      <span className="text-[10px] text-[#727973]">{item.desc}</span>
                    </div>
                    <span className="text-[10px] text-[#727973] px-1.5 py-0.5 bg-[#f5f4ef] rounded">{item.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Tipo de Producto */}
            <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-xs border border-gray-200/60">
              <div className="flex items-center justify-between text-[#001208]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#143d29]">Tipo de Cosecha</h3>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#1b1c19]">
                {[
                  { name: 'Todos', count: 18 },
                  { name: 'Cacao', count: 6 },
                  { name: 'Café', count: 5 },
                  { name: 'Castaña', count: 4 },
                  { name: 'Copoazú', count: 2 },
                  { name: 'Aguaje', count: 1 }
                ].map((prod) => (
                  <label key={prod.name} className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="product-filter"
                        className="accent-[#143d29]"
                        checked={selectedProductType === prod.name}
                        onChange={() => setSelectedProductType(prod.name)}
                      />
                      <span className="group-hover:text-[#1b4332]">{prod.name}</span>
                    </span>
                    <span className="text-[10px] text-[#727973]">{prod.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Garantía Ecológica & Legal */}
            <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-xs border border-gray-200/60">
              <div className="flex items-center justify-between text-[#001208]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#143d29]">Garantía Ecológica & Legal</h3>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#1b1c19]">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-[#143d29] rounded"
                      checked={zeroDeforestOnly}
                      onChange={(e) => setZeroDeforestOnly(e.target.checked)}
                    />
                    <span className="group-hover:text-[#1b4332] font-medium">Cero Deforestación (Satélite)</span>
                  </span>
                  <span className="text-[10px] text-[#2a7a4c] font-bold">12</span>
                </label>
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked disabled className="accent-[#143d29] rounded" />
                    <span>Orgánico USDA / EU</span>
                  </span>
                  <span className="text-[10px]">10</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked disabled className="accent-[#143d29] rounded" />
                    <span>Fair Trade / Comercio Justo</span>
                  </span>
                  <span className="text-[10px]">8</span>
                </div>
              </div>
            </div>

            {/* Cooperative Escrow Institutional Callout */}
            <div className="p-4 bg-[#0b291b] text-white rounded-xl flex flex-col gap-2 shadow-sm">
              <div className="flex items-center gap-2 text-[#c9ebd4]">
                <ShieldCheck size={18} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Garantía Institucional</span>
              </div>
              <p className="text-xs text-[#adceb9] leading-relaxed">
                Todos los pagos están custodiados mediante Escrow bancario y se liberan contra BL e informe fitosanitario oficial SENASA.
              </p>
            </div>
          </aside>

          {/* RIGHT COLUMN: 6 B2B HIGH-DENSITY LOT CARDS */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {filteredLots.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>
                {filteredLots.map((lot) => (
                  <article key={lot.id} className="b2b-lot-card-pro group">
                    {/* Header Image with Overlays */}
                    <div className="b2b-card-image-wrap">
                      <img src={lot.image} alt={lot.name} loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071b12]/80 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-bold">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[#001208] uppercase tracking-wider">
                          Lote {lot.id}
                        </span>
                        <span className="px-2.5 py-1 bg-[#2a7a4c] text-white rounded-full uppercase font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                          {lot.harvestTag}
                        </span>
                      </div>

                      {/* Bottom Image Coordinates & Score */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#ffdbc9]" />
                          {lot.coordinates}
                        </span>
                        <span className="bg-[#1b4332]/90 px-2 py-0.5 rounded text-[11px] font-bold uppercase text-emerald-200">
                          {lot.sensoryScore}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="b2b-card-content">
                      <div className="flex flex-col gap-2">
                        {/* Certifications Row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {lot.certifications.map((c, i) => (
                            <span
                              key={c}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                i === 2
                                  ? 'bg-[#ffdbc9] text-[#763300]'
                                  : 'bg-[#f5f4ef] text-[#424843]'
                              }`}
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h2 className="font-newsreader text-2xl font-medium text-[#001208] group-hover:text-[#1b4332] transition-colors leading-snug">
                          {lot.name}
                        </h2>

                        {/* Community Description */}
                        <p className="text-xs text-[#727973] leading-relaxed">
                          {lot.community}. Manejado por la {lot.cooperative}.
                        </p>

                        {/* Technical Specs 3-Column Grid */}
                        <div className="specs-grid-3">
                          <div className="specs-grid-item">
                            <span>{lot.specs.k1}</span>
                            <span>{lot.specs.v1}</span>
                          </div>
                          <div className="specs-grid-item">
                            <span>{lot.specs.k2}</span>
                            <span>{lot.specs.v2}</span>
                          </div>
                          <div className="specs-grid-item">
                            <span>{lot.specs.k3}</span>
                            <span>{lot.specs.v3}</span>
                          </div>
                        </div>

                        {/* Sensory Notes */}
                        <div className="text-xs text-[#424843] leading-relaxed pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b4332] block">
                            Perfil Sensorial:
                          </span>
                          {lot.sensoryNotes}
                        </div>
                      </div>

                      {/* Pricing, MOQ & Actions Lockup */}
                      <div className="pt-3 border-t border-[rgba(11,41,27,0.08)] flex flex-col gap-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="font-newsreader text-2xl font-bold text-[#001208]">
                              ${lot.priceFob.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-[#727973] ml-1.5">{lot.unit}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-[#1b4332] font-bold block">{lot.availableKg.toLocaleString()} kg Disp.</span>
                            <span className="text-[10px] text-[#727973]">Lote total: {lot.totalKg.toLocaleString()} kg</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[#727973] text-[11px]">
                          <span>{lot.minimumMoq}</span>
                          <span className="text-[#2a7a4c] font-semibold">{lot.dispatchStatus}</span>
                        </div>

                        {/* Action Buttons: Solicitar Muestra & Trazabilidad */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            className="btn-sample-action"
                            type="button"
                            onClick={() => setSelectedLot(lot)}
                          >
                            Solicitar Muestra
                          </button>
                          <Link
                            href={`/lote/${lot.id}`}
                            className="btn-trace-action"
                            data-testid={`trace-link-${lot.id}`}
                          >
                            <QrCode size={15} className="text-[#143d29]" />
                            <span>Trazabilidad</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-results bg-white p-12 rounded-xl text-center border">
                <span className="empty-icon mx-auto mb-3">
                  <Search size={22} />
                </span>
                <h2 className="font-newsreader text-2xl text-[#001208]">No se encontraron cosechas</h2>
                <p className="text-xs text-[#727973] max-w-sm mx-auto mt-2">
                  No hay lotes que coincidan con la búsqueda o combinación de filtros seleccionada.
                </p>
                <button className="button button-dark mt-4" onClick={clearAllFilters}>
                  Restablecer todos los filtros
                </button>
              </div>
            )}

            {/* Pagination Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#f5f4ef] rounded-xl gap-3 mt-4 border border-gray-200/50">
              <span className="text-xs text-[#727973]">
                Mostrando <strong className="text-[#001208]">{filteredLots.length}</strong> de <strong className="text-[#001208]">{initialLots.length}</strong> lotes de cosecha auditada
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  className="px-3 py-1.5 rounded-lg bg-[#efeee9] text-[#727973] text-xs flex items-center gap-1 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#001208] text-white text-xs font-semibold">1</button>
                <button className="w-8 h-8 rounded-lg bg-white text-[#001208] text-xs hover:bg-[#efeee9] transition-colors border">2</button>
                <button className="w-8 h-8 rounded-lg bg-white text-[#001208] text-xs hover:bg-[#efeee9] transition-colors border">3</button>
                <button className="px-3 py-1.5 rounded-lg bg-[#efeee9] text-[#001208] text-xs flex items-center gap-1 hover:bg-gray-200 transition-colors">
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL B2B LOGISTICS & CONTRACTS BANNER */}
      <section className="corporate-logistics-section">
        {/* Subtle Watermark Glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#1b4332]/40 blur-3xl pointer-events-none" />

        <div className="max-w-[1320px] mx-auto relative z-10 flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#143d29]/60 text-[#c9ebd4] rounded-full w-fit">
                <Globe2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Logística Global Directa</span>
              </div>
              <h2 className="font-newsreader text-3xl sm:text-4xl text-[#faf9f5] tracking-tight leading-tight">
                Soluciones de Compra Corporativa y <span className="italic font-normal text-[#ffdbc9]">Muestreo Internacional</span>
              </h2>
              <p className="text-sm text-[#adceb9] max-w-xl leading-relaxed">
                Diseñado para casas de chocolate fino, tostadores de especialidad, laboratorios de cosmética botánica y distribuidores B2B en Europa, Norteamérica y Asia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#c9ebd4] text-xs font-semibold">
                    <Truck size={15} />
                    <span>DHL Green Express</span>
                  </div>
                  <p className="text-[11px] text-[#adceb9] leading-snug">
                    Muestras técnicas puerta a puerta en 3 a 5 días con certificado fitosanitario SENASA emitido.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#c9ebd4] text-xs font-semibold">
                    <Ship size={15} />
                    <span>Incoterms B2B</span>
                  </div>
                  <p className="text-[11px] text-[#adceb9] leading-snug">
                    FOB Callao o CIF Róterdam, Hamburgo, Amberes y Long Beach. Contratos forward y pre-cosecha.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#c9ebd4] text-xs font-semibold">
                    <ShieldCheck size={15} />
                    <span>Diligencia EUDR</span>
                  </div>
                  <p className="text-[11px] text-[#adceb9] leading-snug">
                    Polígonos georreferenciados GeoJSON listos para cumplimiento CSRD y Reglamento Europeo Cero Deforestación.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Mesa de Abastecimiento Directo */}
            <div className="lg:col-span-5 logistics-specialist-card flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffdbc9]">
                  Mesa de Abastecimiento Directo
                </span>
                <h3 className="font-newsreader text-2xl text-[#faf9f5]">
                  ¿Requieres un contrato multi-anual o reserva de cosecha completa?
                </h3>
                <p className="text-xs text-[#adceb9] leading-relaxed mt-1">
                  Nuestro equipo técnico coordina visitas a concesiones en Madre de Dios, auditorías presenciales y reservas de volumen con precios fijados.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#954a17] text-white rounded-lg text-xs font-bold hover:bg-[#d97736] transition-all shadow-md"
                  onClick={() => alert('Conectando con la Mesa de Abastecimiento Directo de TrazAmazon. Un especialista responderá en menos de 24 horas.')}
                >
                  <span>Hablar con un Especialista en Abastecimiento</span>
                  <ArrowRight size={15} />
                </button>
                <span className="text-[10px] text-[#adceb9] text-center">
                  Respuesta en menos de 24 horas laborables · Soporte en ES / EN / FR
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <SampleQuoteDialog lot={selectedLot} onClose={() => setSelectedLot(null)} />
    </main>
  );
}

/**
 * VISTA 2: Visor de Detalle por Código QR y Ruta de Agroturismo
 */
function LotDetail() {
  const [, params] = useRoute('/lote/:id');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [visitors, setVisitors] = useState(2);
  const [visitDate, setVisitDate] = useState('2025-07-15');
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);

  const lot = initialLots.find((x) => x.id === params?.id) || initialLots[0];

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <main className="grain">
      <PrototypeFloatingNav />
      <Header active="lot" />

      <div className="lot-page page-in">
        <Link href="/marketplace" className="back-link" data-testid="link-back-marketplace">
          <ArrowLeft size={15} /> Volver al Catálogo Mayorista
        </Link>

        {/* Hero del Lote */}
        <section className="lot-hero">
          <div className="lot-photo">
            <img src={lot.image} alt={lot.name} />
            <span className="lot-photo-label">
              <CircleDot size={13} /> EXPEDIENTE DIGITAL DE TRAZABILIDAD · {lot.id}
            </span>
          </div>

          <div className="lot-intro">
            <div className="lot-status">
              <span className="status-dot" /> LOTE ACTIVO VERIFICADO
              <span className="lot-date">· Cosechado el {lot.harvestDate}</span>
            </div>
            <p className="eyebrow">
              {lot.fruit.toUpperCase()} NATIVO <span>·</span> {lot.region.toUpperCase()}, PERÚ
            </p>
            <h1 className="serif">{lot.name}</h1>
            <p className="lot-intro-coop">
              <span className="coop-mark">{lot.cooperative[0]}</span>
              {lot.cooperative} · {lot.community}
            </p>
            <p className="lot-price">
              <strong>${lot.priceFob.toFixed(2)}</strong>
              <span>{lot.unit}</span>
              <i>·</i>
              <span>{lot.minimumMoq}</span>
            </p>

            <div className="cert-list">
              {lot.certifications.map((c) => (
                <span key={c} className="tag">
                  <ShieldCheck size={13} /> {c}
                </span>
              ))}
              <span className="tag tag-earth">
                <Layers size={13} /> NDVI: {lot.ndviScore} (Dosel Denso)
              </span>
            </div>

            <p className="lot-story-intro">{lot.story}</p>

            <div className="flex flex-col gap-2 mt-4">
              <button
                className="button button-earth button-wide"
                onClick={() => setSelectedLot(lot)}
                data-testid="button-request-sample-lot"
              >
                Solicitar Muestra Técnica / Cotizar <ArrowUpRight size={15} />
              </button>
              <button
                className="button button-light button-wide"
                onClick={() => {
                  const el = document.getElementById('ruta-agroturismo');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="button-scroll-tour"
              >
                <Compass size={15} /> Conocer la Ruta de Agroturismo Vivencial
              </button>
            </div>
          </div>
        </section>

        {/* Grid de Mapa Satelital y Ficha del Productor */}
        <section className="lot-details-grid">
          {/* Perfil del Agricultor */}
          <div className="lot-story">
            <p className="eyebrow">Origen Comunitario</p>
            <h2 className="serif">
              El rostro detrás de la cosecha: <em>bosque y familia.</em>
            </h2>
            <p>
              En la cuenca de {lot.community}, cada familia productora custodia su parcela dentro de concesiones forestales y parcelas agroforestales.
              La cosecha convive con árboles nativos centenarios y refugios de fauna silvestre.
            </p>

            <div className="farmer-card">
              <img
                className="farmer-avatar-image"
                src={lot.farmerImage}
                alt={`Fotografía de ${lot.farmerName}`}
              />
              <div>
                <b>{lot.farmerName}</b>
                <span>Productor(a) Líder · {lot.cooperative}</span>
                <small>Insignia Digital TrazAmazon #{lot.id}-ID</small>
              </div>
              <BadgeCheck size={20} className="text-[#2d6a4f]" />
            </div>

            <div className="mt-5 p-3.5 bg-[#f0eee4] border border-[#e1dfd4] rounded flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#2d6a4f]">
                <QrCode size={18} />
                <span className="font-mono text-[10px]">Hash: {lot.lotHash}</span>
              </div>
              <span className="text-[10px] text-[#2d6a4f] bg-[#e4ecde] px-2 py-0.5 rounded font-semibold">
                PostGIS Verified
              </span>
            </div>
          </div>

          {/* Componente Visual de Mapa Satelital Estilizado */}
          <div className="provenance-card">
            <div className="provenance-header">
              <div>
                <p className="eyebrow">Trazabilidad Satelital</p>
                <h3 className="serif">Polígono de Parcela Georreferenciada</h3>
              </div>
              <span className="qr-mark">
                <QrCode size={26} />
              </span>
            </div>

            {/* Radar Satelital Animado */}
            <div className="satellite-radar-box">
              <img
                className="satellite-radar-img"
                src={`${import.meta.env.BASE_URL}amazon-parcel-map.jpg`}
                alt="Vista satelital de la parcela y bosque circundante"
              />
              <div className="satellite-grid-overlay" />
              <div className="radar-sweep" />

              {/* Polígono de la Parcela */}
              <div className="parcel-polygon-outline" title="Polígono delimitado de la parcela">
                <span className="text-[7px] text-[#f7e6ce] absolute -top-3.5 left-1 font-mono">PARCELA {lot.id}</span>
              </div>

              {/* Punto de Cosecha con Pulso */}
              <div className="pulse-target" title="Coordenadas GPS de cosecha" />

              {/* Badges de Información Satelital */}
              <div className="satellite-badge-group">
                <span className="satellite-status-pill">
                  <ShieldCheck size={11} /> Cero Deforestación 2024-2025
                </span>
                <span className="ndvi-pill">
                  <Leaf size={11} /> Cobertura Vegetal NDVI {lot.ndviScore}
                </span>
              </div>

              <div className="satellite-coords-pill">
                <MapPin size={10} className="inline mr-1 text-[#d4a373]" />
                {lot.coordinates}
              </div>
            </div>

            <p className="map-illustration-note">
              Monitoreo satelital Sentinel-2 (ESA) procesado vía Supabase PostGIS. Cero pérdida de cobertura forestal en un radio de 5 km.
            </p>

            <div className="provenance-steps">
              <div>
                <span className="step-check">
                  <Check size={12} />
                </span>
                <p>
                  <b>Registro en Parcela sin Señal</b>
                  <small>{lot.harvestDate} · App de Campo Offline (Dexie.js)</small>
                </p>
              </div>
              <div>
                <span className="step-check">
                  <Check size={12} />
                </span>
                <p>
                  <b>Sincronización Cloud y Verificación Hash</b>
                  <small>Supabase Cloud PostgreSQL + PostGIS · Acreditado EUDR</small>
                </p>
              </div>
              <div>
                <span className="step-now">
                  <Leaf size={12} />
                </span>
                <p>
                  <b>Disponible en Catálogo Mayorista B2B</b>
                  <small>Venta directa y trazabilidad abierta al importador</small>
                </p>
              </div>
            </div>
            <div className="provenance-foot">
              <ShieldCheck size={15} /> Acreditación oficial TrazAmazon · Reglamento Europeo Cero Deforestación
            </div>
          </div>
        </section>

        {/* Sección de Agroturismo Vivencial */}
        <section className="tour-block" id="ruta-agroturismo">
          <div className="tour-gallery">
            <figure className="tour-image">
              <img src={`${import.meta.env.BASE_URL}tour-community.jpg`} alt="Recepción por la comunidad nativa" />
              <figcaption>
                <Handshake size={15} /> Bienvenida Comunitaria
              </figcaption>
            </figure>
            <figure className="tour-image">
              <img src={`${import.meta.env.BASE_URL}tour-agroforestry.jpg`} alt="Caminata guiada por parcelas de cacao" />
              <figcaption>
                <TreePine size={15} /> Recorrido Agroforestal
              </figcaption>
            </figure>
            <figure className="tour-image">
              <img src={`${import.meta.env.BASE_URL}tour-community-meal.jpg`} alt="Almuerzo tradicional con frutos del bosque" />
              <figcaption>
                <Compass size={15} /> Sabores de la Selva
              </figcaption>
            </figure>
          </div>

          <div className="tour-copy">
            <p className="eyebrow">Ruta TrazAmazon</p>
            <h2 className="serif">
              Vive la experiencia en nuestra <em>comunidad.</em>
            </h2>
            <p>
              Conecta de forma real con el origen de lo que consumes. Visita la Asociación Bosque Vivo en Madre de Dios,
              recorre parcelas de cacao bajo árboles gigantes y comparte la mesa tradicional con las familias productoras.
            </p>
            <ul className="tour-list">
              <li>
                <CheckCircle2 size={15} /> Ruta guiada por agricultores locales en lengua originaria y español
              </li>
              <li>
                <CheckCircle2 size={15} /> Taller de fermentación y secado tradicional de cacao
              </li>
              <li>
                <CheckCircle2 size={15} /> 100% de los ingresos van al fondo de conservación comunal
              </li>
            </ul>

            <button
              className="button button-earth"
              onClick={() => {
                setBooking(true);
                setBooked(false);
              }}
              data-testid="button-book-agrotourism"
            >
              Reservar Agroturismo Vivencial <ArrowRight size={15} />
            </button>
            <span className="tour-note">Cupos reducidos para preservar el equilibrio ecológico.</span>
          </div>
        </section>
      </div>

      <Footer />

      {/* Modal Interactivo de Reserva de Agroturismo */}
      {booking && (
        <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) setBooking(false); }}>
          <div className="modal-card booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
            <button
              className="modal-close"
              onClick={() => setBooking(false)}
              aria-label="Cerrar reserva"
              data-testid="button-close-booking"
            >
              <X size={19} />
            </button>
            {booked ? (
              <div className="success-state">
                <span className="success-icon">
                  <Check size={25} />
                </span>
                <p className="eyebrow">Solicitud de Reserva Registrada</p>
                <h2 className="serif">¡Te esperamos en el Bosque!</h2>
                <p>
                  Hemos reservado tu itinerario para <b>{visitors} {visitors === 1 ? 'visitante' : 'visitantes'}</b> con fecha tentativa <b>{visitDate}</b> en <b>{lot.cooperative}</b>.
                  El coordinador comunitario se comunicará para brindarte las recomendaciones de viaje fluvial y vestimenta.
                </p>
                <button className="button button-dark" onClick={() => setBooking(false)} data-testid="button-done-booking">
                  Entendido <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <span className="booking-symbol">
                  <Compass size={24} />
                </span>
                <p className="eyebrow">Agroturismo Comunitario TrazAmazon</p>
                <h2 id="booking-title" className="serif">Reservar Experiencia</h2>
                <p className="modal-intro">
                  Coordina tu visita a la cuenca de {lot.cooperative} ({lot.region}).
                </p>
                <form className="quote-form" onSubmit={handleBookingSubmit}>
                  <label>
                    Tu Nombre Completo
                    <input required placeholder="Ej. Carlos Mendoza" data-testid="input-booking-name" />
                  </label>
                  <label>
                    Correo Electrónico de Contacto
                    <input type="email" required placeholder="carlos@correo.com" data-testid="input-booking-email" />
                  </label>
                  <label>
                    Fecha Tentativa de Visita
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      data-testid="input-booking-date"
                    />
                  </label>
                  <div className="guest-control">
                    <div>
                      <b>Número de Visitantes</b>
                      <span>Máximo 10 personas por grupo</span>
                    </div>
                    <div className="stepper">
                      <button
                        type="button"
                        onClick={() => setVisitors(Math.max(1, visitors - 1))}
                        aria-label="Quitar persona"
                        data-testid="button-remove-guest"
                      >
                        <Minus size={14} />
                      </button>
                      <strong>{visitors}</strong>
                      <button
                        type="button"
                        onClick={() => setVisitors(Math.min(10, visitors + 1))}
                        aria-label="Agregar persona"
                        data-testid="button-add-guest"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button className="button button-dark button-wide" type="submit" data-testid="button-submit-booking">
                    Confirmar Solicitud de Reserva <Send size={15} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <SampleQuoteDialog lot={selectedLot} onClose={() => setSelectedLot(null)} />
    </main>
  );
}

/**
 * VISTA 3: App Móvil de Campo Offline-First
 */
function FieldApp() {
  const [online, setOnline] = useState(true);
  const [records, setRecords] = useState<LocalHarvestRecord[]>(loadLocalRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados del Formulario Modal de Cosecha
  const [formFruit, setFormFruit] = useState<'Cacao' | 'Café' | 'Castaña' | 'Aguaje' | 'Copoazú'>('Cacao');
  const [formWeight, setFormWeight] = useState('');
  const [formCoords, setFormCoords] = useState('');
  const [formPhoto, setFormPhoto] = useState('');

  // Estados de Sincronización
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');

  // Persistir en almacenamiento local cada vez que cambien los registros
  useEffect(() => {
    localStorage.setItem('trazamazon-harvest-records', JSON.stringify(records));
  }, [records]);

  const pendingCount = records.filter((r) => r.syncStatus === 'pending').length;
  const syncStateLabel = !online
    ? '🔴 Modo Sin Señal (Parcela)'
    : pendingCount > 0
    ? `🟡 ${pendingCount} ${pendingCount === 1 ? 'lote pendiente' : 'lotes pendientes'} en caché local`
    : '🟢 Sincronizado con Supabase';

  /**
   * Simula la auto-captura de coordenadas GPS de alta precisión en parcela
   */
  const handleCaptureGPS = () => {
    const simulatedLat = (-12.4667 + (Math.random() - 0.5) * 0.005).toFixed(4);
    const simulatedLng = (-69.2000 + (Math.random() - 0.5) * 0.005).toFixed(4);
    setFormCoords(`${simulatedLat}°, ${simulatedLng}° (±3.2m GPS)`);
  };

  /**
   * Manejador de subida de fotografía de cosecha
   */
  const handlePhotoUpload = (e: FormEvent<HTMLInputElement>) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormPhoto(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  /**
   * Guarda un nuevo registro en la base de datos local (Dexie.js / IndexedDB)
   */
  const handleSaveHarvest = (e: FormEvent) => {
    e.preventDefault();
    if (!formWeight || Number(formWeight) <= 0) return;

    const newRecord: LocalHarvestRecord = {
      id: `HR-${Date.now().toString().slice(-6)}`,
      fruit: formFruit,
      estimatedKg: Number(formWeight),
      coordinates: formCoords || "12° 28' S, 69° 12' W (±3.2m GPS)",
      photoPreview: formPhoto,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    setRecords((prev) => [newRecord, ...prev]);

    setFormWeight('');
    setFormCoords('');
    setFormPhoto('');
    setIsModalOpen(false);

    setSyncMessage(`Lote ${newRecord.id} guardado en caché local.`);
    window.setTimeout(() => setSyncMessage(''), 3500);
  };

  /**
   * Simula la sincronización hacia Supabase Cloud PostgreSQL + PostGIS
   */
  const handleSyncToSupabase = () => {
    if (!online) {
      setSyncMessage('⚠️ Conecta el dispositivo a internet para sincronizar con la nube.');
      window.setTimeout(() => setSyncMessage(''), 3500);
      return;
    }

    if (pendingCount === 0) {
      setSyncMessage('✅ Todos los lotes locales ya están sincronizados en Supabase.');
      window.setTimeout(() => setSyncMessage(''), 3500);
      return;
    }

    setIsSyncing(true);
    setSyncProgress(25);

    const step1 = setTimeout(() => setSyncProgress(65), 500);
    const step2 = setTimeout(() => setSyncProgress(90), 1000);
    const step3 = setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      setRecords((prev) =>
        prev.map((r) =>
          r.syncStatus === 'pending'
            ? { ...r, syncStatus: 'synced', cloudHash: `0x${Math.random().toString(16).slice(2, 10)}` }
            : r
        )
      );
      setSyncMessage(`🟢 Sincronización exitosa: ${pendingCount} lotes subidos a Supabase Cloud con hash QR.`);
      window.setTimeout(() => {
        setSyncMessage('');
        setSyncProgress(0);
      }, 4500);
    }, 1500);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  return (
    <main className="field-page grain">
      <PrototypeFloatingNav />

      {/* Topbar de la App de Campo */}
      <div className="field-topbar">
        <Brand />
        <Link href="/" className="field-exit" data-testid="link-field-home">
          <ArrowLeft size={15} /> Salir al Portal Web
        </Link>
      </div>

      <div className="field-layout">
        {/* Panel Explicativo a la izquierda en pantallas grandes */}
        <div className="field-explainer">
          <p className="eyebrow">
            <span className="eyebrow-line" /> MÓDULO OFFLINE-FIRST (PWA / DEXIE.JS)
          </p>
          <h1 className="serif">
            Registra cosechas<br />
            <em>en plena selva.</em>
          </h1>
          <p>
            Diseñada especialmente para los pequeños agricultores y comités de trazabilidad de las cooperativas.
            Permite la toma de datos biométricos, peso y coordenadas satelitales en zonas con nula cobertura celular.
          </p>

          <div className="field-benefits">
            <div>
              <span>
                <CloudOff size={17} />
              </span>
              <div>
                <b>Almacenamiento Local Transaccional</b>
                <small>IndexedDB / Dexie.js garantiza que ningún dato se pierda en campo.</small>
              </div>
            </div>
            <div>
              <span>
                <LocateFixed size={17} />
              </span>
              <div>
                <b>Captura Automática de GPS</b>
                <small>Georreferenciación precisa del polígono de cosecha.</small>
              </div>
            </div>
            <div>
              <span>
                <CloudUpload size={17} />
              </span>
              <div>
                <b>Sincronización P2P o Nube</b>
                <small>Volcado automático a Supabase PostGIS al detectar conectividad.</small>
              </div>
            </div>
          </div>

          <div className="field-local-note">
            <Info size={16} />
            <span>
              <b>Modo Prototipo Interactivo:</b>
              <br />
              Puedes alternar el interruptor de red para simular el paso de estar sin cobertura en la selva a recuperar señal en la sede comunal.
            </span>
          </div>
        </div>

        {/* Marco de Teléfono Smartphone Estilizado */}
        <div className="phone-shell">
          <div className="phone-frame">
            <div className="phone-island" />
            <div className="phone-screen">
              {/* Barra de Estado del Smartphone */}
              <div className="phone-status">
                <span>09:41</span>
                <span className="phone-status-icons">
                  <span />
                  {online ? <Wifi size={13} className="text-[#2d6a4f]" /> : <WifiOff size={13} className="text-amber-600" />}
                  <span className="battery">
                    <i />
                  </span>
                </span>
              </div>

              {/* Cabecera del Productor */}
              <div className="field-app-header">
                <div>
                  <span className="app-kicker">TRAZAMAZON CAMPO V2.4</span>
                  <h2>Buen día, María</h2>
                  <p>Asociación Bosque Vivo · Pariamanu</p>
                </div>
                <div className="profile-dot">MQ</div>
              </div>

              {/* Tarjeta de Perfil del Productor con Sello Digital */}
              <section className="producer-profile" aria-label="Perfil de la productora">
                <img src={`${import.meta.env.BASE_URL}producer-maria-illustration.jpg`} alt="Productora María Quispe" />
                <div className="producer-profile-copy">
                  <span className="app-kicker">SOCIA CERTIFICADA</span>
                  <b>María Quispe Huamán</b>
                  <small>Parcela Shihuahuaco #12 · 4.8 ha</small>
                </div>
                <div className="producer-seal">
                  <ShieldCheck size={14} />
                  <span>Cero Deforestación TrazAmazon Verificada</span>
                </div>
              </section>

              {/* Fila de Estado de Conexión con Toggle Manual */}
              <div className="field-status-row">
                <div
                  className={`record-status ${!online ? 'status-offline' : pendingCount > 0 ? 'status-pending' : 'status-synced'}`}
                  role="status"
                  data-testid="status-local-sync"
                >
                  <span className="record-status-icon">
                    {!online ? <WifiOff size={15} /> : pendingCount > 0 ? <CloudOff size={15} /> : <CheckCircle2 size={15} />}
                  </span>
                  <span>
                    <b>{syncStateLabel}</b>
                    <small>
                      {!online
                        ? 'Los nuevos registros se guardarán en caché local.'
                        : pendingCount > 0
                        ? 'Listo para subir a Supabase Cloud.'
                        : 'Base de datos sincronizada.'}
                    </small>
                  </span>
                </div>

                <button
                  onClick={() => setOnline(!online)}
                  className={`connectivity ${online ? 'is-online' : 'is-offline'}`}
                  aria-pressed={online}
                  aria-label="Alternar modo de conexión"
                  data-testid="toggle-connectivity"
                >
                  <span className="connectivity-icon">
                    {online ? <Wifi size={13} /> : <WifiOff size={13} />}
                  </span>
                  <span>
                    <b>{online ? 'Con señal' : 'Sin señal'}</b>
                    <small>Toggle test</small>
                  </span>
                  <span className={`switch ${online ? 'switch-on' : ''}`}>
                    <i />
                  </span>
                </button>
              </div>

              {/* Botón Principal: NUEVO REGISTRO EN PARCELA */}
              <button
                className="btn-new-harvest"
                onClick={() => setIsModalOpen(true)}
                data-testid="button-new-harvest"
              >
                <Plus size={16} /> ➕ Nuevo Registro en Parcela
              </button>

              {/* Barra de Progreso de Sincronización */}
              {isSyncing && (
                <div className="sync-progress-container">
                  <div className="flex justify-between items-center text-[8px] text-[#2d6a4f] font-semibold">
                    <span className="flex items-center gap-1">
                      <RefreshCw size={10} className="animate-spin" /> Subiendo a Supabase PostGIS...
                    </span>
                    <span>{syncProgress}%</span>
                  </div>
                  <div className="sync-progress-bar-bg">
                    <div className="sync-progress-bar-fill" style={{ width: `${syncProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Mensajes de Notificación */}
              {syncMessage && (
                <div className="sync-message" role="status" data-testid="status-sync-message">
                  <CheckCircle2 size={14} className="text-[#2d6a4f]" />
                  <span>{syncMessage}</span>
                </div>
              )}

              {/* Cabecera de Lotes Locales en Caché */}
              <div className="recent-head">
                <div>
                  <p className="app-kicker">MEMORIA LOCAL (INDEXEDDB)</p>
                  <h3>
                    Lotes en Caché <span>{records.length}</span>
                  </h3>
                </div>
                <button
                  className="sync-button"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                  data-testid="button-sync-records"
                >
                  <CloudUpload size={13} /> Sincronizar {pendingCount > 0 && <span>{pendingCount}</span>}
                </button>
              </div>

              {/* Lista Interactiva de Lotes Locales */}
              {records.length > 0 ? (
                <div className="record-list">
                  {records.map((r) => (
                    <div className="record-row" key={r.id} data-testid={`record-harvest-${r.id}`}>
                      <div className="record-fruit-mark">
                        {r.fruit === 'Café' ? <Coffee size={15} /> : <Leaf size={15} />}
                      </div>
                      <div className="record-content">
                        <b>
                          {r.estimatedKg} kg · {r.fruit}
                        </b>
                        <small>
                          {new Date(r.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} · {r.coordinates}
                        </small>
                      </div>
                      <span
                        className={`record-sync ${r.syncStatus === 'synced' ? 'record-synced' : ''}`}
                        title={r.syncStatus === 'synced' ? `Sincronizado: ${r.cloudHash || 'OK'}` : 'Pendiente en caché local'}
                      >
                        {r.syncStatus === 'synced' ? <Check size={12} /> : <Clock size={12} />}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-records">
                  <span>
                    <Sprout size={18} />
                  </span>
                  <div>
                    <b>No hay lotes en memoria</b>
                    <small>Usa el botón de arriba para registrar tu primera cosecha.</small>
                  </div>
                </div>
              )}

              {/* Barra de Navegación Inferior de la App Móvil */}
              <div className="phone-nav">
                <span className="phone-nav-active">
                  <Leaf size={16} />
                  Cosechas
                </span>
                <span onClick={() => handleSyncToSupabase()} className="cursor-pointer">
                  <CloudUpload size={16} />
                  Sincronizar
                </span>
                <span onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                  <Plus size={16} />
                  Registrar
                </span>
              </div>

              {/* MODAL INTERACTIVO DE REGISTRO EN PARCELA */}
              {isModalOpen && (
                <div className="field-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                  <div className="field-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="modal-harvest-title">
                    <div className="field-modal-header">
                      <h3 id="modal-harvest-title">
                        <Sprout size={18} className="text-[#2d6a4f]" /> Registrar Cosecha
                      </h3>
                      <button
                        className="field-modal-close"
                        onClick={() => setIsModalOpen(false)}
                        aria-label="Cerrar modal"
                        data-testid="button-close-harvest-modal"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveHarvest} className="harvest-form">
                      {/* Tipo de Fruto */}
                      <label className="app-field">
                        <span>TIPO DE FRUTO</span>
                        <select
                          value={formFruit}
                          onChange={(e) => setFormFruit(e.target.value as any)}
                          data-testid="select-harvest-fruit"
                        >
                          <option value="Cacao">Cacao Nativo Chuncho / Criollo</option>
                          <option value="Café">Café de Sombra Especial</option>
                          <option value="Castaña">Castaña Amazónica Silvestre</option>
                          <option value="Copoazú">Copoazú Silvestre</option>
                          <option value="Aguaje">Aguaje Silvestre</option>
                        </select>
                        <ChevronDown size={14} />
                      </label>

                      {/* Peso Estimado en kg */}
                      <label className="app-field">
                        <span>PESO ESTIMADO (KG)</span>
                        <div className="weight-input">
                          <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={formWeight}
                            onChange={(e) => setFormWeight(e.target.value)}
                            placeholder="Ej. 150.0"
                            required
                            aria-label="Peso estimado en kg"
                            data-testid="input-harvest-kg"
                          />
                          <b>kg</b>
                        </div>
                      </label>

                      {/* Captura de Coordenadas GPS */}
                      <div className="capture-row">
                        <div className="capture-copy">
                          <span className="capture-icon">
                            <MapPin size={15} />
                          </span>
                          <span>
                            <b>Coordenadas Parcela</b>
                            <small>{formCoords || 'Presiona para capturar satélite'}</small>
                          </span>
                        </div>
                        <button
                          type="button"
                          className="capture-button"
                          onClick={handleCaptureGPS}
                          data-testid="button-capture-gps"
                        >
                          {formCoords ? 'Recapturar' : 'Capturar GPS'} <LocateFixed size={12} />
                        </button>
                      </div>

                      {/* Subida de Fotografía */}
                      <label className={`photo-upload ${formPhoto ? 'has-photo' : ''}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          aria-label="Cargar foto de la cosecha"
                          data-testid="input-harvest-photo"
                        />
                        {formPhoto ? (
                          <>
                            <img src={formPhoto} alt="Vista previa de cosecha" />
                            <span className="photo-upload-label">
                              <Check size={13} /> Foto adjuntada (Cambiar)
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="upload-icon">
                              <Upload size={15} />
                            </span>
                            <span>
                              <b>Foto de la Cosecha en Parcela</b>
                              <small>Toca para abrir cámara o galería</small>
                            </span>
                            <ArrowUpRight size={14} />
                          </>
                        )}
                      </label>

                      {/* Botón de Guardado Local */}
                      <button type="submit" className="save-harvest" data-testid="button-save-harvest">
                        <Check size={15} /> Guardar en Memoria Local (Offline)
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
            <div className="phone-home-indicator" />
          </div>
          <div className="phone-caption">
            <span>MODO OFFLINE · INDEXEDDB</span>
            <span>PRODUCCIÓN V2.4</span>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

/**
 * Enrutador con Manejador de Error Dinámico
 */
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

/**
 * Componente Raíz de la Aplicación TrazAmazon
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/marketplace" component={Marketplace} />
              <Route path="/lote/:id" component={LotDetail} />
              <Route path="/app" component={FieldApp} />
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
