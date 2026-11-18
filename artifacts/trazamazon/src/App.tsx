import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Calendar, Check, CheckCircle2,
  ChevronDown, CircleDot, Clock, Cloud, CloudOff, CloudUpload, Coffee, Compass, Download,
  Eye, Filter, Globe2, Handshake, Heart, Info, Layers, Leaf, LocateFixed, MapPin, Menu,
  Minus, PackageCheck, Plus, QrCode, RefreshCw, Search, Send, ShieldCheck, Smartphone,
  Sparkles, Sprout, TreePine, Upload, Wifi, WifiOff, X
} from 'lucide-react';

const queryClient = new QueryClient();

/**
 * Entidad de Lote de Producto Agrícola Amazónico
 */
export type ProductLot = {
  id: string;
  fruit: 'Cacao' | 'Café' | 'Castaña' | 'Aguaje';
  name: string;
  cooperative: string;
  region: string;
  price: number;
  minimumVolume: number;
  certifications: string[];
  image: string;
  harvestDate: string;
  farmerName: string;
  farmerImage: string;
  coordinates: string;
  story: string;
  ndviScore: number;
  lotHash?: string;
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
 * Catálogo maestro de lotes amazónicos verificados
 */
const initialLots: ProductLot[] = [
  {
    id: 'TA-0427',
    fruit: 'Cacao',
    name: 'Cacao Nativo Chuncho · Aroma Fino',
    cooperative: 'Asociación Bosque Vivo',
    region: 'Madre de Dios',
    price: 8.5,
    minimumVolume: 500,
    certifications: ['Sin deforestación', 'Orgánico', 'Satélite Validado'],
    image: `${import.meta.env.BASE_URL}amazon-cacao-hero.jpg`,
    harvestDate: '18 May 2027',
    farmerName: 'María Quispe',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-illustration.jpg`,
    coordinates: '12°35′24″ S · 69°11′42″ W',
    ndviScore: 0.89,
    story: 'Cultivado bajo dosel primario de castañales y shihuahuacos en Pariamanu. Fermentado en cajas de madera nativa que acentúan notas a ciruela y flores silvestres.',
    lotHash: '0x7e4a18f9c21b38e0'
  },
  {
    id: 'TA-0319',
    fruit: 'Café',
    name: 'Café de Sombra Geisha · Lavado',
    cooperative: 'Cooperativa Alto Tambopata',
    region: 'Puno',
    price: 11.2,
    minimumVolume: 300,
    certifications: ['Sin deforestación', 'Orgánico', 'Comercio justo'],
    image: `${import.meta.env.BASE_URL}coffee.jpg`,
    harvestDate: '02 Jun 2027',
    farmerName: 'Luis Mamani',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-illustration.jpg`,
    coordinates: '13°06′15″ S · 69°36′08″ W',
    ndviScore: 0.92,
    story: 'Madurado a 1,650 msnm bajo sombra de pacae y nogales. Proceso de lavado artesanal con agua de deshielo y secado en camas africanas.',
    lotHash: '0x3c9d74a10e82f5b6'
  },
  {
    id: 'TA-0186',
    fruit: 'Castaña',
    name: 'Castaña Amazónica Silvestre Seleccionada',
    cooperative: 'Recolectores de Tambopata',
    region: 'Madre de Dios',
    price: 6.8,
    minimumVolume: 250,
    certifications: ['Sin deforestación', 'Comunidad forestal'],
    image: `${import.meta.env.BASE_URL}nuts.jpg`,
    harvestDate: '11 Abr 2027',
    farmerName: 'Elena Huamán',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-portrait.jpg`,
    coordinates: '12°49′50″ S · 69°18′33″ W',
    ndviScore: 0.95,
    story: 'Recolectada a mano en concesiones de bosque primario sin tala. Cada coco de castaña cae libremente y su aprovechamiento protege 1,200 hectáreas de selva virgen.',
    lotHash: '0x992b41f802ca3e77'
  },
  {
    id: 'TA-0274',
    fruit: 'Aguaje',
    name: 'Aguaje Silvestre de Palmera en Pie',
    cooperative: 'Comunidad Nativa Tres Islas',
    region: 'Loreto',
    price: 4.9,
    minimumVolume: 200,
    certifications: ['Sin deforestación', 'Comunidad forestal', 'Satélite Validado'],
    image: `${import.meta.env.BASE_URL}aguaje.jpg`,
    harvestDate: '26 May 2027',
    farmerName: 'Rosa Soria',
    farmerImage: `${import.meta.env.BASE_URL}producer-maria-portrait.jpg`,
    coordinates: '04°13′11″ S · 73°16′45″ W',
    ndviScore: 0.91,
    story: 'Cosechado mediante arneses de ascenso vertical sin talar la palmera aguaje hembra. Protege el ecosistema de aguajales, el mayor sumidero de carbono de la Amazonía.',
    lotHash: '0x15f7c32a9d846e20'
  }
];

/**
 * Carga registros persistidos en el almacenamiento local del navegador
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
  // Registros de muestra precargados para la demostración
  return [
    {
      id: 'HR-849102',
      fruit: 'Cacao',
      estimatedKg: 185.5,
      coordinates: '12°35′24″ S, 69°11′42″ W',
      photoPreview: '',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      syncStatus: 'pending'
    },
    {
      id: 'HR-849089',
      fruit: 'Café',
      estimatedKg: 92.0,
      coordinates: '13°06′15″ S, 69°36′08″ W',
      photoPreview: '',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      syncStatus: 'synced',
      cloudHash: '0x9f1a2384'
    },
    {
      id: 'HR-848911',
      fruit: 'Castaña',
      estimatedKg: 240.0,
      coordinates: '12°49′50″ S, 69°18′33″ W',
      photoPreview: '',
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      syncStatus: 'synced',
      cloudHash: '0x5b77c10d'
    }
  ];
}

/**
 * Barra Flotante Global de Demostración para evaluación rápida del prototipo
 */
function PrototypeFloatingNav() {
  const [location] = useLocation();

  return (
    <nav className="floating-prototype-nav" aria-label="Navegación Rápida del Prototipo">
      <span className="nav-pill-badge" title="Impact Startup Competition 2027">
        <Sparkles size={11} /> Impact 2027
      </span>
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
            <span className="live-dot" /> Trazabilidad Satelital Activa
          </span>
          <Link href="/marketplace" className="button button-dark button-small" data-testid="button-source">
            Explorar Lotes <ArrowUpRight size={15} />
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
            Marketplace B2B
          </Link>
          <Link href="/lote/TA-0427" data-testid="footer-qr">
            Visor Trazabilidad QR
          </Link>
          <Link href="/app" data-testid="footer-field-app">
            App de Campo Offline
          </Link>
          <a href="mailto:contacto@trazamazon.org">Contacto Cooperativas</a>
        </div>
        <div className="footer-place">
          <MapPin size={15} /> Puerto Maldonado · Madre de Dios, Perú
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2027 TrazAmazon · Desafío Amazonía Viva · Impact Startup Competition</span>
        <span>Acreditación Cero Deforestación vía Sentinel-2 / PostGIS</span>
      </div>
    </footer>
  );
}

/**
 * Etiqueta de Certificación Ambiental
 */
function Tag({ children, earth = false }: { children: ReactNode; earth?: boolean }) {
  return <span className={`tag ${earth ? 'tag-earth' : ''}`}>{children}</span>;
}

/**
 * Tarjeta de Producto B2B con Acciones Duales: Trazabilidad QR y Cotización
 */
function ProductCard({ lot, onQuote }: { lot: ProductLot; onQuote: (lot: ProductLot) => void }) {
  return (
    <article className="product-card" data-testid={`card-product-${lot.id}`}>
      <Link href={`/lote/${lot.id}`} className="product-photo-link" data-testid={`link-lot-${lot.id}`}>
        <img className="product-image" src={lot.image} alt={lot.name} loading="lazy" />
        <span className="photo-label">
          <CircleDot size={12} /> Lote {lot.id}
        </span>
        <span className="photo-arrow">
          <ArrowUpRight size={17} />
        </span>
      </Link>
      <div className="product-info">
        <div className="product-kicker">
          {lot.fruit}
          <span>·</span>
          {lot.region}
        </div>
        <Link href={`/lote/${lot.id}`} className="product-name" data-testid={`link-product-name-${lot.id}`}>
          {lot.name}
        </Link>
        <div className="product-coop">
          <span className="coop-mark">{lot.cooperative.slice(0, 1)}</span>
          {lot.cooperative}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {lot.certifications.map((c) => (
            <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-[#e8eee4] text-[#2d6a4f] font-semibold flex items-center gap-1">
              <ShieldCheck size={10} /> {c}
            </span>
          ))}
        </div>
        <div className="product-foot">
          <div>
            <strong>${lot.price.toFixed(2)}</strong>
            <span>/ kg · min. {lot.minimumVolume} kg</span>
          </div>
          <div className="product-card-actions">
            <Link href={`/lote/${lot.id}`} className="btn-card-trace" title="Ver trazabilidad satelital y QR">
              <QrCode size={13} /> Trazabilidad
            </Link>
            <button
              className="btn-card-quote"
              title="Solicitar cotización"
              onClick={() => onQuote(lot)}
              data-testid={`button-quote-${lot.id}`}
            >
              <Send size={12} /> Cotizar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Modal Interactivo para Solicitar Cotización B2B
 */
function QuoteDialog({ lot, onClose }: { lot: ProductLot | null; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [volume, setVolume] = useState('500–2.000 kg');

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
        <button className="modal-close" onClick={onClose} aria-label="Cerrar cotización" data-testid="button-close-quote">
          <X size={19} />
        </button>
        {sent ? (
          <div className="success-state">
            <span className="success-icon">
              <Check size={25} />
            </span>
            <p className="eyebrow">Solicitud Enviada a la Cooperativa</p>
            <h2 className="serif">Conexión Directa Establecida</h2>
            <p>
              Hemos canalizado tu interés por el lote <b>{lot.id} ({lot.name})</b> a <b>{lot.cooperative}</b>.
              El equipo de comercialización confirmará la disponibilidad y el certificado de Cero Deforestación.
            </p>
            <button className="button button-dark" onClick={onClose} data-testid="button-done-quote">
              Volver al Catálogo <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Marketplace B2B Directo</p>
            <h2 id="quote-title" className="serif">Solicitar Cotización</h2>
            <p className="modal-intro">
              Conexión directa con {lot.cooperative} para el lote {lot.id}. Precio base: ${lot.price.toFixed(2)}/kg.
            </p>
            <form onSubmit={handleSubmit} className="quote-form">
              <label>
                Nombre del Comprador / Empresa
                <input
                  required
                  placeholder="Ej. Chocolatería Artesanal S.A."
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  data-testid="input-quote-name"
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
              <label>
                Volumen Requerido
                <select
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  data-testid="select-quote-volume"
                >
                  <option value="500 kg (Volumen de prueba)">500 kg (Volumen de prueba)</option>
                  <option value="500–2.000 kg">500–2.000 kg</option>
                  <option value="2.000–10.000 kg">2.000–10.000 kg</option>
                  <option value="Contenedor completo (18+ Toneladas)">Contenedor completo (18+ Toneladas)</option>
                </select>
              </label>
              <button className="button button-dark button-wide" type="submit" data-testid="button-submit-quote">
                Enviar Solicitud a Origen <Send size={15} />
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
  const [quote, setQuote] = useState<ProductLot | null>(null);

  return (
    <main className="grain">
      <PrototypeFloatingNav />
      <Header active="home" />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content page-in">
          <div className="eyebrow hero-eyebrow">
            <span className="eyebrow-line" /> IMPACT STARTUP COMPETITION 2027 · AMAZONÍA VIVA
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
              Explorar Marketplace B2B <ArrowRight size={16} />
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
              <strong>4 Cooperativas Pioneras</strong>
              <br />
              Trazabilidad satelital sin intermediarios
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
          TRAZABILIDAD SATELITAL <span>·</span> 12°35′ S / 69°11′ W
        </div>
      </section>

      {/* Ticker de Productos y Bioeconomía */}
      <section className="ticker" aria-label="Líneas de producción amazónica">
        <div className="ticker-inner">
          <span>BIOECONOMÍA AMAZÓNICA CIRCULAR</span>
          <i /> CACAO NATIVO
          <i /> CAFÉ DE SOMBRA
          <i /> CASTAÑA SILVESTRE
          <i /> AGUAJE DE PALMERA VIVA
          <i /> RUTAS DE AGROTURISMO COMUNITARIO
          <i /> ACREDITACIÓN SENTINEL-2
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
            Ver catálogo completo ({initialLots.length} lotes) <ArrowRight size={15} />
          </Link>
        </div>
        <div className="product-grid">
          {initialLots.slice(0, 3).map((lot) => (
            <ProductCard key={lot.id} lot={lot} onQuote={setQuote} />
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
            <h3 className="serif">18,500 ha protegidas.</h3>
            <p>La recolección silvestre y los sistemas agroforestales otorgan mayor valor económico al bosque vivo que a la tala.</p>
          </article>
        </div>

        {/* Banda de Objetivos de Desarrollo Sostenible (ODS) */}
        <div className="ods-band">
          <div className="ods-label">
            <span>AGENDA 2030</span>
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

      {/* Banner de App de Campo */}
      <section className="field-banner">
        <div className="field-visual">
          <div className="field-phone-mini">
            <div className="phone-speaker" />
            <div className="mini-status">
              <span>09:41</span>
              <WifiOff size={12} />
            </div>
            <div className="mini-greeting">
              Buen día,<br />
              <b>María</b>
            </div>
            <div className="mini-record">
              <Leaf size={15} />
              <span>Nuevo Registro Parcela</span>
              <Plus size={13} />
            </div>
            <div className="mini-sync">
              <span />
              <span />
              <span />
            </div>
          </div>
          <span className="field-visual-note">OFFLINE-FIRST EN PARCELA</span>
        </div>
        <div className="field-copy">
          <p className="eyebrow">Tecnología Diseñada para la Selva</p>
          <h2 className="serif">
            ¿Sin señal celular?<br />
            <em>La cosecha no se detiene.</em>
          </h2>
          <p>
            El productor captura coordenadas GPS satelitales, peso en kilogramos y fotografía de la cosecha.
            Los datos se resguardan en IndexedDB localmente y se sincronizan de forma transparente al recuperar conexión.
          </p>
          <Link href="/app" className="button button-dark" data-testid="button-open-field-app">
            Abrir Simulador de App de Campo <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
      <QuoteDialog lot={quote} onClose={() => setQuote(null)} />
    </main>
  );
}

/**
 * VISTA 1 (Extensión): Marketplace B2B con Filtros Funcionales
 */
function Marketplace() {
  const [query, setQuery] = useState('');
  const [fruit, setFruit] = useState('Todos los frutos');
  const [region, setRegion] = useState('Todas las regiones');
  const [certOnly, setCertOnly] = useState(false);
  const [quote, setQuote] = useState<ProductLot | null>(null);

  const filteredLots = useMemo(() => {
    return initialLots.filter((lot) => {
      const matchFruit = fruit === 'Todos los frutos' || lot.fruit === fruit;
      const matchRegion = region === 'Todas las regiones' || lot.region === region;
      const matchCert = !certOnly || lot.certifications.includes('Sin deforestación');
      const matchText =
        !query ||
        `${lot.name} ${lot.fruit} ${lot.cooperative} ${lot.region}`.toLowerCase().includes(query.toLowerCase());
      return matchFruit && matchRegion && matchCert && matchText;
    });
  }, [query, fruit, region, certOnly]);

  const clearFilters = () => {
    setQuery('');
    setFruit('Todos los frutos');
    setRegion('Todas las regiones');
    setCertOnly(false);
  };

  return (
    <main className="grain">
      <PrototypeFloatingNav />
      <Header active="marketplace" />

      {/* Encabezado del Marketplace */}
      <section className="market-hero page-in">
        <div className="market-hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" /> MARKETPLACE B2B SOSTENIBLE
          </p>
          <h1 className="serif">
            Cosechas amazónicas<br />
            <em>con trazabilidad</em> comprobada.
          </h1>
          <p>
            Venta directa por volumen para tostadores, chocolaterías y empresas de cosmética bioética.
            Cada lote incluye expediente georreferenciado y garantía de cero deforestación.
          </p>
        </div>
        <div className="market-summary">
          <div className="summary-count">{initialLots.length.toString().padStart(2, '0')}</div>
          <div>
            <b>Lotes Verificados</b>
            <span>Madre de Dios, Puno, Loreto</span>
          </div>
          <div className="summary-symbol">
            <Leaf size={25} />
          </div>
        </div>
      </section>

      {/* Barra de Filtros y Búsqueda */}
      <section className="market-content">
        <div className="market-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar por fruto, cooperativa o región (ej. Cacao, Pariamanu)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar productos"
              data-testid="input-search-products"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda" data-testid="button-clear-search">
                <X size={15} />
              </button>
            )}
          </div>
          <span className="results-count">
            <b>{filteredLots.length}</b> lotes disponibles
          </span>
        </div>

        {/* Fila de Filtros Interactivos */}
        <div className="filter-row">
          <div className="filter-label">
            <Filter size={15} /> FILTROS:
          </div>

          <label className="select-wrap">
            <span>FRUTO</span>
            <select
              value={fruit}
              onChange={(e) => setFruit(e.target.value)}
              aria-label="Filtrar por fruto"
              data-testid="select-filter-fruit"
            >
              <option>Todos los frutos</option>
              <option>Cacao</option>
              <option>Café</option>
              <option>Castaña</option>
              <option>Aguaje</option>
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="select-wrap">
            <span>REGIÓN</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label="Filtrar por región"
              data-testid="select-filter-region"
            >
              <option>Todas las regiones</option>
              <option>Madre de Dios</option>
              <option>Puno</option>
              <option>Loreto</option>
              <option>Ucayali</option>
              <option>San Martín</option>
            </select>
            <ChevronDown size={14} />
          </label>

          <button
            onClick={() => setCertOnly(!certOnly)}
            className={`cert-toggle ${certOnly ? 'cert-active' : ''}`}
            aria-pressed={certOnly}
            data-testid="toggle-zero-deforestation"
          >
            <span className="toggle-check">{certOnly && <Check size={12} />}</span>
            <ShieldCheck size={15} /> Cero Deforestación
          </button>

          {(query || fruit !== 'Todos los frutos' || region !== 'Todas las regiones' || certOnly) && (
            <button onClick={clearFilters} className="clear-filters" data-testid="button-clear-filters">
              Restablecer filtros <X size={13} />
            </button>
          )}
        </div>

        {/* Grid de Productos */}
        {filteredLots.length > 0 ? (
          <div className="product-grid market-grid">
            {filteredLots.map((lot) => (
              <ProductCard key={lot.id} lot={lot} onQuote={setQuote} />
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <span className="empty-icon">
              <Search size={22} />
            </span>
            <h2 className="serif">No se encontraron lotes con estos filtros</h2>
            <p>Intenta seleccionar otro fruto o desmarcar los filtros para explorar las cosechas amazónicas disponibles.</p>
            <button className="button button-dark" onClick={clearFilters} data-testid="button-reset-filters">
              Restablecer filtros <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>

      {/* Nota de Acompañamiento B2B */}
      <section className="market-note">
        <div className="market-note-icon">
          <Handshake size={22} />
        </div>
        <div>
          <p className="eyebrow">Comercio B2B con Asistencia Logística</p>
          <h3 className="serif">Coordinación directa de puerto a destino.</h3>
          <p>
            TrazAmazon asiste a las cooperativas en el embalaje certificado, trámites aduaneros de exportación
            y emisión de certificados de no-deforestación requeridos por la normativa de la Unión Europea (EUDR).
          </p>
        </div>
        <Link href="/lote/TA-0427" className="text-link" data-testid="link-provenance-example">
          Ver expediente de lote <ArrowRight size={15} />
        </Link>
      </section>

      <Footer />
      <QuoteDialog lot={quote} onClose={() => setQuote(null)} />
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
  const [visitDate, setVisitDate] = useState('2027-07-15');
  const [quote, setQuote] = useState<ProductLot | null>(null);

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
          <ArrowLeft size={15} /> Volver al Marketplace B2B
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
              {lot.fruit} NATIVO <span>·</span> {lot.region}, PERÚ
            </p>
            <h1 className="serif">{lot.name}</h1>
            <p className="lot-intro-coop">
              <span className="coop-mark">{lot.cooperative[0]}</span>
              {lot.cooperative}
            </p>
            <p className="lot-price">
              <strong>${lot.price.toFixed(2)}</strong>
              <span>/ kg</span>
              <i>·</i>
              <span>Pedido mínimo {lot.minimumVolume} kg</span>
            </p>

            <div className="cert-list">
              {lot.certifications.map((c) => (
                <Tag key={c}>
                  <ShieldCheck size={13} /> {c}
                </Tag>
              ))}
              <Tag earth>
                <Layers size={13} /> NDVI: {lot.ndviScore} (Dosel Denso)
              </Tag>
            </div>

            <p className="lot-story-intro">{lot.story}</p>

            <div className="flex flex-col gap-2 mt-4">
              <button
                className="button button-dark button-wide"
                onClick={() => setQuote(lot)}
                data-testid="button-request-lot-quote"
              >
                Solicitar Cotización de este Lote <ArrowUpRight size={15} />
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
              En la cuenca del río Pariamanu, cada familia productora custodia su parcela dentro de concesiones de castaña y parcelas agroforestales.
              La cosecha de {lot.fruit.toLowerCase()} convive con árboles nativos centenarios y refugios de fauna silvestre.
            </p>

            <div className="farmer-card">
              <img
                className="farmer-avatar-image"
                src={lot.farmerImage}
                alt={`Fotografía de ${lot.farmerName}`}
              />
              <div>
                <b>{lot.farmerName}</b>
                <span>Productora Líder · {lot.cooperative}</span>
                <small>Insignia Digital TrazAmazon #0427-MQ</small>
              </div>
              <BadgeCheck size={20} className="text-[#2d6a4f]" />
            </div>

            <div className="mt-5 p-3.5 bg-[#f0eee4] border border-[#e1dfd4] rounded flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#2d6a4f]">
                <QrCode size={18} />
                <span className="font-mono text-[10px]">Hash: {lot.lotHash}</span>
              </div>
              <span className="text-[10px] text-[#6b766c] bg-[#e4ecde] px-2 py-0.5 rounded font-semibold">
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
                <span className="text-[7px] text-[#f7e6ce] absolute -top-3.5 left-1 font-mono">PARCELA 0427</span>
              </div>

              {/* Punto de Cosecha con Pulso */}
              <div className="pulse-target" title="Coordenadas GPS de cosecha" />

              {/* Badges de Información Satelital */}
              <div className="satellite-badge-group">
                <span className="satellite-status-pill">
                  <ShieldCheck size={11} /> Cero Deforestación 2024-2027
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
                  <small>Supabase Cloud PostgreSQL + PostGIS · Acreditado</small>
                </p>
              </div>
              <div>
                <span className="step-now">
                  <Leaf size={12} />
                </span>
                <p>
                  <b>Disponible en Marketplace B2B</b>
                  <small>Venta directa y trazabilidad abierta al consumidor</small>
                </p>
              </div>
            </div>
            <div className="provenance-foot">
              <ShieldCheck size={15} /> Acreditación oficial TrazAmazon · Desafío Amazonía Viva
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

      <QuoteDialog lot={quote} onClose={() => setQuote(null)} />
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
  const [formFruit, setFormFruit] = useState<'Cacao' | 'Café' | 'Castaña' | 'Aguaje'>('Cacao');
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
    // Coordenadas realistas de Madre de Dios / Tambopata
    const simulatedLat = (-12.5891 + (Math.random() - 0.5) * 0.005).toFixed(4);
    const simulatedLng = (-69.1950 + (Math.random() - 0.5) * 0.005).toFixed(4);
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
      coordinates: formCoords || '-12.5891°, -69.1950° (±3.2m GPS)',
      photoPreview: formPhoto,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Limpiar formulario y cerrar modal
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
      // Actualizar todos a synced y asignar hash de transacción
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

              {/* Botón Principal y Destacado: NUEVO REGISTRO EN PARCELA */}
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
                          <option value="Cacao">Cacao Nativo Chuncho</option>
                          <option value="Café">Café de Sombra</option>
                          <option value="Castaña">Castaña Amazónica</option>
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

                      {/* Subida o Selección de Fotografía */}
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
            <span>PROTOTIPO 2027</span>
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
