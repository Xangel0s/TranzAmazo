import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Award, BadgeCheck, Boxes, Building2, Camera, Check, CheckCircle2, Copy, Database, DollarSign, Droplets, Edit3, FileCode, FlaskConical, Image, LogOut, Mountain, Navigation, Thermometer,
  ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Cloud, CloudOff, CloudUpload,
  Coffee, Compass, Download, ExternalLink, Eye, FileCheck, FileText, Filter, Globe2, Handshake, Heart, Info,
  Layers, LayoutGrid, Leaf, List, LocateFixed, Lock, MapPin, Menu, Minus, PackageCheck,
  Play, Plus, QrCode, RefreshCw, Save, Search, Send, Settings, ShieldCheck, Ship, ShoppingCart, SlidersHorizontal,
  Smartphone, Sprout, Star, Store, TreePine, TrendingUp, Truck, Upload, User, Users, Wifi, WifiOff, X
} from 'lucide-react';
import {
  fetchCooperativeProfile,
  saveCooperativeProfile,
  defaultCooperativeProfile,
  type CooperativeProfile
} from './lib/supabase';

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
 * Sesión de Usuario (Autenticación B2B y Cooperativa)
 */
export interface UserSession {
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  organization: string;
  taxId?: string;
  countryOrRegion?: string;
}

interface AuthContextType {
  currentUser: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => {},
  logout: () => {},
  isAuthModalOpen: false,
  authModalTab: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('trazamazon-user-session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const login = (user: UserSession) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('trazamazon-user-session', JSON.stringify(user));
    } catch {}
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('trazamazon-user-session');
    } catch {}
  };

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      {isAuthModalOpen && <AuthModal />}
    </AuthContext.Provider>
  );
}

/**
 * Estructura de Cotización / Pedido B2B Sincronizado (Alibaba Trade Assurance)
 */
export interface B2BQuoteOrder {
  id: string;
  lotId: string;
  lotName: string;
  fruit: string;
  cooperative: string;
  buyerName: string;
  buyerOrg: string;
  buyerCountry: string;
  type: 'sample' | 'commercial_rfq';
  requestedKg: number;
  pricePerKg: number;
  totalUsd: number;
  status: 'submitted' | 'quoted' | 'sample_dispatched' | 'contract_locked';
  createdAt: string;
  trackingCode?: string;
  courier?: string;
  senasaGuide?: string;
  escrowStatus: 'pending' | 'funded' | 'released';
  notes?: string;
}

export const initialB2BOrders: B2BQuoteOrder[] = [
  {
    id: 'TA-ORD-881',
    lotId: 'TA-0427',
    lotName: 'Cacao Nativo Criollo de Aroma Fino',
    fruit: 'Cacao',
    cooperative: 'Asociación Bosque Vivo',
    buyerName: 'Alexandre Bonnat',
    buyerOrg: 'Valrhona Artisans B2B',
    buyerCountry: 'Francia',
    type: 'sample',
    requestedKg: 0.5,
    pricePerKg: 8.40,
    totalUsd: 0,
    status: 'sample_dispatched',
    createdAt: '16 May 2025 · 14:20',
    trackingCode: 'DHL-PE-7729104',
    courier: 'DHL Green Express',
    senasaGuide: 'SENASA-MDD-2025-0482',
    escrowStatus: 'funded',
    notes: 'Muestra técnica oficial de 500g en bolsa termosellada con precinto fitosanitario.'
  },
  {
    id: 'TA-ORD-882',
    lotId: 'TA-0319',
    lotName: 'Café de Sombra Altura · Lavado Anaeróbico',
    fruit: 'Café',
    cooperative: 'Coop. Agraria Cafetalera San Juan del Oro',
    buyerName: 'Alexandre Bonnat',
    buyerOrg: 'Valrhona Artisans B2B',
    buyerCountry: 'Francia',
    type: 'commercial_rfq',
    requestedKg: 2100,
    pricePerKg: 11.20,
    totalUsd: 23520,
    status: 'submitted',
    createdAt: '17 May 2025 · 09:45',
    escrowStatus: 'pending',
    notes: 'Requerimiento de 35 sacos GrainPro de 60kg para tostado de edición limitada.'
  },
  {
    id: 'TA-ORD-883',
    lotId: 'TA-0201',
    lotName: 'Aceite Virgen de Aguaje (Mauritia flexuosa)',
    fruit: 'Aguaje',
    cooperative: 'Asociación de Mujeres Defensoras del Aguajal',
    buyerName: 'Camille Laurent',
    buyerOrg: 'Laboratoires Botaniques Paris',
    buyerCountry: 'Francia',
    type: 'sample',
    requestedKg: 0.25,
    pricePerKg: 28.00,
    totalUsd: 0,
    status: 'quoted',
    createdAt: '18 May 2025 · 11:15',
    trackingCode: 'FEDEX-EXP-44021',
    courier: 'FedEx Priority',
    senasaGuide: 'SENASA-UCA-2025-0193',
    escrowStatus: 'pending',
    notes: 'Proforma aprobada con especificación de acidez libre < 0.8% y alto beta-caroteno.'
  },
  {
    id: 'TA-ORD-884',
    lotId: 'TA-0186',
    lotName: 'Castaña Amazónica Silvestre Pelada',
    fruit: 'Castaña',
    cooperative: 'Madre de Dios Castañeros',
    buyerName: 'Jens Hoffmann',
    buyerOrg: 'BioNuts GmbH',
    buyerCountry: 'Alemania',
    type: 'commercial_rfq',
    requestedKg: 4500,
    pricePerKg: 6.75,
    totalUsd: 30375,
    status: 'contract_locked',
    createdAt: '14 May 2025 · 16:30',
    trackingCode: 'HAPAG-LLOYD-FCL-4412',
    courier: 'Naviera Hapag-Lloyd (FCL 20ft)',
    senasaGuide: 'SENASA-CALLAO-EXP-9921',
    escrowStatus: 'funded',
    notes: 'Contrato comercial formalizado bajo Incoterm FOB Callao. Depósito en custodia Escrow al 100%.'
  }
];

interface B2BOrdersContextType {
  orders: B2BQuoteOrder[];
  addOrder: (order: Omit<B2BQuoteOrder, 'id' | 'createdAt'>) => B2BQuoteOrder;
  updateOrderStatus: (id: string, newStatus: B2BQuoteOrder['status'], extra?: Partial<B2BQuoteOrder>) => void;
}

const B2BOrdersContext = createContext<B2BOrdersContextType>({
  orders: initialB2BOrders,
  addOrder: () => initialB2BOrders[0],
  updateOrderStatus: () => {},
});

export function useB2BOrders() {
  return useContext(B2BOrdersContext);
}

export function B2BOrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<B2BQuoteOrder[]>(() => {
    try {
      const saved = localStorage.getItem('trazamazon-b2b-orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialB2BOrders;
  });

  useEffect(() => {
    try {
      localStorage.setItem('trazamazon-b2b-orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const addOrder = (orderData: Omit<B2BQuoteOrder, 'id' | 'createdAt'>): B2BQuoteOrder => {
    const newId = `TA-ORD-${Math.floor(885 + Math.random() * 100)}`;
    const now = new Date();
    const formattedDate = `${now.getDate()} ${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'][now.getMonth()]} ${now.getFullYear()} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newOrder: B2BQuoteOrder = {
      ...orderData,
      id: newId,
      createdAt: formattedDate,
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (id: string, newStatus: B2BQuoteOrder['status'], extra?: Partial<B2BQuoteOrder>) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === id) {
          return {
            ...ord,
            status: newStatus,
            ...extra,
          };
        }
        return ord;
      })
    );
  };

  return (
    <B2BOrdersContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </B2BOrdersContext.Provider>
  );
}

/**
 * Modal de Autenticación y Registro con Doble Rol
 */
function AuthModal() {
  const { authModalTab, closeAuthModal, login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(authModalTab);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [regionOrCountry, setRegionOrCountry] = useState('');

  const handleFastLogin = (demoRole: 'buyer' | 'seller') => {
    if (demoRole === 'buyer') {
      login({
        name: 'Alexandre Bonnat',
        email: 'procurement@valrhona-artisans.com',
        role: 'buyer',
        organization: 'Valrhona Artisans B2B',
        taxId: 'FR-84920192',
        countryOrRegion: 'Francia / Unión Europea',
      });
    } else {
      login({
        name: 'Santos Huamán',
        email: 'presidencia@bosquevivo-madrededios.pe',
        role: 'seller',
        organization: 'Asociación Bosque Vivo',
        taxId: 'RUC 20608912341',
        countryOrRegion: 'Madre de Dios, Perú',
      });
    }
    closeAuthModal();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      login({
        name: email.split('@')[0] || 'Usuario B2B',
        email,
        role: email.includes('coop') || email.includes('bosque') ? 'seller' : 'buyer',
        organization: email.includes('coop') ? 'Cooperativa Amazónica' : 'Empresa Compradora B2B',
      });
    } else {
      login({
        name: contactName || orgName || 'Representante',
        email,
        role,
        organization: orgName || (role === 'buyer' ? 'Comprador B2B' : 'Cooperativa Amazónica'),
        taxId,
        countryOrRegion: regionOrCountry,
      });
    }
    closeAuthModal();
  };

  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="modal-card auth-modal-box" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button
          className="modal-close"
          onClick={closeAuthModal}
          aria-label="Cerrar modal de autenticación"
          data-testid="button-close-auth-modal"
        >
          <X size={19} />
        </button>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
            data-testid="tab-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
            data-testid="tab-register"
          >
            Crear Cuenta Verificada
          </button>
        </div>

        {tab === 'login' ? (
          <div>
            <div className="text-center mb-5">
              <span className="inline-flex p-2.5 rounded-full bg-[#eef3eb] text-[#1b4332] mb-2">
                <Lock size={20} />
              </span>
              <h2 id="auth-modal-title" className="serif text-2xl text-[#071b12]">
                Acceso a TrazAmazon B2B
              </h2>
              <p className="text-xs text-[#525f56] mt-1">
                Ingresa con tu correo corporativo o cuenta de cooperativa registrada.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="quote-form">
              <label>
                Correo Electrónico
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  data-testid="input-login-email"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  data-testid="input-login-password"
                />
              </label>

              <button type="submit" className="button button-dark button-wide mt-2" data-testid="button-submit-login">
                Ingresar a la Plataforma <ArrowRight size={15} />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#e8e6df]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#727973] block mb-2 text-center">
                Acceso Rápido de Prueba (Demo B2B)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFastLogin('buyer')}
                  className="px-2.5 py-2 bg-[#f4f7f2] hover:bg-[#e4ede1] border border-[#c8dac3] rounded text-left transition-colors"
                  data-testid="demo-login-buyer"
                >
                  <span className="text-[11px] font-bold text-[#1b4332] block flex items-center gap-1">
                    <Building2 size={13} /> Comprador B2B
                  </span>
                  <small className="text-[10px] text-[#525f56]">Valrhona Artisans S.A.</small>
                </button>
                <button
                  type="button"
                  onClick={() => handleFastLogin('seller')}
                  className="px-2.5 py-2 bg-[#fdf8f3] hover:bg-[#faebd9] border border-[#e5cbb3] rounded text-left transition-colors"
                  data-testid="demo-login-seller"
                >
                  <span className="text-[11px] font-bold text-[#954a17] block flex items-center gap-1">
                    <Leaf size={13} /> Cooperativa
                  </span>
                  <small className="text-[10px] text-[#525f56]">Asoc. Bosque Vivo</small>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-3">
              <h2 id="auth-modal-title" className="serif text-2xl text-[#071b12]">
                Registro en TrazAmazon
              </h2>
              <p className="text-xs text-[#525f56] mt-1">
                Selecciona tu tipo de perfil para acceder a las herramientas correspondientes.
              </p>
            </div>

            {/* Dual Role Selector */}
            <div className="role-selector-container">
              <div
                className={`role-card ${role === 'buyer' ? 'selected' : ''}`}
                onClick={() => setRole('buyer')}
                role="button"
                tabIndex={0}
                data-testid="role-buyer-card"
              >
                <b>
                  <Building2 size={14} /> Comprador B2B
                </b>
                <small>Chocolaterías, tostadurías, cosmética botánica y distribuidores.</small>
              </div>

              <div
                className={`role-card ${role === 'seller' ? 'selected' : ''}`}
                onClick={() => setRole('seller')}
                role="button"
                tabIndex={0}
                data-testid="role-seller-card"
              >
                <b>
                  <Leaf size={14} /> Cooperativa / Vendedor
                </b>
                <small>Asociaciones agrarias, comunidades nativas y concesiones forestales.</small>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="quote-form">
              {role === 'buyer' ? (
                <>
                  <label>
                    Nombre de la Empresa o Razón Social
                    <input
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Ej. Chocolats du Monde S.A.S."
                      data-testid="input-register-org-buyer"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      Tax ID / VAT / RUC
                      <input
                        required
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="FR-9481923"
                        data-testid="input-register-taxid"
                      />
                    </label>
                    <label>
                      País / Mercado Destino
                      <input
                        required
                        value={regionOrCountry}
                        onChange={(e) => setRegionOrCountry(e.target.value)}
                        placeholder="Francia / UE"
                        data-testid="input-register-country"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <label>
                    Nombre de la Cooperativa o Comunidad
                    <input
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Ej. Cooperativa Agroforestal Boca Pariamanu"
                      data-testid="input-register-org-seller"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      RUC Agrario / Registro
                      <input
                        required
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="20601948291"
                        data-testid="input-register-ruc-seller"
                      />
                    </label>
                    <label>
                      Cuenca / Región Amazónica
                      <input
                        required
                        value={regionOrCountry}
                        onChange={(e) => setRegionOrCountry(e.target.value)}
                        placeholder="Madre de Dios"
                        data-testid="input-register-region-seller"
                      />
                    </label>
                  </div>
                </>
              )}

              <label>
                Nombre del Contacto Principal
                <input
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ej. María Elena Paredes"
                  data-testid="input-register-name"
                />
              </label>

              <label>
                Correo Electrónico Corporativo
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@organizacion.com"
                  data-testid="input-register-email"
                />
              </label>

              <label>
                Crear Contraseña
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  data-testid="input-register-password"
                />
              </label>

              <button type="submit" className="button button-earth button-wide mt-2" data-testid="button-submit-register">
                Crear Cuenta Verificada y Acceder <Check size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Header de Navegación Estándar de la Plataforma
 */
function Header({ active }: { active?: string }) {
  const [menu, setMenu] = useState(false);
  const { currentUser, logout, openAuthModal } = useAuth();

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
          <Link href="/agroturismo" className={active === 'agroturismo' ? 'nav-link active' : 'nav-link'} data-testid="link-agrotourism">
            Ruta Agroturismo
          </Link>
          <Link href="/app" className={active === 'app' ? 'nav-link active' : 'nav-link'} data-testid="link-field-app">
            App de Campo PWA
          </Link>
        </nav>
        <div className="header-actions">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/panel"
                className="button button-dark button-small"
                data-testid="button-my-panel"
              >
                Mi Panel
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-[#424843] hover:text-[#954a17] hover:bg-[#efeee9] transition-colors"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                data-testid="button-logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="header-auth-group">
              <button
                type="button"
                className="btn-auth-login"
                onClick={() => openAuthModal('login')}
                data-testid="button-login"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                className="btn-auth-register"
                onClick={() => openAuthModal('register')}
                data-testid="button-register"
              >
                Registrarse <ArrowUpRight size={14} />
              </button>
            </div>
          )}
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
          <Link href="/agroturismo" data-testid="footer-agrotourism">
            Ruta Agroturismo Vivencial
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
  const { addOrder } = useB2BOrders();
  const { currentUser } = useAuth();

  useEffect(() => {
    setSent(false);
  }, [lot]);

  if (!lot) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (lot) {
      const isSample = requestType.includes('Muestra');
      const requestedKg = isSample ? 0.5 : requestType.includes('Pallet') ? 1000 : 10000;
      addOrder({
        lotId: lot.id,
        lotName: lot.name,
        fruit: lot.fruit,
        cooperative: lot.cooperative,
        buyerName: buyerName || currentUser?.name || 'Comprador B2B',
        buyerOrg: company || currentUser?.organization || 'Empresa Importadora B2B',
        buyerCountry: currentUser?.countryOrRegion || 'Internacional',
        type: isSample ? 'sample' : 'commercial_rfq',
        requestedKg,
        pricePerKg: lot.priceFob,
        totalUsd: isSample ? 0 : requestedKg * lot.priceFob,
        status: 'submitted',
        escrowStatus: 'pending',
        notes: `${requestType}. Contacto: ${buyerEmail || currentUser?.email || 'compras@valrhona-artisans.com'}`,
      });
    }
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
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button className="button button-dark" onClick={onClose} data-testid="button-done-quote">
                Volver al Catálogo <ArrowRight size={16} />
              </button>
              <Link href="/panel" className="button button-earth" onClick={onClose} data-testid="button-goto-panel">
                Ver en Mi Panel B2B <ExternalLink size={16} />
              </Link>
            </div>
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
      <Header active="marketplace" />

      {/* TOP EDITORIAL HEADER */}
      <section className="w-full bg-[#faf9f4] pt-8 pb-10 border-b border-[rgba(11,41,27,0.06)]">
        <div className="max-w-[1320px] mx-auto px-6 flex flex-col gap-6">
          {/* Breadcrumb */}
          <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#727973] font-semibold">
            <Link href="/" className="hover:text-[#1b4332] transition-colors" data-testid="breadcrumb-home">Inicio</Link>
            <span className="text-gray-300">/</span>
            <Link href="/marketplace" className="text-[#1b4332] font-bold hover:underline" data-testid="breadcrumb-marketplace">Marketplace B2B</Link>
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
                        {/* Clickeable Seller Profile Chip */}
                        <div className="my-2.5">
                          <Link
                            href={`/lote/${lot.id}`}
                            className="card-seller-chip group"
                            title={`Ver perfil y credenciales de ${lot.cooperative}`}
                            data-testid={`link-seller-profile-${lot.id}`}
                          >
                            <span className="card-seller-chip-avatar">{lot.cooperative[0]}</span>
                            <span className="truncate max-w-[190px]">{lot.cooperative}</span>
                            <ShieldCheck size={13} className="text-[#2a7a4c] shrink-0" />
                            <ArrowRight size={11} className="text-[#1b4332] opacity-70 group-hover:opacity-100 transition-opacity ml-0.5" />
                          </Link>
                        </div>
                        <p className="text-[11px] text-[#727973] leading-relaxed mb-3">
                          {lot.community} · Cuenca Amazónica Protegida
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
 * Coordenadas Geográficas Reales para Visualización en OpenStreetMap
 */
function getLotGeoCoords(lotId: string) {
  switch (lotId) {
    case 'TA-0319': return { lat: -14.3167, lng: -69.4167, zoom: 14 }; // Sandia / Puno
    case 'TA-0186': return { lat: -11.7500, lng: -69.6667, zoom: 14 }; // Tahuamanu
    case 'TA-0512': return { lat: -14.3333, lng: -69.4333, zoom: 14 }; // Tambopata
    case 'TA-0244': return { lat: -12.8667, lng: -72.7000, zoom: 14 }; // Quillabamba
    case 'TA-0601': return { lat: -8.3833, lng: -74.5167, zoom: 14 };  // Ucayali
    default: return { lat: -12.4667, lng: -69.2000, zoom: 14 };        // Boca Pariamanu / Madre de Dios
  }
}

/**
 * VISTA 2: Perfil de Vendedor B2B, Lote de Cosecha y Cotización (Estilo Alibaba B2B)
 */
function LotDetail() {
  const [, params] = useRoute('/lote/:id');
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);

  const lot = initialLots.find((x) => x.id === params?.id) || initialLots[0];

  // Related products from the same cooperative or similar Amazonian harvests
  const relatedLots = useMemo(() => {
    return initialLots.filter((l) => l.id !== lot.id).slice(0, 3);
  }, [lot.id]);

  return (
    <main className="bg-[#faf9f4] min-h-screen text-[#1b1c19] font-dmsans">
      <Header active="marketplace" />

      <div className="max-w-[1320px] mx-auto px-6 py-8">
        {/* Breadcrumb B2B */}
        <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#727973] font-semibold mb-6">
          <Link href="/" className="hover:text-[#1b4332] transition-colors" data-testid="link-lot-home">Inicio</Link>
          <span className="text-gray-300">/</span>
          <Link href="/marketplace" className="hover:text-[#1b4332] transition-colors" data-testid="link-lot-marketplace">Marketplace B2B</Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#1b4332] font-bold">{lot.cooperative}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 font-medium truncate max-w-xs">{lot.name}</span>
        </nav>

        {/* ALIBABA STYLE VERIFIED SUPPLIER HEADER */}
        <div className="alibaba-supplier-bar">
          <div className="supplier-main-info">
            <div className="supplier-avatar-badge">
              {lot.cooperative[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-[#071b12]">{lot.cooperative}</h2>
                <span className="gold-supplier-badge">
                  <Award size={13} /> Gold Supplier Agroforestal
                </span>
                <span className="text-[11px] font-semibold text-[#143d29] bg-[#eef3eb] px-2 py-0.5 rounded border border-[#c9d8c4]">
                  <ShieldCheck size={12} className="inline mr-0.5 text-[#2a7a4c]" /> Verificado In-Situ EUDR
                </span>
              </div>
              <div className="supplier-metrics">
                <span><Star size={12} className="text-[#d97736] fill-[#d97736]" /> <b>4.9 / 5.0</b> (38 pedidos B2B)</span>
                <span><Clock size={12} /> Tasa de Respuesta: <b>&lt; 2 horas</b></span>
                <span><Ship size={12} /> Capacidad Anual: <b>45 MT / año</b></span>
                <span><MapPin size={12} /> {lot.community}, {lot.region}, Perú</span>
              </div>
            </div>
          </div>

          <div className="supplier-actions">
            <button
              className="btn-supplier-contact"
              onClick={() => setSelectedLot(lot)}
              data-testid="button-supplier-contact"
            >
              <Send size={14} /> Contactar Cooperativa (RFQ)
            </button>
            <button
              className="btn-supplier-profile"
              onClick={() => {
                const el = document.getElementById('auditoria-satelital');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              data-testid="button-supplier-audit"
            >
              <ShieldCheck size={14} /> Auditoría Satelital
            </button>
          </div>
        </div>

        {/* PRODUCT HERO & TIERED PRICING SECTION */}
        <section className="bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-8 shadow-xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                <img
                  src={lot.image}
                  alt={lot.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 bg-[#143d29]/90 text-white backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase rounded-md shadow-xs">
                    <ShieldCheck size={11} className="inline mr-1 text-[#4ade80]" /> Cero Deforestación 2024-2025
                  </span>
                  <span className="px-2.5 py-1 bg-[#071b12]/90 text-white backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase rounded-md shadow-xs">
                    LOTE #{lot.id} · Cosecha {lot.harvestDate}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded backdrop-blur-xs">
                  Foto auditada en parcela
                </div>
              </div>

              {/* Sub-gallery thumbnails */}
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-4/3 rounded-lg overflow-hidden border-2 border-[#1b4332] relative">
                  <img src={lot.image} alt="Cosecha principal" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-[#1b4332]/90 text-white text-[8px] text-center py-0.5 font-bold uppercase">Grano</span>
                </div>
                <div className="aspect-4/3 rounded-lg overflow-hidden border border-gray-200 relative opacity-90 hover:opacity-100 transition-opacity">
                  <img src={`${import.meta.env.BASE_URL}amazon-parcel-map.jpg`} alt="Mapa satelital" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] text-center py-0.5 font-bold uppercase">Satélite</span>
                </div>
                <div className="aspect-4/3 rounded-lg overflow-hidden border border-gray-200 relative opacity-90 hover:opacity-100 transition-opacity">
                  <img src={lot.farmerImage} alt="Agricultor líder" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] text-center py-0.5 font-bold uppercase">Productor</span>
                </div>
              </div>
            </div>

            {/* Product Details & Tiered Pricing */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#954a17] bg-[#fbf2eb] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  {lot.fruit.toUpperCase()} NATIVO AMAZÓNICO · ALTA PUREZA GENÉTICA
                </span>
                <h1 className="font-newsreader text-3xl sm:text-4xl text-[#071b12] font-normal leading-tight">
                  {lot.name}
                </h1>
                <p className="text-xs text-[#525f56] mt-1 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#954a17]" />
                  <span>{lot.community}, {lot.region}, Perú</span>
                  <span className="text-gray-300">·</span>
                  <span>{lot.cooperative}</span>
                </p>
              </div>

              {/* TIERED PRICING BOX (ALIBABA STYLE) */}
              <div className="tiered-pricing-box">
                <div className="tiered-col">
                  <div className="tiered-qty">500 – 2,000 kg</div>
                  <div className="tiered-price">${lot.priceFob.toFixed(2)} USD</div>
                  <div className="tiered-sub">/ kg FOB Callao</div>
                </div>
                <div className="tiered-col">
                  <div className="tiered-qty">2,001 – 10,000 kg</div>
                  <div className="tiered-price">${(lot.priceFob * 0.94).toFixed(2)} USD</div>
                  <div className="tiered-sub">/ kg (-6% Volumen)</div>
                </div>
                <div className="tiered-col">
                  <div className="tiered-qty">≥ 10,000 kg (FCL)</div>
                  <div className="tiered-price">${(lot.priceFob * 0.86).toFixed(2)} USD</div>
                  <div className="tiered-sub">/ kg (-14% Contenedor)</div>
                </div>
              </div>

              {/* Commercial Specs & Logistics Sheet */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#f8f7f2] rounded-xl border border-[#deded2] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#727973] block">Pedido Mínimo (MOQ)</span>
                  <b className="text-[#071b12]">{lot.minimumMoq}</b>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#727973] block">Stock Disponible</span>
                  <b className="text-[#143d29]">{lot.availableKg.toLocaleString()} kg listos</b>
                  <small className="text-[10px] text-[#727973] block">Lote: {lot.totalKg.toLocaleString()} kg</small>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#727973] block">Tiempo a Puerto</span>
                  <b className="text-[#071b12]">10 – 15 días</b>
                  <small className="text-[10px] text-[#727973] block">FOB Callao / Lima</small>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#727973] block">Incoterms</span>
                  <b className="text-[#071b12]">FOB, CIF, CFR</b>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#727973] block">Empaque de Exportación</span>
                  <b className="text-[#071b12]">Saco GrainPro 60kg</b>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#727973] block">Protección de Pago</span>
                  <b className="text-[#2a7a4c]">Escrow / Carta Crédito</b>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap items-center gap-1.5">
                {lot.certifications.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#c9d8c4] text-[#143d29] text-[11px] font-semibold rounded-md shadow-xs">
                    <ShieldCheck size={12} className="text-[#2a7a4c]" /> {c}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eef3eb] border border-[#c9d8c4] text-[#143d29] text-[11px] font-semibold rounded-md shadow-xs">
                  <Layers size={12} className="text-[#1b4332]" /> Cobertura NDVI: {lot.ndviScore} (Dosel Primario)
                </span>
              </div>

              {/* Primary Call to Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#954a17] hover:bg-[#b05b1f] text-white font-semibold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
                  onClick={() => setSelectedLot(lot)}
                  data-testid="button-request-quote-main"
                >
                  <Send size={15} /> Solicitar Cotización Formal (RFQ)
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-[#f4f3ed] text-[#071b12] border border-[#deded2] font-semibold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider"
                  onClick={() => setSelectedLot(lot)}
                  data-testid="button-request-sample-main"
                >
                  <PackageCheck size={15} /> Solicitar Muestra (500g)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TECHNICAL LABORATORY SHEET & SENSORY RADAR */}
        <section className="bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-8 shadow-xs mb-8">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#143d29] block">
              Control de Calidad Físico-Químico · Acreditación Internacional
            </span>
            <h2 className="font-newsreader text-2xl text-[#071b12] mt-0.5">
              Ficha Técnica de Laboratorio y Perfil Sensorial SCAA
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {/* 1. Humedad */}
            <div className="p-4 bg-[#faf9f4] rounded-xl border border-gray-200/70 hover:border-[#1b4332] transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#727973]">Humedad Final</span>
                <span className="p-1.5 rounded-lg bg-[#e0f2fe] text-[#0284c7]">
                  <Droplets size={14} />
                </span>
              </div>
              <div>
                <b className="text-xl text-[#071b12] font-mono block">{lot.specs.v1}</b>
                <span className="text-[10px] text-[#2a7a4c] font-semibold flex items-center gap-1 mt-0.5">
                  <Check size={10} /> Óptimo &lt; 7.5%
                </span>
              </div>
              <small className="text-[9px] text-[#727973] block mt-1 pt-1 border-t border-gray-100">
                Grano Seco Exportación
              </small>
            </div>

            {/* 2. Fermentación */}
            <div className="p-4 bg-[#faf9f4] rounded-xl border border-gray-200/70 hover:border-[#1b4332] transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#727973]">Fermentación</span>
                <span className="p-1.5 rounded-lg bg-[#fef3c7] text-[#d97736]">
                  <Thermometer size={14} />
                </span>
              </div>
              <div>
                <b className="text-xl text-[#071b12] font-mono block">{lot.specs.v2}</b>
                <span className="text-[10px] text-[#2a7a4c] font-semibold flex items-center gap-1 mt-0.5">
                  <Check size={10} /> Grado Homogéneo
                </span>
              </div>
              <small className="text-[9px] text-[#727973] block mt-1 pt-1 border-t border-gray-100">
                Cajón Laurel Amazónico
              </small>
            </div>

            {/* 3. Altitud */}
            <div className="p-4 bg-[#faf9f4] rounded-xl border border-gray-200/70 hover:border-[#1b4332] transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#727973]">Altitud Cultivo</span>
                <span className="p-1.5 rounded-lg bg-[#eef3eb] text-[#1b4332]">
                  <Mountain size={14} />
                </span>
              </div>
              <div>
                <b className="text-xl text-[#071b12] font-mono block">{lot.specs.v3}</b>
                <span className="text-[10px] text-[#727973] font-semibold flex items-center gap-1 mt-0.5">
                  Llanura Aluvial
                </span>
              </div>
              <small className="text-[9px] text-[#727973] block mt-1 pt-1 border-t border-gray-100">
                Bajo Dosel Primario
              </small>
            </div>

            {/* 4. Cadmio / Metales */}
            <div className="p-4 bg-[#faf9f4] rounded-xl border border-gray-200/70 hover:border-[#1b4332] transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#727973]">Cadmio / Metales</span>
                <span className="p-1.5 rounded-lg bg-[#ecfdf5] text-[#059669]">
                  <FlaskConical size={14} />
                </span>
              </div>
              <div>
                <b className="text-xl text-[#2a7a4c] font-mono block">&lt; 0.28 ppm</b>
                <span className="text-[10px] text-[#2a7a4c] font-semibold flex items-center gap-1 mt-0.5">
                  <Check size={10} /> Conforme UE 488
                </span>
              </div>
              <small className="text-[9px] text-[#727973] block mt-1 pt-1 border-t border-gray-100">
                Purity Lab Certified
              </small>
            </div>

            {/* 5. Puntaje Sensorial */}
            <div className="p-4 bg-[#faf9f4] rounded-xl border border-gray-200/70 hover:border-[#1b4332] transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#727973]">Puntaje Sensorial</span>
                <span className="p-1.5 rounded-lg bg-[#fdf5e6] text-[#954a17]">
                  <Award size={14} />
                </span>
              </div>
              <div>
                <b className="text-xl text-[#954a17] font-mono block">{lot.sensoryScore}</b>
                <span className="text-[10px] text-[#954a17] font-semibold flex items-center gap-1 mt-0.5">
                  <Star size={10} className="fill-[#954a17]" /> Especialidad
                </span>
              </div>
              <small className="text-[9px] text-[#727973] block mt-1 pt-1 border-t border-gray-100">
                SCAA / Fine Flavor
              </small>
            </div>

            {/* 6. Empaque */}
            <div className="p-4 bg-[#faf9f4] rounded-xl border border-gray-200/70 hover:border-[#1b4332] transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#727973]">Empaque Export.</span>
                <span className="p-1.5 rounded-lg bg-[#f1f5f9] text-[#334155]">
                  <PackageCheck size={14} />
                </span>
              </div>
              <div>
                <b className="text-xl text-[#071b12] font-mono block">GrainPro 60kg</b>
                <span className="text-[10px] text-[#2a7a4c] font-semibold flex items-center gap-1 mt-0.5">
                  <Check size={10} /> Atmósfera Hermética
                </span>
              </div>
              <small className="text-[9px] text-[#727973] block mt-1 pt-1 border-t border-gray-100">
                Yute con Trazabilidad QR
              </small>
            </div>
          </div>

          <div className="p-4 bg-[#f8f7f2] rounded-xl border border-[#deded2]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#954a17] block mb-1">
              Notas Sensoriales & Descriptores de Copa / Cata
            </span>
            <p className="text-sm text-[#071b12] font-medium leading-relaxed">
              "{lot.sensoryNotes}"
            </p>
            <p className="text-xs text-[#525f56] mt-2 pt-2 border-t border-gray-200/60">
              {lot.story}
            </p>
          </div>
        </section>

        {/* SATELLITE PARCEL RADAR & PRODUCER CARD */}
        <section id="auditoria-satelital" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          {/* Producer Story */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#143d29] block mb-1">
                Origen Comunitario & Gobernanza
              </span>
              <h2 className="font-newsreader text-2xl text-[#071b12] mb-3">
                El rostro detrás de la cosecha: <span className="italic text-[#1b4332]">bosque y familia.</span>
              </h2>
              <p className="text-xs text-[#424843] leading-relaxed mb-6">
                En la cuenca de <b>{lot.community}</b>, cada familia productora custodia su parcela dentro de concesiones forestales y parcelas agroforestales. La cosecha convive con árboles nativos centenarios y refugios de fauna silvestre.
              </p>

              <div className="flex items-center gap-4 p-4 bg-[#f4f7f2] border border-[#c9d8c4] rounded-xl">
                <img
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#1b4332]"
                  src={lot.farmerImage}
                  alt={lot.farmerName}
                />
                <div className="flex-1">
                  <b className="text-sm text-[#071b12] block">{lot.farmerName}</b>
                  <span className="text-xs text-[#143d29] block">Productor(a) Líder · {lot.cooperative}</span>
                  <small className="text-[10px] text-[#727973] block mt-0.5">Insignia Digital #{lot.id}-ID</small>
                </div>
                <BadgeCheck size={24} className="text-[#2a7a4c]" />
              </div>
            </div>

            <div className="mt-6 p-3.5 bg-[#f0eee4] border border-[#e1dfd4] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#2d6a4f]">
                <QrCode size={18} />
                <span className="font-mono text-[11px]">Hash: {lot.lotHash}</span>
              </div>
              <span className="text-[10px] text-[#2d6a4f] bg-[#e4ecde] px-2 py-0.5 rounded font-semibold">
                PostGIS Verified
              </span>
            </div>
          </div>

          {/* Animated Satellite Radar Component */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#143d29] block">
                  Trazabilidad Geoespacial Sentinel-2
                </span>
                <h3 className="font-newsreader text-2xl text-[#071b12]">
                  Polígono de Parcela Georreferenciada
                </h3>
              </div>
              <span className="p-2.5 bg-[#eef3eb] text-[#1b4332] rounded-xl">
                <QrCode size={22} />
              </span>
            </div>

            {/* OpenStreetMap Live Interactive Parcel Viewer */}
            {(() => {
              const geo = getLotGeoCoords(lot.id);
              const bbox = `${geo.lng - 0.045}%2C${geo.lat - 0.035}%2C${geo.lng + 0.045}%2C${geo.lat + 0.035}`;
              const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`;

              return (
                <div className="relative rounded-xl overflow-hidden border border-[#deded2] bg-[#f0eee4] shadow-inner h-[350px]">
                  <iframe
                    title={`OpenStreetMap Parcela ${lot.id}`}
                    src={osmUrl}
                    className="w-full h-full border-0 filter saturate-105"
                    loading="lazy"
                  />
                  {/* PostGIS & Sentinel-2 Overlay Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    <span className="px-2.5 py-1 bg-[#143d29]/95 text-white backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase rounded-md shadow-xs flex items-center gap-1">
                      <ShieldCheck size={11} className="text-[#4ade80]" /> OpenStreetMap Live · PostGIS Verified
                    </span>
                    <span className="px-2.5 py-1 bg-[#071b12]/90 text-white backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase rounded-md shadow-xs flex items-center gap-1">
                      <Leaf size={10} className="text-[#d4a373]" /> Cobertura NDVI {lot.ndviScore} (Dosel Primario)
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-[#071b12]/90 text-white px-2.5 py-1 rounded-md text-[10px] font-mono backdrop-blur-xs flex items-center gap-1.5 pointer-events-none">
                    <MapPin size={11} className="text-[#d4a373]" /> {lot.coordinates}
                  </div>

                  <a
                    href={`https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lng}#map=15/${geo.lat}/${geo.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 px-2.5 py-1 bg-white hover:bg-gray-100 text-[#071b12] text-[10px] font-semibold rounded-md shadow-sm flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={10} /> Abrir en OpenStreetMap.org
                  </a>
                </div>
              );
            })()}

            <p className="text-[11px] text-[#727973] mt-3 leading-relaxed">
              Monitoreo satelital Sentinel-2 (ESA) procesado vía PostGIS geoespacial. Cero pérdida de cobertura forestal en un radio de 5 km desde la fecha de corte regulatoria EUDR (31 de diciembre 2020).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#eef3eb] text-[#2a7a4c] flex items-center justify-center"><Check size={11} /></span>
                <span className="text-[11px] text-[#424843]">Captura Offline en Parcela</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#eef3eb] text-[#2a7a4c] flex items-center justify-center"><Check size={11} /></span>
                <span className="text-[11px] text-[#424843]">Hash Inmutable PostGIS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#eef3eb] text-[#2a7a4c] flex items-center justify-center"><Check size={11} /></span>
                <span className="text-[11px] text-[#424843]">Acreditado Reg. UE 2023/1115</span>
              </div>
            </div>
          </div>
        </section>

        {/* CROSS SELLING: MÁS PRODUCTOS DE ESTE PROVEEDOR */}
        <section className="bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-4 mb-6 gap-2">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#143d29] block">
                Catálogo del Proveedor
              </span>
              <h2 className="font-newsreader text-2xl text-[#071b12]">
                Más Cosechas y Productos de <span className="italic text-[#1b4332]">{lot.cooperative}</span>
              </h2>
            </div>
            <Link href="/marketplace" className="text-xs text-[#954a17] hover:text-[#d97736] font-bold flex items-center gap-1">
              Ver todo el catálogo mayorista <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedLots.map((relLot) => (
              <div key={relLot.id} className="bg-[#faf9f4] border border-gray-200/70 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                    <img src={relLot.image} alt={relLot.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[9px] font-bold uppercase rounded">
                      LOTE #{relLot.id}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#143d29]/90 text-white text-[9px] font-bold uppercase rounded">
                      {relLot.sensoryScore} SCAA
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#954a17] block">
                      {relLot.fruit} · {relLot.region}
                    </span>
                    <h3 className="font-newsreader text-lg text-[#071b12] font-semibold mt-0.5 line-clamp-1">
                      {relLot.name}
                    </h3>
                    <p className="text-xs text-[#525f56] mt-1 line-clamp-2">
                      {relLot.sensoryNotes}
                    </p>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="text-base font-bold text-[#071b12]">${relLot.priceFob.toFixed(2)}</span>
                      <span className="text-xs text-[#727973]">{relLot.unit}</span>
                      <span className="text-[10px] text-[#2a7a4c] font-semibold ml-auto">{relLot.minimumMoq}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <Link
                    href={`/lote/${relLot.id}`}
                    className="w-full py-2 bg-white hover:bg-[#eef3eb] text-[#1b4332] border border-[#c9d8c4] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye size={13} /> Ver Expediente del Lote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INVITATION TO DEDICATED AGROTOURISM */}
        <section className="bg-gradient-to-r from-[#071b12] to-[#143d29] rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#d4a373] block mb-1">
              Rutas de Agroturismo Vivencial & Bioeconomía
            </span>
            <h2 className="font-newsreader text-2xl sm:text-3xl text-white font-normal">
              ¿Deseas auditar la cosecha en persona o vivir la experiencia comunitaria?
            </h2>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Visita la cuenca de <b>{lot.cooperative}</b> en Madre de Dios. Recorre parcelas de cacao nativo bajo dosel primario, participa en talleres de cata y apoya directamente el fondo de conservación comunal.
            </p>
          </div>
          <Link
            href="/agroturismo"
            className="whitespace-nowrap px-6 py-3.5 bg-[#954a17] hover:bg-[#b05b1f] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
            data-testid="link-agrotourism-cta"
          >
            <Compass size={16} /> Explorar Rutas de Agroturismo <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      <Footer />

      <SampleQuoteDialog lot={selectedLot} onClose={() => setSelectedLot(null)} />
    </main>
  );
}

/**
 * VISTA DEDICADA: Portal de Agroturismo Vivencial y Bioeconomía Amazónica (/agroturismo)
 */
function AgroturismoPage() {
  const [selectedRoute, setSelectedRoute] = useState<string>('cacao-boca-pariamanu');
  const [bookingModal, setBookingModal] = useState(false);
  const [booked, setBooked] = useState(false);
  const [visitors, setVisitors] = useState(2);
  const [visitDate, setVisitDate] = useState('2025-07-20');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const routes = [
    {
      id: 'cacao-boca-pariamanu',
      title: 'Ruta del Cacao Nativo & Bosque Ancestral',
      community: 'Comunidad Nativa Boca Pariamanu (Pueblo Amahuaca)',
      region: 'Río Pariamanu · Madre de Dios',
      coop: 'Asociación Bosque Vivo',
      duration: '3 Días / 2 Noches',
      price: '$280 USD',
      image: 'amazon-cacao-hero.jpg',
      tags: ['Cacao Nativo', 'Navegación Fluvial', 'Cata en Origen'],
      desc: 'Navega por el río Pariamanu en canoas tradicionales, recolecta mazorcas de cacao criollo bajo árboles centenarios de castaña y aprende el proceso de fermentación tradicional en cajones de madera laurel.',
      highlights: [
        'Hospedaje en tambo comunitario ecológico con alimentación autóctona',
        'Taller de corte y cata guiada de mazorcas de cacao nativo chuncho y criollo',
        'Monitoreo biológico nocturno: avistamiento de caimanes y aves amazónicas',
        '100% de la tarifa va directamente a las familias de la comunidad'
      ]
    },
    {
      id: 'castana-tahuamanu',
      title: 'Ruta de la Castaña Gigante & Concesiones Sostenibles',
      community: 'Concesión Castañera Río Las Piedras',
      region: 'Tahuamanu · Madre de Dios',
      coop: 'Asoc. Castañeros del Tahuamanu',
      duration: '4 Días / 3 Noches',
      price: '$360 USD',
      image: 'tour-agroforestry.jpg',
      tags: ['Castaña Silvestre', 'Concesión Forestal', 'Canopy'],
      desc: 'Convive con las familias recolectoras de castaña amazónica. Aprende a usar el "payón" tradicional, recolecta cocos de castaña en bosque virgen y degusta leche fresca de castaña en el campamento.',
      highlights: [
        'Ascenso guiado con arnés a copas de castaños gigantes de más de 45 metros',
        'Recolección tradicional de cocos de castaña y quebrado artesanal',
        'Cata de aceite virgen prensado en frío y cosmética bioamazónica',
        'Fondo de vigilancia comunitaria para defensa contra taladores ilegales'
      ]
    },
    {
      id: 'cafe-sandia',
      title: 'Ruta del Café de Nube & Terrazas Andino-Amazónicas',
      community: 'Valle de Tambopata (Sandia)',
      region: 'Puno / Selva Alta',
      coop: 'Cooperativa Agraria Cafetalera San Juan del Oro',
      duration: '3 Días / 2 Noches',
      price: '$240 USD',
      image: 'tour-community.jpg',
      tags: ['Café Geisha', 'Selva Alta', 'Biodiversidad'],
      desc: 'Ascenso a los bosques de neblina de Sandia a 1,750 msnm donde crece el café orgánico más premiado del mundo. Conoce parcelas agroforestales bajo dosel y degusta microlotes Geisha.',
      highlights: [
        'Cata profesional de café Geisha con catadores Q-Grader comunales',
        'Ruta de observación del Gallito de las Rocas y orquídeas endémicas',
        'Senderismo por terrazas preincaicas adaptadas a café de alta montaña',
        'Intercambio cultural con las familias de habla quechua-aymara'
      ]
    }
  ];

  const currentRoute = routes.find((r) => r.id === selectedRoute) || routes[0];

  const handleBooking = (e: FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <main className="bg-[#faf9f4] min-h-screen text-[#1b1c19] font-dmsans">
      <Header active="agroturismo" />

      {/* AGROTOURISM HERO */}
      <section className="agrotourism-hero-pro relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#143d29]/80 border border-[#4ade80]/30 rounded-full text-white text-xs font-semibold backdrop-blur-xs">
            <Compass size={14} className="text-[#d4a373]" />
            <span>Bioeconomía & Turismo Comunitario Regenerativo</span>
          </div>
          <h1 className="font-newsreader text-4xl sm:text-6xl text-white font-normal tracking-tight">
            Rutas de Agroturismo Vivencial <br />
            <span className="italic text-[#d4a373]">en el corazón del Bosque Amazónico</span>
          </h1>
          <p className="text-base text-gray-200 max-w-2xl leading-relaxed">
            Conecta de forma real con el origen de los superfrutos amazónicos. Visita las comunidades productoras, recorre parcelas agroforestales bajo dosel y financia directamente la conservación territorial del bosque primario.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                const el = document.getElementById('rutas-disponibles');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-[#954a17] hover:bg-[#b05b1f] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              Explorar Rutas Disponibles <ArrowDown size={15} />
            </button>
            <button
              onClick={() => setBookingModal(true)}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-semibold uppercase tracking-wider rounded-xl backdrop-blur-xs transition-all flex items-center gap-2"
            >
              Cotizar Experiencia Corporativa <Send size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* TELEMETRY STRIP */}
      <div className="w-full bg-[#071b12] text-white border-y border-[#143d29] py-4 px-6">
        <div className="max-w-[1320px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <b className="font-newsreader text-2xl text-[#d4a373] block">3 Cuencas</b>
            <span className="text-[11px] text-gray-300">Territorios Indígenas Protegidos</span>
          </div>
          <div>
            <b className="font-newsreader text-2xl text-[#4ade80] block">100%</b>
            <span className="text-[11px] text-gray-300">Retorno Directo a la Comunidad</span>
          </div>
          <div>
            <b className="font-newsreader text-2xl text-[#d4a373] block">0% Huella</b>
            <span className="text-[11px] text-gray-300">Turismo Carbono Negativo</span>
          </div>
          <div>
            <b className="font-newsreader text-2xl text-[#4ade80] block">Máx. 10</b>
            <span className="text-[11px] text-gray-300">Visitantes por Expedición</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: ROUTES GRID */}
      <div id="rutas-disponibles" className="max-w-[1320px] mx-auto px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#143d29] block">
            Experiencias Comunitarias Certificadas
          </span>
          <h2 className="font-newsreader text-3xl sm:text-4xl text-[#071b12] mt-1">
            Elige tu ruta agroforestal
          </h2>
          <p className="text-xs text-[#525f56] mt-2 leading-relaxed">
            Cada expedición está diseñada y liderada por los propios agricultores y comités de gobernanza de las comunidades amazónicas.
          </p>
        </div>

        {/* 3 Routes Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {routes.map((r) => (
            <div
              key={r.id}
              className={`agrotourism-route-card ${selectedRoute === r.id ? 'ring-2 ring-[#1b4332]' : ''}`}
            >
              <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                <img
                  src={`${import.meta.env.BASE_URL}${r.image}`}
                  alt={r.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#071b12]/90 text-white text-[10px] font-bold uppercase rounded-md backdrop-blur-xs">
                  {r.duration}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#954a17] text-white text-[11px] font-bold rounded-md shadow-xs">
                  {r.price} / pax
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {r.tags.map((t) => (
                      <span key={t} className="text-[10px] font-semibold text-[#143d29] bg-[#eef3eb] px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-newsreader text-xl text-[#071b12] font-semibold mb-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#954a17] font-medium mb-3 flex items-center gap-1">
                    <MapPin size={12} /> {r.community}
                  </p>
                  <p className="text-xs text-[#525f56] leading-relaxed mb-4">
                    {r.desc}
                  </p>

                  <div className="space-y-1.5 mb-6 pt-3 border-t border-gray-100">
                    {r.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#424843]">
                        <CheckCircle2 size={13} className="text-[#2a7a4c] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRoute(r.id);
                      setBookingModal(true);
                      setBooked(false);
                    }}
                    className="flex-1 py-3 bg-[#1b4332] hover:bg-[#143d29] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                    data-testid={`button-book-${r.id}`}
                  >
                    <Compass size={14} /> Reservar Cupo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3-DAY ITINERARY DETAILS */}
        <section className="bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-10 shadow-xs mb-12">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#143d29] block">
              Itinerario Vivencial Tipo · 3 Días / 2 Noches
            </span>
            <h2 className="font-newsreader text-3xl text-[#071b12] mt-1">
              ¿Cómo es un día en la comunidad con TrazAmazon?
            </h2>
            <p className="text-xs text-[#525f56] mt-2">
              Experiencias inmersivas pensadas para compradores B2B, casas de chocolate, tostadores y viajeros éticos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-[#faf9f4] rounded-xl border border-gray-200/60 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-sm">
                01
              </div>
              <b className="text-sm text-[#071b12]">Día 1: Navegación & Bienvenida Comunal</b>
              <p className="text-xs text-[#525f56] leading-relaxed">
                Salida en bote fluvial por la cuenca protegida. Arribo a la comunidad, presentación con el presidente comunal y comida tradicional en tambo bajo árboles centenarios.
              </p>
            </div>

            <div className="p-5 bg-[#faf9f4] rounded-xl border border-gray-200/60 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-[#954a17] text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <b className="text-sm text-[#071b12]">Día 2: Cosecha en Parcela & Cata en Origen</b>
              <p className="text-xs text-[#525f56] leading-relaxed">
                Trabajo en parcela agroforestal con la familia productora. Corte de mazorcas, desgranado manual, demostración de fermentación en cajones de laurel y cata sensorial bajo dosel.
              </p>
            </div>

            <div className="p-5 bg-[#faf9f4] rounded-xl border border-gray-200/60 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2a7a4c] text-white flex items-center justify-center font-bold text-sm">
                03
              </div>
              <b className="text-sm text-[#071b12]">Día 3: Reforestación & Retorno Fluvial</b>
              <p className="text-xs text-[#525f56] leading-relaxed">
                Siembra de un árbol nativo apadrinado en el lindero de conservación. Ceremonia de despedida comunal y retorno fluvial a la ciudad con tu lote o muestra certificada.
              </p>
            </div>
          </div>
        </section>

        {/* TRANSPARENCY IMPACT FUND INFOGRAPHIC */}
        <section className="bg-[#f4f7f2] border border-[#c9d8c4] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#143d29] block mb-1">
              Gobernanza Financiera & Impacto Social
            </span>
            <h3 className="font-newsreader text-2xl text-[#071b12]">
              ¿A dónde va el 100% de los fondos de agroturismo?
            </h3>
            <p className="text-xs text-[#525f56] mt-2 leading-relaxed">
              TrazAmazon opera con un modelo transparente auditado. El agroturismo no es un negocio externo, sino una herramienta comunitaria de bioeconomía para proteger la Amazonía.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
              <b className="text-2xl text-[#1b4332] font-mono block">70%</b>
              <span className="text-[10px] uppercase font-bold text-[#424843] block mt-1">Directo a Familias</span>
              <small className="text-[9px] text-[#727973]">Hospedaje, guiado, alimentación</small>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
              <b className="text-2xl text-[#954a17] font-mono block">20%</b>
              <span className="text-[10px] uppercase font-bold text-[#424843] block mt-1">Fondo Territorial</span>
              <small className="text-[9px] text-[#727973]">Patrullaje satelital y drones</small>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
              <b className="text-2xl text-[#2a7a4c] font-mono block">10%</b>
              <span className="text-[10px] uppercase font-bold text-[#424843] block mt-1">Logística & Seguros</span>
              <small className="text-[9px] text-[#727973]">Combustible fluvial y botiquín</small>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {/* BOOKING MODAL */}
      {bookingModal && (
        <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) setBookingModal(false); }}>
          <div className="modal-card booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-agrotour-title">
            <button
              className="modal-close"
              onClick={() => setBookingModal(false)}
              aria-label="Cerrar modal"
              data-testid="button-close-booking-modal"
            >
              <X size={19} />
            </button>

            {booked ? (
              <div className="success-state">
                <span className="success-icon">
                  <Check size={25} />
                </span>
                <p className="eyebrow">¡Solicitud de Reserva Confirmada!</p>
                <h2 className="serif text-2xl text-[#071b12]">Nos vemos en la Selva</h2>
                <p className="text-xs text-[#525f56] mt-2 leading-relaxed">
                  Hemos registrado tu solicitud para <b>{visitors} {visitors === 1 ? 'visitante' : 'visitantes'}</b> en la <b>{currentRoute.title}</b> ({currentRoute.community}) con fecha tentativa <b>{visitDate}</b>.
                  El coordinador comunitario de TrazAmazon se comunicará al correo <b>{email || 'registrado'}</b> en menos de 24 horas con las especificaciones de vestimenta y transporte fluvial.
                </p>
                <button
                  className="button button-dark mt-4"
                  onClick={() => setBookingModal(false)}
                  data-testid="button-done-booking"
                >
                  Entendido y Finalizar <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <span className="booking-symbol">
                  <Compass size={24} />
                </span>
                <p className="eyebrow">Agroturismo Comunitario TrazAmazon</p>
                <h2 id="booking-agrotour-title" className="serif text-2xl text-[#071b12]">
                  Reservar Expedición
                </h2>
                <p className="text-xs text-[#525f56] mt-1 mb-4">
                  Coordina tu visita a: <b>{currentRoute.title}</b> ({currentRoute.region}).
                </p>

                <form className="quote-form" onSubmit={handleBooking}>
                  <label>
                    Tu Nombre Completo
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      data-testid="input-agrotour-name"
                    />
                  </label>

                  <label>
                    Correo Electrónico de Contacto
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos@empresa.com"
                      data-testid="input-agrotour-email"
                    />
                  </label>

                  <label>
                    Empresa / Organización (Opcional)
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ej. Chocolats Gourmet / Particular"
                      data-testid="input-agrotour-company"
                    />
                  </label>

                  <label>
                    Fecha Tentativa de Visita
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      data-testid="input-agrotour-date"
                    />
                  </label>

                  <div className="guest-control">
                    <div>
                      <b>Número de Visitantes</b>
                      <span>Máximo 10 personas por expedición</span>
                    </div>
                    <div className="stepper">
                      <button
                        type="button"
                        onClick={() => setVisitors(Math.max(1, visitors - 1))}
                        aria-label="Quitar persona"
                      >
                        <Minus size={14} />
                      </button>
                      <strong>{visitors}</strong>
                      <button
                        type="button"
                        onClick={() => setVisitors(Math.min(10, visitors + 1))}
                        aria-label="Agregar persona"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button className="button button-dark button-wide mt-2" type="submit" data-testid="button-submit-agrotour-booking">
                    Confirmar Solicitud de Reserva <Send size={15} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/**
 * VISTA 3: Landing Page Oficial de la App Móvil de Campo Offline-First (/app)
 */
function MobileAppLandingPage() {
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setSelectedFaq(selectedFaq === idx ? null : idx);
  };

  return (
    <main className="grain min-h-screen flex flex-col bg-[#faf6f0]">
      <Header active="app" />

      {/* Hero Section de la App */}
      <section className="app-landing-hero">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f1ec] border border-[#2d6a4f]/20 text-[#1b4332] text-xs font-semibold uppercase tracking-wider mb-6">
            <Smartphone size={14} className="text-[#2d6a4f]" />
            Tecnología de Campo · Offline-First PWA & Android
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#1b4332] tracking-tight max-w-4xl mx-auto leading-[1.15]">
            La trazabilidad que empodera a la Amazonía <em>desde la parcela.</em>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#424843] max-w-3xl mx-auto leading-relaxed font-sans">
            Diseñada para técnicos y productores que operan en el corazón de la selva sin cobertura celular.
            Georreferenciación satelital submétrica NMEA, integración con balanzas Bluetooth y custodia comunitaria sin intermediarios.
          </p>

          {/* Badges de Descarga Oficial */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4" id="descarga">
            <a
              href="#google-play"
              className="app-badge-google-play"
              onClick={(e) => {
                e.preventDefault();
                alert('TrazAmazon Campo v2.4 está disponible en Google Play Store para cooperativas registradas.');
              }}
              data-testid="badge-google-play"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#34a853]" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186A2.298 2.298 0 0 1 3 20.573V3.427c0-.624.23-1.198.609-1.613zm11.24 11.24l2.25 2.25-9.845 5.684 7.595-7.934zm2.25-2.108l-2.25 2.25-7.595-7.934 9.845 5.684zm1.054 1.054l2.84 1.64a1.2 1.2 0 0 1 0 2.08l-2.84 1.64-2.108-2.68 2.108-2.68z" />
              </svg>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider block text-gray-400 font-sans leading-none">Disponible en</span>
                <span className="text-sm font-semibold tracking-wide font-sans text-white leading-tight">Google Play</span>
              </div>
            </a>

            <a
              href="#apk-direct"
              className="app-badge-apk"
              onClick={(e) => {
                e.preventDefault();
                alert('Iniciando descarga directa de instalador: TrazAmazon-Campo-v2.4-arm64.apk (18.4 MB)');
              }}
              data-testid="badge-apk-download"
            >
              <Download size={20} className="text-[#faf6f0]" />
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider block text-[#faf6f0]/70 font-sans leading-none">Descarga Directa</span>
                <span className="text-sm font-semibold tracking-wide font-sans text-white leading-tight">APK v2.4 (Campo)</span>
              </div>
              <span className="text-[10px] bg-[#112a20] text-[#b07d3b] font-mono px-2 py-0.5 rounded font-bold ml-1">18.4 MB</span>
            </a>

            <Link href="/marketplace" className="app-badge-pwa" data-testid="badge-pwa-launch">
              <Smartphone size={18} className="text-[#1b4332]" />
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider block text-[#555555] font-sans leading-none">Acceso Inmediato</span>
                <span className="text-sm font-semibold tracking-wide font-sans text-[#1b4332] leading-tight">PWA Web Responsive</span>
              </div>
            </Link>
          </div>

          {/* Mockups de Smartphone Fotorrealistas en Campo */}
          <div className="app-mockups-showcase">
            {/* Teléfono 1: Captura de Cosecha en Parcela */}
            <div className="field-phone-frame">
              <div className="field-phone-notch" />
              <div className="field-phone-screen">
                <div className="phone-screen-status-bar">
                  <span className="font-semibold">09:41</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="inline-flex items-center gap-0.5 text-[#2d6a4f] font-mono">
                      <LocateFixed size={11} /> 5 Satélites
                    </span>
                    <span className="text-red-700 font-medium">Sin Señal</span>
                    <span className="font-mono">98%</span>
                  </div>
                </div>

                <div className="phone-screen-body">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">TrazAmazon Campo</p>
                      <h4 className="text-xs font-serif font-bold text-[#1b4332]">Registro de Cosecha #042</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#e8f1ec] text-[#1b4332] border border-[#2d6a4f]/20">
                      Dexie.js
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm text-left">
                    <p className="text-[10px] text-gray-500 font-sans">Socia Productora</p>
                    <p className="text-xs font-bold text-[#1b4332]">María Quispe Huamán</p>
                    <p className="text-[10px] text-gray-600">Parcela #14 · Boca Pariamanu</p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-sans">Coordenadas GNSS</span>
                      <span className="text-[9px] bg-green-100 text-green-800 font-mono px-1 rounded">±1.8m NMEA</span>
                    </div>
                    <p className="text-[11px] font-mono font-bold text-[#1b4332] mt-0.5">12° 28&apos; 14&quot; S, 69° 12&apos; 08&quot; W</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Altitud: 260 msnm · Dosel Primario</p>
                  </div>

                  <div className="bg-[#f4efe6] p-2.5 rounded-xl border border-[#b07d3b]/30 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#956528] uppercase">Balanza Bluetooth</span>
                      <span className="text-[9px] bg-[#956528] text-white px-1.5 py-0.2 rounded font-mono">Conectada</span>
                    </div>
                    <p className="text-base font-bold text-[#1b4332] mt-0.5 font-mono">48.50 kg Netos</p>
                    <p className="text-[9px] text-gray-600">Tara: 0.50 kg · Saco GrainPro #09</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#eef7f2] border border-[#2d6a4f]/20 text-[10px] text-[#1b4332] text-left flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#2d6a4f] shrink-0" />
                    <span>Polígono Libre de Deforestación Sentinel-2 (EUDR)</span>
                  </div>

                  <button className="w-full mt-auto py-2 bg-[#1b4332] text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-1.5">
                    <Check size={13} /> Guardado en Memoria Local
                  </button>
                </div>
              </div>
            </div>

            {/* Teléfono 2: Traspaso P2P & Centro de Beneficio */}
            <div className="field-phone-frame hidden sm:block">
              <div className="field-phone-notch" />
              <div className="field-phone-screen">
                <div className="phone-screen-status-bar">
                  <span className="font-semibold">15:30</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="inline-flex items-center gap-0.5 text-[#b07d3b] font-mono">
                      <QrCode size={11} /> P2P Activo
                    </span>
                    <span className="text-gray-500">Offline</span>
                    <span className="font-mono">84%</span>
                  </div>
                </div>

                <div className="phone-screen-body">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Custodia P2P</p>
                      <h4 className="text-xs font-serif font-bold text-[#1b4332]">Traspaso de Cosecha</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#fbf0df] text-[#956528] border border-[#b07d3b]/20">
                      Sin Internet
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-[#faf6f0] rounded-lg border border-gray-200">
                      <QrCode size={90} className="text-[#1b4332]" />
                    </div>
                    <p className="text-[10px] font-mono text-gray-500 mt-2">Hash: 0x7e4a18f9c21b38e0</p>
                    <p className="text-[11px] font-bold text-[#1b4332] mt-0.5">Lote TA-0427-01 · 48.5 kg</p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm text-left">
                    <p className="text-[10px] text-gray-500 font-sans">Receptor / Centro de Beneficio</p>
                    <p className="text-xs font-bold text-[#1b4332]">Centro de Acopio Boca Pariamanu</p>
                    <p className="text-[10px] text-gray-600">Receptor: Santos Huamán (Responsable)</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#f0f9ff] border border-blue-200 text-[10px] text-blue-900 text-left flex items-center gap-1.5">
                    <CloudUpload size={14} className="text-blue-700 shrink-0" />
                    <span>Cola de sincronización: 3 lotes listos para WiFi comunitaria</span>
                  </div>

                  <button className="w-full mt-auto py-2 bg-[#2d6a4f] text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={13} /> Custodia Transferida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas de Campo */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-[#1b4332]">0%</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 uppercase tracking-wider">Datos Celulares Requeridos</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-[#1b4332]">±1.8m</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 uppercase tracking-wider">Precisión GPS NMEA</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-[#1b4332]">100%</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 uppercase tracking-wider">Cumplimiento Reg. EUDR</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-[#1b4332]">&lt; 2s</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 uppercase tracking-wider">Captura Balanza BLE</p>
          </div>
        </div>
      </section>

      {/* Los 4 Pilares Tecnológicos Offline-First */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest text-[#2d6a4f] font-semibold">Arquitectura de Alta Resiliencia</p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1b4332] mt-2">
            Ingeniería de software diseñada para la selva profunda
          </h2>
          <p className="text-gray-600 mt-4 leading-relaxed font-sans">
            La mayoría de las plataformas digitales asumen conectividad permanente. TrazAmazon fue construida bajo la filosofía de que la desconexión es la norma en la Amazonía.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="app-pillar-card">
            <div className="w-12 h-12 rounded-xl bg-[#e8f1ec] text-[#1b4332] flex items-center justify-center mb-4">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1b4332]">1. IndexedDB & Dexie.js Transaccional</h3>
            <p className="text-gray-600 mt-2 font-sans text-sm leading-relaxed">
              Base de datos relacional y transaccional alojada en el chip de memoria del teléfono. Cada pesaje, fotografía y firma comunitaria se sella criptográficamente en local. Cero pérdida de datos ante agotamiento repentino de batería.
            </p>
          </div>

          <div className="app-pillar-card">
            <div className="w-12 h-12 rounded-xl bg-[#e8f1ec] text-[#1b4332] flex items-center justify-center mb-4">
              <LocateFixed size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1b4332]">2. GPS Satelital NMEA Submétrico</h3>
            <p className="text-gray-600 mt-2 font-sans text-sm leading-relaxed">
              Conexión directa con constelaciones GNSS (GPS, GLONASS y Galileo) sin triangulación por antenas celulares. Genera polígonos cerrados de parcelas que satisfacen de manera estricta el estándar de debida diligencia de la Unión Europea (EUDR).
            </p>
          </div>

          <div className="app-pillar-card">
            <div className="w-12 h-12 rounded-xl bg-[#e8f1ec] text-[#1b4332] flex items-center justify-center mb-4">
              <QrCode size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1b4332]">3. Traspaso P2P por Códigos QR Dinámicos</h3>
            <p className="text-gray-600 mt-2 font-sans text-sm leading-relaxed">
              Permite transferir la custodia del lote entre el productor en su parcela y el camión o bote recolector sin necesidad de conexión a internet. Los teléfonos se sincronizan de dispositivo a dispositivo mediante código óptico de alta densidad.
            </p>
          </div>

          <div className="app-pillar-card">
            <div className="w-12 h-12 rounded-xl bg-[#e8f1ec] text-[#1b4332] flex items-center justify-center mb-4">
              <CloudUpload size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1b4332]">4. Sincronización Automática Cloud PostGIS</h3>
            <p className="text-gray-600 mt-2 font-sans text-sm leading-relaxed">
              Tan pronto el técnico o dirigente llega a una base con antena comunitaria o punto de acceso Starlink, el motor de sincronización resuelve conflictos y sube la cosecha a la base geoespacial PostGIS para su exhibición inmediata en el marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* Compatibilidad de Hardware y Balanzas de Campo */}
      <section className="py-16 bg-[#f4efe6] border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-widest text-[#956528] font-semibold">Equipamiento Técnico Homologado</p>
            <h2 className="text-3xl font-serif text-[#1b4332] mt-2">Compatibilidad de balanzas y dispositivos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-left">
              <span className="text-xs font-bold font-mono text-[#956528] uppercase tracking-wider">Sensores de Peso</span>
              <h4 className="text-lg font-bold font-serif text-[#1b4332] mt-1">Balanzas Bluetooth BLE</h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Homologada con balanzas ganaderas y de sacos Torrey BLE, Ohaus Defender y Kern industrial. Transmisión instantánea de tara y peso neto sin errores manuales.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-left">
              <span className="text-xs font-bold font-mono text-[#2d6a4f] uppercase tracking-wider">Dispositivos Móviles</span>
              <h4 className="text-lg font-bold font-serif text-[#1b4332] mt-1">Android 8.0+ & Rugerizados</h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Compatible con smartphones convencionales y equipos rugerizados de alta resistencia (Blackview, CAT, Ulefone IP68/IP69K) para trabajo bajo lluvias torrenciales y lodo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-left">
              <span className="text-xs font-bold font-mono text-[#1b4332] uppercase tracking-wider">Energía en Parcela</span>
              <h4 className="text-lg font-bold font-serif text-[#1b4332] mt-1">Kit Solar de Expedición</h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Operación asistida con panel solar plegable de 20W y banco de carga de 20,000 mAh que permite autonomía continua de hasta 14 días en áreas sin red eléctrica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Manual Operativo de Campo & FAQ */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-[#2d6a4f] font-semibold">Preguntas Frecuentes</p>
          <h2 className="text-3xl font-serif text-[#1b4332] mt-2">Manual operativo de campo</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: '¿Qué sucede si el teléfono se apaga durante el pesaje en la parcela?',
              a: 'TrazAmazon utiliza Dexie.js con almacenamiento síncrono en IndexedDB. Cada dígito y coordenada se guarda al instante. Al encender el equipo, la sesión de cosecha se recupera exactamente en el mismo estado sin pérdida de información.'
            },
            {
              q: '¿Cómo valida SENASA y la Unión Europea las coordenadas capturadas?',
              a: 'El aplicativo captura la trama NMEA sin procesar del sensor satelital, incluyendo número de satélites en vista y dilución de precisión (DOP). Esta metadata se adjunta al pasaporte digital inmutable del lote para auditoría satelital.'
            },
            {
              q: '¿Se necesita registrar una cuenta antes de salir al campo?',
              a: 'Sí. El técnico o socio debe iniciar sesión al menos una vez con cobertura (en la sede de la cooperativa o centro poblado) para descargar el padrón de productores y catálogo de parcelas de su comunidad.'
            },
            {
              q: '¿Cómo se descarga e instala el APK directo si no hay acceso a Google Play?',
              a: 'El archivo APK de 18.4 MB puede compartirse de celular a celular vía Bluetooth o cable USB entre brigadas. Una vez instalado, opera de manera 100% autónoma.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-serif font-bold text-[#1b4332] hover:bg-[#faf6f0] transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown size={18} className={`transition-transform text-gray-500 ${selectedFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {selectedFaq === idx && (
                <div className="px-5 pb-5 text-sm text-[#424843] font-sans leading-relaxed border-t border-gray-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Banner de Conversión Final */}
      <section className="py-14 bg-[#1b4332] text-white text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif">¿Deseas negociar lotes o gestionar tus compras?</h2>
          <p className="text-gray-300 mt-3 max-w-xl mx-auto text-base">
            Accede al panel mayorista B2B o explora los lotes de cacao, café, castaña y aguaje auditados en tiempo real.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/panel" className="button button-earth" data-testid="button-cta-panel">
              Acceder a Mi Panel B2B <ArrowRight size={16} />
            </Link>
            <Link href="/marketplace" className="button button-light" data-testid="button-cta-market">
              Explorar Catálogo Mayorista
            </Link>
          </div>
        </div>
      </section>


      <Footer />
    </main>
  );
}

/**
 * VISTA 4: Dashboard B2B Workbench Unificado (/panel) (Estilo Alibaba Gold Supplier)
 */
function B2BDashboardPage() {
  const { currentUser } = useAuth();
  const { orders, updateOrderStatus } = useB2BOrders();
  const [activeRole, setActiveRole] = useState<'buyer' | 'seller'>(currentUser?.role || 'seller');

  // Pestañas activas por rol (sin tab técnica de Supabase en UI)
  const [sellerTab, setSellerTab] = useState<'overview' | 'orders' | 'lots' | 'customize' | 'location' | 'satellite'>('overview');
  const [buyerTab, setBuyerTab] = useState<'overview' | 'orders' | 'passports' | 'profile'>('overview');

  // Perfil de la cooperativa y catálogo de lotes con fotos editables
  const [coopProfile, setCoopProfile] = useState<CooperativeProfile>(defaultCooperativeProfile);
  const [lots, setLots] = useState<ProductLot[]>(initialLots);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Estado para la Bandeja RFQ interactiva estilo LinkedIn
  const [selectedOrderId, setSelectedOrderId] = useState<string>('TA-ORD-881');
  const [rfqFilter, setRfqFilter] = useState<'all' | 'submitted' | 'quoted' | 'sample_dispatched' | 'contract_locked'>('all');
  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // Conversaciones por orden estilo LinkedIn
  const [orderConversations, setOrderConversations] = useState<Record<string, Array<{
    id: string;
    sender: 'buyer' | 'seller' | 'system';
    senderName: string;
    text: string;
    timestamp: string;
    trackingInfo?: string;
  }>>>({
    'TA-ORD-881': [
      {
        id: 'msg-1',
        sender: 'buyer',
        senderName: 'Alexandre Bonnat · Valrhona Artisans',
        text: 'Estimados productores de Bosque Vivo: Hemos evaluado la ficha de su Cacao Criollo TA-0427. Solicitamos el envío de una muestra técnica oficial de 500g para análisis sensorial y medición de cadmio en nuestro laboratorio central de Tain-l\'Hermitage.',
        timestamp: '16 May 2025 · 14:20'
      },
      {
        id: 'msg-2',
        sender: 'seller',
        senderName: 'Asociación Bosque Vivo (Boca Pariamanu)',
        text: 'Saludos cordiales Alexandre. Con mucho gusto preparamos la muestra técnica de 500g bajo protocolo fitosanitario SENASA en bolsa hermética GrainPro con precinto inviolable.',
        timestamp: '16 May 2025 · 15:45'
      },
      {
        id: 'msg-3',
        sender: 'system',
        senderName: 'Tracking Logístico TrazAmazon',
        text: 'Muestra despachada vía DHL Green Express (DHL-PE-7729104). Precinto SENASA-MDD-2025-0482 verificado en blockchain.',
        timestamp: '17 May 2025 · 10:15',
        trackingInfo: 'DHL-PE-7729104'
      }
    ],
    'TA-ORD-882': [
      {
        id: 'msg-4',
        sender: 'buyer',
        senderName: 'Alexandre Bonnat · Valrhona Artisans',
        text: 'Requerimiento de cotización mayorista para 35 sacos GrainPro de 60kg (2,100 kg) de Café de Sombra Altura Lote TA-0319 para tostado de edición limitada.',
        timestamp: '17 May 2025 · 09:45'
      },
      {
        id: 'msg-5',
        sender: 'seller',
        senderName: 'Asociación Bosque Vivo',
        text: 'Cotización aprobada a $9.80 USD/kg FOB Callao. Lote reservado en centro de acopio con trazabilidad satelital Sentinel-2.',
        timestamp: '17 May 2025 · 11:30'
      }
    ]
  });

  // Estado para creación y edición de lotes
  const [isCreateLotModalOpen, setIsCreateLotModalOpen] = useState(false);
  const [isEditLotModalOpen, setIsEditLotModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ProductLot | null>(null);

  const [newLotForm, setNewLotForm] = useState({
    name: '',
    fruit: 'Cacao' as ProductLot['fruit'],
    harvestTag: 'Cosecha Junio 2025',
    availableKg: 2400,
    totalKg: 2400,
    priceFob: 8.5,
    sensoryScore: '88.5 Pts SCAA',
    sensoryNotes: 'Notas pronunciadas a panela, frutos rojos secos y acidez brillante.',
    image: 'https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?auto=format&fit=crop&w=800&q=80'
  });

  // Estado de confirmación de georreferenciación
  const [locationConfirmed, setLocationConfirmed] = useState(true);
  const [confirmedTime, setConfirmedTime] = useState('18 May 2025, 15:35');

  // Cargar perfil desde Supabase / Local al montar
  useEffect(() => {
    fetchCooperativeProfile().then((profile) => {
      if (profile) setCoopProfile(profile);
    });
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Manejadores de subida de imágenes
  const handleAvatarUpload = (e: FormEvent<HTMLInputElement>) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoopProfile((prev) => ({ ...prev, avatarUrl: String(reader.result) }));
        showNotice('Logo / Avatar oficial actualizado con éxito.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: FormEvent<HTMLInputElement>) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoopProfile((prev) => ({ ...prev, bannerUrl: String(reader.result) }));
        showNotice('Banner panorámico de tienda actualizado con éxito.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLeaderImageUpload = (e: FormEvent<HTMLInputElement>) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoopProfile((prev) => ({ ...prev, leaderImageUrl: String(reader.result) }));
        showNotice('Fotografía del dirigente / socio actualizada.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFacilityImageUpload = (index: number, e: FormEvent<HTMLInputElement>) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoopProfile((prev) => {
          const updated = [...prev.facilityImages];
          updated[index] = String(reader.result);
          return { ...prev, facilityImages: updated };
        });
        showNotice(`Fotografía de instalación #${index + 1} actualizada con éxito.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductPhotoUpload = (lotId: string, e: FormEvent<HTMLInputElement>) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const photoUrl = String(reader.result);
        setLots((prev) =>
          prev.map((l) => (l.id === lotId ? { ...l, image: photoUrl } : l))
        );
        showNotice(`Fotografía del lote ${lotId} actualizada en la vitrina comercial.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar perfil de cooperativa
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    await saveCooperativeProfile(coopProfile);
    showNotice('Perfil de la cooperativa guardado y sincronizado con éxito.');
  };

  // Auto-captura de coordenadas GPS
  const handleAutoCaptureGps = () => {
    setCoopProfile((prev) => ({
      ...prev,
      latitude: '-12.4667',
      longitude: '-69.2000',
      gpsAccuracy: '±1.8m NMEA Submétrico'
    }));
    showNotice('Coordenadas GNSS capturadas del sensor de campo: -12.4667°, -69.2000° (Boca Pariamanu).');
  };

  // Confirmar y fijar ubicación georreferenciada en mapa
  const handleConfirmLocation = async () => {
    setLocationConfirmed(true);
    const nowStr = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    setConfirmedTime(`Hoy, ${nowStr}`);
    await saveCooperativeProfile(coopProfile);
    showNotice('Ubicación de parcela confirmada y fijada para cumplimiento regulatorio EUDR.');
  };

  // Enviar mensaje en chat de negociación estilo LinkedIn
  const handleSendChatMessage = (orderId: string) => {
    if (!chatMessageInput.trim()) return;
    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'seller' as const,
      senderName: coopProfile.name,
      text: chatMessageInput.trim(),
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    };
    setOrderConversations((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), newMsg]
    }));
    setChatMessageInput('');
    showNotice('Mensaje enviado al comprador con éxito.');
  };

  // Crear nuevo lote
  const handleCreateLotSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newLotForm.name.trim()) return;
    const newId = `TA-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: ProductLot = {
      id: newId,
      fruit: newLotForm.fruit,
      name: newLotForm.name,
      cooperative: coopProfile.name,
      region: coopProfile.region,
      community: coopProfile.community,
      priceFob: Number(newLotForm.priceFob),
      unit: 'kg',
      minimumMoq: '500 kg',
      availableKg: Number(newLotForm.availableKg),
      totalKg: Number(newLotForm.totalKg),
      dispatchStatus: 'Disponible en Acopio',
      harvestTag: newLotForm.harvestTag,
      certifications: ['Orgánico USDA', 'EUDR Cero Deforestación', 'Fair Trade'],
      image: newLotForm.image,
      harvestDate: 'Mayo 2025',
      farmerName: coopProfile.leaderName,
      farmerImage: coopProfile.leaderImageUrl,
      coordinates: `${coopProfile.latitude}°, ${coopProfile.longitude}°`,
      sensoryScore: newLotForm.sensoryScore,
      specs: {
        k1: 'Humedad', v1: '6.8%',
        k2: 'Fermentación', v2: '85%',
        k3: 'Altitud', v3: '260 msnm'
      },
      sensoryNotes: newLotForm.sensoryNotes || 'Notas florales, acidez cítrica balanceada y retrogusto persistente.',
      story: 'Cultivado bajo sistemas agroforestales en la cuenca del río Pariamanu.',
      ndviScore: 0.89,
      lotHash: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase()
    };
    setLots((prev) => [created, ...prev]);
    setIsCreateLotModalOpen(false);
    setNewLotForm({
      name: '',
      fruit: 'Cacao',
      harvestTag: 'Cosecha Junio 2025',
      availableKg: 2000,
      totalKg: 2000,
      priceFob: 8.5,
      sensoryScore: '88 Pts SCAA',
      sensoryNotes: '',
      image: 'https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?auto=format&fit=crop&w=800&q=80'
    });
    showNotice(`Nueva cosecha ${created.name} (${created.id}) publicada con éxito.`);
  };

  // Abrir modal de edición de lote
  const handleOpenEditLot = (lot: ProductLot) => {
    setEditingLot({ ...lot });
    setIsEditLotModalOpen(true);
  };

  // Guardar cambios de edición de lote
  const handleSaveEditLot = (e: FormEvent) => {
    e.preventDefault();
    if (!editingLot) return;
    setLots((prev) => prev.map((l) => (l.id === editingLot.id ? editingLot : l)));
    setIsEditLotModalOpen(false);
    showNotice(`Condiciones del lote ${editingLot.name} (${editingLot.id}) actualizadas con éxito.`);
  };

  // KPIs Comprador
  const buyerOrders = orders.filter((o) => o.buyerOrg.toLowerCase().includes('valrhona') || activeRole === 'buyer');
  const activeSamplesCount = buyerOrders.filter((o) => o.type === 'sample').length;
  const contractedLotsCount = buyerOrders.filter((o) => o.type === 'commercial_rfq').length;
  const totalVolumeKg = buyerOrders.reduce((acc, curr) => acc + curr.requestedKg, 0);
  const totalEscrowUsd = buyerOrders
    .filter((o) => o.escrowStatus === 'funded')
    .reduce((acc, curr) => acc + curr.totalUsd, 42100);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
  // KPIs Vendedor
  const pendingRfqsCount = orders.filter((o) => o.status === 'submitted').length;
  const totalLotsPublished = lots.length;
  const totalStockKg = lots.reduce((acc, curr) => acc + curr.availableKg, 0);

  return (
    <main className="grain min-h-screen flex flex-col bg-[#fbf9f5]">
      <Header active="panel" />

      <div className="b2b-panel-container">
        {/* Cabecera Superior con Breadcrumb y Estado de Supabase */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-xs uppercase tracking-wider text-[#555555] font-sans flex items-center gap-2">
            <Link href="/" className="hover:text-[#1b4332] font-semibold">Inicio</Link>
            <span>/</span>
            <span className="text-[#1b4332] font-bold">Mi Panel B2B</span>
            <span>/</span>
            <span className="text-gray-500">Workbench Operativo</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f1ec] border border-[#2d6a4f]/25 text-[11px] font-mono font-semibold text-[#1b4332]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Red Mayorista: Operativa en Línea
          </div>
        </div>

        {/* Notificación de Acción Transaccional */}
        {actionNotice && (
          <div className="mb-6 p-4 rounded-xl bg-[#eef7f2] border border-[#2d6a4f]/30 text-[#1b4332] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-[#2d6a4f] shrink-0" />
              <span className="text-sm font-semibold">{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Barra de Cambio de Perspectiva Bilateral */}
        <div className="b2b-role-switcher-bar">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1b4332] text-[#faf6f0] flex items-center justify-center font-bold text-sm overflow-hidden">
              {activeRole === 'buyer' ? (
                'V'
              ) : (
                <img src={coopProfile.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-sans">Perspectiva Activa:</p>
              <h3 className="text-sm font-bold text-[#1b4332]">
                {activeRole === 'buyer' ? 'Valrhona Artisans B2B (Francia)' : coopProfile.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-sans hidden sm:inline">Modo:</span>
            <div className="b2b-role-pill-group">
              <button
                onClick={() => setActiveRole('buyer')}
                className={`b2b-role-btn ${activeRole === 'buyer' ? 'active' : ''}`}
                data-testid="role-switch-buyer"
              >
                <ShoppingCart size={15} />
                <span>Comprador B2B</span>
              </button>
              <button
                onClick={() => setActiveRole('seller')}
                className={`b2b-role-btn ${activeRole === 'seller' ? 'active' : ''}`}
                data-testid="role-switch-seller"
              >
                <Store size={15} />
                <span>Cooperativa Productora</span>
              </button>
            </div>
          </div>
        </div>

        {/* ESTRUCTURA WORKBENCH: SIDEBAR + ÁREA DE CONTENIDO */}
        <div className="b2b-workbench-layout">
          {/* SIDEBAR DE UTILIDADES LATERAL */}
          <aside className="b2b-workbench-sidebar">
            <div className="b2b-sidebar-profile">
              <div className="w-9 h-9 rounded-lg bg-[#faf6f0] border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                {activeRole === 'buyer' ? (
                  <Building2 size={18} className="text-[#1b4332]" />
                ) : (
                  <img src={coopProfile.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1b4332] truncate">
                  {activeRole === 'buyer' ? 'Valrhona B2B' : coopProfile.name}
                </p>
                <span className="text-[10px] text-gray-500 block truncate">
                  {activeRole === 'buyer' ? 'Comprador Mayorista' : 'Gold Supplier Agroforestal'}
                </span>
              </div>
            </div>

            <nav aria-label="Navegación del Workbench">
              {activeRole === 'buyer' ? (
                <>
                  <button
                    onClick={() => setBuyerTab('overview')}
                    className={`b2b-sidebar-nav-item ${buyerTab === 'overview' ? 'active' : ''}`}
                    data-testid="buyer-tab-overview"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutGrid size={15} /> Resumen General
                    </span>
                  </button>
                  <button
                    onClick={() => setBuyerTab('orders')}
                    className={`b2b-sidebar-nav-item ${buyerTab === 'orders' ? 'active' : ''}`}
                    data-testid="buyer-tab-orders"
                  >
                    <span className="flex items-center gap-2">
                      <PackageCheck size={15} /> Cotizaciones & Muestras
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-current font-mono">
                      {orders.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setBuyerTab('passports')}
                    className={`b2b-sidebar-nav-item ${buyerTab === 'passports' ? 'active' : ''}`}
                    data-testid="buyer-tab-passports"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck size={15} /> Pasaportes EUDR & Calidad
                    </span>
                  </button>
                  <button
                    onClick={() => setBuyerTab('profile')}
                    className={`b2b-sidebar-nav-item ${buyerTab === 'profile' ? 'active' : ''}`}
                    data-testid="buyer-tab-profile"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 size={15} /> Perfil de Comprador
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSellerTab('overview')}
                    className={`b2b-sidebar-nav-item ${sellerTab === 'overview' ? 'active' : ''}`}
                    data-testid="seller-tab-overview"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutGrid size={15} /> Resumen de Ventas
                    </span>
                  </button>
                  <button
                    onClick={() => setSellerTab('orders')}
                    className={`b2b-sidebar-nav-item ${sellerTab === 'orders' ? 'active' : ''}`}
                    data-testid="seller-tab-orders"
                  >
                    <span className="flex items-center gap-2">
                      <Clock size={15} /> Bandeja de RFQs
                    </span>
                    {pendingRfqsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold font-mono">
                        {pendingRfqsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setSellerTab('lots')}
                    className={`b2b-sidebar-nav-item ${sellerTab === 'lots' ? 'active' : ''}`}
                    data-testid="seller-tab-lots"
                  >
                    <span className="flex items-center gap-2">
                      <Boxes size={15} /> Gestión de Lotes & Fotos
                    </span>
                  </button>
                  <button
                    onClick={() => setSellerTab('customize')}
                    className={`b2b-sidebar-nav-item ${sellerTab === 'customize' ? 'active' : ''}`}
                    data-testid="seller-tab-customize"
                  >
                    <span className="flex items-center gap-2">
                      <Store size={15} /> Personalizar Perfil & Fotos
                    </span>
                  </button>
                  <button
                    onClick={() => setSellerTab('location')}
                    className={`b2b-sidebar-nav-item ${sellerTab === 'location' ? 'active' : ''}`}
                    data-testid="seller-tab-location"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={15} /> Ubicación Satelital & GPS
                    </span>
                  </button>
                  <button
                    onClick={() => setSellerTab('satellite')}
                    className={`b2b-sidebar-nav-item ${sellerTab === 'satellite' ? 'active' : ''}`}
                    data-testid="seller-tab-satellite"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={15} /> Auditoría Sentinel-2
                    </span>
                  </button>

                </>
              )}
            </nav>
          </aside>

          {/* ÁREA DE CONTENIDO PRINCIPAL */}
          <div className="b2b-workbench-content">
            {/* ===================================================================
                VISTAS DEL COMPRADOR
                =================================================================== */}
            {activeRole === 'buyer' && (
              <>
                {buyerTab === 'overview' && (
                  <div>
                    <div className="b2b-banner">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-mono tracking-wider uppercase mb-2">
                            Comprador Corporativo Verificado · Tax ID: FR-84920192
                          </span>
                          <h1 className="text-2xl sm:text-3xl font-serif">Valrhona Artisans B2B</h1>
                          <p className="text-sm text-gray-200 mt-1">
                            Responsable de Abastecimiento: Alexandre Bonnat · Tain-l&apos;Hermitage, Francia
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
                          <ShieldCheck size={24} className="text-[#b07d3b]" />
                          <div className="text-left text-xs">
                            <p className="font-bold text-white">Garantía Trade Assurance</p>
                            <p className="text-gray-300">Fondos protegidos en Escrow bancario</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="b2b-kpis-grid">
                      <div className="b2b-kpi-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Muestras Activas</span>
                          <PackageCheck size={18} className="text-[#2d6a4f]" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-[#1b4332] mt-3">{activeSamplesCount}</p>
                        <p className="text-xs text-gray-500 mt-1">En tránsito courier puerta a puerto</p>
                      </div>

                      <div className="b2b-kpi-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Lotes Contratados</span>
                          <Handshake size={18} className="text-[#b07d3b]" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-[#1b4332] mt-3">{contractedLotsCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Acuerdos comerciales firmados</p>
                      </div>

                      <div className="b2b-kpi-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Volumen Comprometido</span>
                          <Layers size={18} className="text-[#1b4332]" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-[#1b4332] mt-3">{totalVolumeKg.toLocaleString()} kg</p>
                        <p className="text-xs text-gray-500 mt-1">Cacao criollo y café especial</p>
                      </div>

                      <div className="b2b-kpi-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Protección Escrow</span>
                          <ShieldCheck size={18} className="text-[#2d6a4f]" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-[#1b4332] mt-3">${totalEscrowUsd.toLocaleString()} USD</p>
                        <p className="text-xs text-gray-500 mt-1">Depósitos asegurados en custodia</p>
                      </div>
                    </div>
                  </div>
                )}

                {buyerTab === 'orders' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif font-bold text-[#1b4332]">Mis Cotizaciones (RFQs) y Pedidos de Muestras</h2>
                      <Link href="/marketplace" className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1">
                        Solicitar Más Cosechas <ArrowRight size={14} />
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {orders.map((ord) => {
                        const isSample = ord.type === 'sample';
                        return (
                          <div key={ord.id} className="b2b-order-card" data-testid={`buyer-order-${ord.id}`}>
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                    {ord.id}
                                  </span>
                                  <h4 className="font-serif font-bold text-[#1b4332] text-base">{ord.lotName}</h4>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Lote <b>{ord.lotId}</b> · Cooperativa: <b>{ord.cooperative}</b> · Solicitado: {ord.createdAt}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {ord.status === 'submitted' && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                    Enviada · Esperando Proforma
                                  </span>
                                )}
                                {ord.status === 'quoted' && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                                    Proforma Aprobada · Por Despachar
                                  </span>
                                )}
                                {ord.status === 'sample_dispatched' && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Muestra Despachada (En Tránsito)
                                  </span>
                                )}
                                {ord.status === 'contract_locked' && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                                    Contrato Asegurado (Escrow 100%)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stepper de Seguimiento Logístico */}
                            <div className="b2b-stepper">
                              <div className="b2b-step-item completed">
                                <div className="b2b-step-circle">
                                  <Check size={14} />
                                </div>
                                <span className="text-[11px] font-semibold text-gray-700">1. Solicitud Recibida</span>
                              </div>

                              <div className={`b2b-step-item ${ord.status !== 'submitted' ? 'completed' : 'active'}`}>
                                <div className="b2b-step-circle">
                                  {ord.status !== 'submitted' ? <Check size={14} /> : '2'}
                                </div>
                                <span className="text-[11px] font-semibold text-gray-700">2. Proforma / Aprobación</span>
                              </div>

                              <div className={`b2b-step-item ${ord.status === 'sample_dispatched' || ord.status === 'contract_locked' ? 'completed' : ''}`}>
                                <div className="b2b-step-circle">
                                  {ord.status === 'sample_dispatched' || ord.status === 'contract_locked' ? <Check size={14} /> : '3'}
                                </div>
                                <span className="text-[11px] font-semibold text-gray-700">3. Despacho Courier SENASA</span>
                              </div>

                              <div className={`b2b-step-item ${ord.status === 'contract_locked' ? 'completed' : ''}`}>
                                <div className="b2b-step-circle">
                                  {ord.status === 'contract_locked' ? <Check size={14} /> : '4'}
                                </div>
                                <span className="text-[11px] font-semibold text-gray-700">4. Arribo a Puerto / Escrow</span>
                              </div>
                            </div>

                            {/* Caja de Logística e Información */}
                            <div className="b2b-logistics-box">
                              <div className="text-xs text-gray-700">
                                <span className="font-semibold block text-[#1b4332]">Requerimiento:</span>
                                {isSample ? 'Muestra técnica oficial de 500g' : `Lote comercial: ${ord.requestedKg.toLocaleString()} kg`} · Valor: ${ord.totalUsd.toLocaleString()} USD
                              </div>

                              {ord.trackingCode && (
                                <div className="text-xs text-gray-700 font-mono">
                                  <span className="text-gray-500 block font-sans">Guía Courier / Naviera:</span>
                                  <span className="font-bold text-[#1b4332]">{ord.courier}: {ord.trackingCode}</span>
                                </div>
                              )}

                              {ord.senasaGuide && (
                                <div className="text-xs text-gray-700 font-mono">
                                  <span className="text-gray-500 block font-sans">Precinto Fitosanitario:</span>
                                  <span className="text-[#2d6a4f] font-semibold">{ord.senasaGuide}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <Link href={`/lote/${ord.lotId}`} className="button button-small button-outline text-xs">
                                  Ver Lote en Marketplace
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {buyerTab === 'passports' && (
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#1b4332] mb-4">Pasaportes Ambientales EUDR y Fichas Técnicas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f1ec] text-[#1b4332] font-mono">
                            PORTAL TRACES NT
                          </span>
                          <h3 className="font-serif font-bold text-[#1b4332] text-lg mt-2">Pasaporte GeoJSON Polígonos</h3>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            Coordenadas poligonales de parcelas para verificación automática en aduanas europeas (Reglamento UE 2023/1115).
                          </p>
                        </div>
                        <button
                          onClick={() => alert('Descargando archivo vectorial: pasaporte-eudr-poligonos-TA0427.geojson')}
                          className="mt-4 button button-small button-dark w-full text-xs justify-center"
                        >
                          <Download size={14} /> Descargar GeoJSON (.json)
                        </button>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f1ec] text-[#1b4332] font-mono">
                            ISO/IEC 17025
                          </span>
                          <h3 className="font-serif font-bold text-[#1b4332] text-lg mt-2">Certificado Metales & Cadmio</h3>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            Ensayo químico acreditado: Cadmio &lt; 0.28 ppm (Límite UE: 0.60 ppm) y Humedad 6.8%.
                          </p>
                        </div>
                        <button
                          onClick={() => alert('Descargando certificado oficial: laboratorio-cadmio-humedad-TA0427.pdf')}
                          className="mt-4 button button-small button-dark w-full text-xs justify-center"
                        >
                          <Download size={14} /> Descargar Certificado (PDF)
                        </button>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f1ec] text-[#1b4332] font-mono">
                            SCAA / Q-GRADER
                          </span>
                          <h3 className="font-serif font-bold text-[#1b4332] text-lg mt-2">Ficha Técnica Sensorial</h3>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            Perfil de cata: 88 Puntos SCAA, descriptores de notas a frutos rojos secos, panela de caña y jazmín silvestre.
                          </p>
                        </div>
                        <button
                          onClick={() => alert('Descargando ficha sensorial: reporte-sensorial-scaa-TA0427.pdf')}
                          className="mt-4 button button-small button-dark w-full text-xs justify-center"
                        >
                          <Download size={14} /> Descargar Ficha Sensorial
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {buyerTab === 'profile' && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
                    <h2 className="text-xl font-serif font-bold text-[#1b4332] mb-1">Perfil Corporativo del Comprador</h2>
                    <p className="text-xs text-gray-500 mb-6">Datos fiscales e institucionales registrados para emisión de contratos comerciales.</p>

                    <div className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500 block">Razón Social</span>
                          <p className="font-bold text-[#1b4332] text-sm">Valrhona Artisans B2B S.A.S.</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Número de Identificación Fiscal (EU VAT / Tax ID)</span>
                          <p className="font-mono font-bold text-[#1b4332]">FR-84920192</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500 block">Dirección Corporativa</span>
                          <p className="text-gray-700">14 Avenue du Président Roosevelt, 26600 Tain-l&apos;Hermitage, Francia</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Responsable de Adquisiciones</span>
                          <p className="text-gray-700">Alexandre Bonnat · procurement@valrhona-artisans.com</p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#faf6f0] rounded-xl border border-[#b07d3b]/30">
                        <span className="font-bold text-[#956528] block mb-1">Cuenta de Fideicomiso Comercial Escrow</span>
                        <p className="text-gray-600">
                          Fondos custodiados bajo garantía Trade Assurance con el Banco de Crédito del Perú (BCP) y Société Générale Paris.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===================================================================
                VISTAS DE LA COOPERATIVA PRODUCTORA (VENDEDOR)
                =================================================================== */}
            {activeRole === 'seller' && (
              <>
                {/* 1. RESUMEN DE VENTAS */}
                {sellerTab === 'overview' && (
                  <div>
                    <div className="b2b-banner">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-mono tracking-wider uppercase mb-2">
                            Cooperativa Productora · RUC Agrario: {coopProfile.ruc}
                          </span>
                          <h1 className="text-2xl sm:text-3xl font-serif">{coopProfile.name}</h1>
                          <p className="text-sm text-gray-200 mt-1">
                            {coopProfile.community} · {coopProfile.department}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1.5 rounded-lg bg-[#b07d3b] text-white text-xs font-bold font-mono">
                            Gold Supplier Agroforestal
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-[#112a20] text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                            Sentinel-2 Verificado (4,250 ha)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="b2b-kpis-grid">
                      <div className="b2b-kpi-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Lotes en Vitrina</span>
                          <Store size={18} className="text-[#2d6a4f]" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-[#1b4332] mt-3">{totalLotsPublished}</p>
                        <p className="text-xs text-gray-500 mt-1">Cosechas activas en marketplace</p>
                      </div>

                      <div className="b2b-kpi-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Stock Disponible</span>
                          <Layers size={18} className="text-[#b07d3b]" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-[#1b4332] mt-3">{totalStockKg.toLocaleString()} kg</p>
                        <p className="text-xs text-gray-500 mt-1">Almacén Callao y Puerto Maldonado</p>
                      </div>

                      <div className="b2b-kpi-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Solicitudes RFQ</span>
                          <Clock size={18} className="text-[#1b4332]" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-[#1b4332] mt-3">{pendingRfqsCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Cotizaciones pendientes de respuesta</p>
                      </div>

                      <div className="b2b-kpi-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-sans">Ingresos Proyectados</span>
                          <TrendingUp size={18} className="text-[#2d6a4f]" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-[#1b4332] mt-3">$98,400 USD</p>
                        <p className="text-xs text-gray-500 mt-1">Contratos FOB temporada 2025</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BANDEJA DE RFQS ESTILO LINKEDIN (2 COLUMNAS) */}
                {sellerTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-serif font-bold text-[#1b4332]">Bandeja de Solicitudes RFQ y Pedidos de Muestras</h2>
                        <p className="text-xs text-gray-500">Gestión directa de solicitudes comerciales y chat de negociación con compradores B2B.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Filtrar:</span>
                        <select
                          value={rfqFilter}
                          onChange={(e) => setRfqFilter(e.target.value as any)}
                          className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-sans text-gray-700"
                        >
                          <option value="all">Todas las solicitudes ({orders.length})</option>
                          <option value="submitted">Nuevas (Acción requerida)</option>
                          <option value="quoted">Cotizaciones Aprobadas</option>
                          <option value="sample_dispatched">Muestras en Tránsito</option>
                          <option value="contract_locked">Contratos Cerrados</option>
                        </select>
                      </div>
                    </div>

                    {/* Layout de 2 columnas LinkedIn */}
                    <div className="b2b-inbox-layout">
                      {/* Columna Izquierda: Lista de Solicitudes */}
                      <div className="b2b-inbox-sidebar">
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Buscar comprador o ID..."
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg font-sans focus:outline-none focus:border-[#2d6a4f]"
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
                          {orders
                            .filter((o) => rfqFilter === 'all' || o.status === rfqFilter)
                            .map((ord) => {
                              const isSelected = selectedOrderId === ord.id;
                              return (
                                <div
                                  key={ord.id}
                                  onClick={() => setSelectedOrderId(ord.id)}
                                  className={`b2b-inbox-item ${isSelected ? 'active' : ''}`}
                                  data-testid={`inbox-item-${ord.id}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                      {ord.buyerOrg.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <h4 className="text-xs font-bold text-[#1b4332] truncate">{ord.buyerOrg}</h4>
                                        <span className="text-[10px] text-gray-400 shrink-0 font-mono">16 May</span>
                                      </div>
                                      <p className="text-[11px] text-gray-600 truncate mt-0.5 font-medium">
                                        {ord.lotName}
                                      </p>
                                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                        Volumen: <b>{ord.requestedKg.toLocaleString()} kg</b> · {ord.id}
                                      </p>
                                      <div className="mt-2 flex items-center justify-between">
                                        {ord.status === 'submitted' && (
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                                            Nueva Solicitud
                                          </span>
                                        )}
                                        {ord.status === 'quoted' && (
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                                            Cotización Lista
                                          </span>
                                        )}
                                        {ord.status === 'sample_dispatched' && (
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                            Muestra Despachada
                                          </span>
                                        )}
                                        {ord.status === 'contract_locked' && (
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800">
                                            Escrow Formalizado
                                          </span>
                                        )}
                                        <span className="text-[10px] text-gray-400">{ord.buyerCountry}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Columna Derecha: Detalle de Requerimiento + Chat */}
                      {selectedOrder ? (
                        <div className="flex-1 flex flex-col min-w-0 bg-white">
                          {/* Header del Chat */}
                          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-[#faf9f6]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-sm">
                                {selectedOrder.buyerOrg.charAt(0)}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-[#1b4332]">{selectedOrder.buyerOrg}</h3>
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    Comprador Verificado
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  Responsable: Alexandre Bonnat · {selectedOrder.buyerCountry} · Orden {selectedOrder.id}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link href={`/lote/${selectedOrder.lotId}`} className="button button-small button-outline text-xs">
                                Ver Ficha de Lote
                              </Link>
                            </div>
                          </div>

                          {/* Tarjeta de Resumen Comercial estilo LinkedIn Project Card */}
                          <div className="p-4 bg-[#fbf9f5] border-b border-gray-200 text-left">
                            <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                              <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                <img
                                  src={lots.find(l => l.id === selectedOrder.lotId)?.image || 'https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?auto=format&fit=crop&w=800&q=80'}
                                  alt={selectedOrder.lotName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-bold text-[#1b4332] truncate">{selectedOrder.lotName}</h4>
                                  <span className="font-mono text-xs font-bold text-[#1b4332]">
                                    ${selectedOrder.pricePerKg.toFixed(2)} USD / kg FOB
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  Volumen Solicitado: <b>{selectedOrder.requestedKg.toLocaleString()} kg</b> · Modalidad: {selectedOrder.type === 'sample' ? 'Muestra Técnica de Calidad' : 'Pedido Comercial Mayorista'}
                                </p>
                                {selectedOrder.notes && (
                                  <p className="text-xs text-gray-500 italic mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                                    "{selectedOrder.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Hilo de Mensajes (Chat) */}
                          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#ffffff] min-h-[260px] text-left">
                            {(orderConversations[selectedOrder.id] || []).map((msg) => {
                              if (msg.sender === 'system') {
                                return (
                                  <div key={msg.id} className="my-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-900">
                                    <p className="font-bold">{msg.text}</p>
                                    <span className="text-[10px] text-emerald-700 block mt-1">{msg.timestamp}</span>
                                  </div>
                                );
                              }
                              const isMe = msg.sender === 'seller';
                              return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <span className="text-[10px] text-gray-400 mb-1 px-1">{msg.senderName} · {msg.timestamp}</span>
                                  <div className={isMe ? 'b2b-chat-bubble-seller' : 'b2b-chat-bubble-buyer'}>
                                    <p>{msg.text}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Barra de Acciones Comerciales Directas */}
                          <div className="p-3 bg-[#fbf9f5] border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {selectedOrder.status === 'submitted' && (
                                <>
                                  <button
                                    onClick={() => {
                                      updateOrderStatus(selectedOrder.id, 'quoted');
                                      showNotice(`Cotización para orden ${selectedOrder.id} aprobada con éxito.`);
                                    }}
                                    className="b2b-action-btn-green text-xs"
                                    data-testid={`btn-accept-quote-${selectedOrder.id}`}
                                  >
                                    <Check size={14} /> Aceptar Cotización (RFQ)
                                  </button>
                                  <button
                                    onClick={() => {
                                      const tracking = 'DHL-PE-' + Math.floor(1000000 + Math.random() * 9000000);
                                      const senasa = 'SENASA-MDD-2025-' + Math.floor(1000 + Math.random() * 9000);
                                      updateOrderStatus(selectedOrder.id, 'sample_dispatched', {
                                        trackingCode: tracking,
                                        courier: 'DHL Green Express',
                                        senasaGuide: senasa,
                                      });
                                      const sysMsg = {
                                        id: 'msg-' + Date.now(),
                                        sender: 'system' as const,
                                        senderName: 'Tracking Logístico DHL',
                                        text: `Muestra despachada para ${selectedOrder.buyerOrg}. Guía Courier: ${tracking} y precinto fitosanitario ${senasa}.`,
                                        timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                                      };
                                      setOrderConversations(prev => ({
                                        ...prev,
                                        [selectedOrder.id]: [...(prev[selectedOrder.id] || []), sysMsg]
                                      }));
                                      showNotice(`Muestra despachada. Guía ${tracking}.`);
                                    }}
                                    className="b2b-action-btn-brown text-xs"
                                    data-testid={`btn-dispatch-sample-${selectedOrder.id}`}
                                  >
                                    <Truck size={14} /> Despachar Muestra DHL (SENASA)
                                  </button>
                                </>
                              )}

                              {(selectedOrder.status === 'quoted' || selectedOrder.status === 'sample_dispatched') && (
                                <button
                                  onClick={() => {
                                    updateOrderStatus(selectedOrder.id, 'contract_locked', {
                                      escrowStatus: 'funded',
                                      trackingCode: selectedOrder.trackingCode || 'HAPAG-LLOYD-FCL-' + Math.floor(1000 + Math.random() * 9000),
                                      courier: selectedOrder.courier || 'Naviera Marítima Callao',
                                      senasaGuide: selectedOrder.senasaGuide || 'SENASA-EXP-2025-9941'
                                    });
                                    const sysMsg = {
                                      id: 'msg-' + Date.now(),
                                      sender: 'system' as const,
                                      senderName: 'Custodia Escrow TrazAmazon',
                                      text: `Contrato comercial formalizado para ${selectedOrder.buyerOrg}. Fondos en custodia Escrow asegurados al 100%.`,
                                      timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                                    };
                                    setOrderConversations(prev => ({
                                      ...prev,
                                      [selectedOrder.id]: [...(prev[selectedOrder.id] || []), sysMsg]
                                    }));
                                    showNotice(`Contrato con Escrow formalizado para ${selectedOrder.buyerOrg}.`);
                                  }}
                                  className="b2b-action-btn-green text-xs"
                                  data-testid={`btn-lock-contract-${selectedOrder.id}`}
                                >
                                  <ShieldCheck size={14} /> Formalizar Contrato con Escrow
                                </button>
                              )}
                            </div>

                            {selectedOrder.trackingCode && (
                              <span className="font-mono text-[11px] text-[#1b4332] font-bold">
                                Guía: {selectedOrder.courier} ({selectedOrder.trackingCode})
                              </span>
                            )}
                          </div>

                          {/* Formulario de Envío de Mensaje */}
                          <div className="p-3 border-t border-gray-200 bg-white">
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSendChatMessage(selectedOrder.id);
                              }}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={chatMessageInput}
                                onChange={(e) => setChatMessageInput(e.target.value)}
                                placeholder="Escribe una respuesta o propuesta comercial al comprador..."
                                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#2d6a4f]"
                                data-testid="chat-message-input"
                              />
                              <button
                                type="submit"
                                disabled={!chatMessageInput.trim()}
                                className="button button-small button-primary text-xs flex items-center gap-1.5 px-4 disabled:opacity-50"
                                data-testid="btn-send-chat"
                              >
                                <Send size={13} /> Enviar
                              </button>
                            </form>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-xs">
                          Selecciona una solicitud en la lista lateral para ver el historial y responder.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. GESTIÓN DE LOTES Y SUBIDA DE FOTOS DE PRODUCTO */}
                {sellerTab === 'lots' && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-xl font-serif font-bold text-[#1b4332]">Gestión de Cosechas & Fotografías de Lotes</h2>
                        <p className="text-xs text-gray-500">Publica nuevas cosechas, actualiza fotografías, stock y condiciones comerciales en tiempo real.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreateLotModalOpen(true)}
                        className="button button-small button-earth text-xs flex items-center gap-1.5"
                        data-testid="btn-create-lot"
                      >
                        <Plus size={14} /> Crear Nueva Cosecha / Lote
                      </button>
                    </div>

                    <div className="space-y-4">
                      {lots.map((l) => (
                        <div key={l.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                          <div className="relative w-28 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                            <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex flex-col items-center justify-center text-white cursor-pointer opacity-80 hover:opacity-100 transition-opacity" title="Cambiar fotografía del producto">
                              <Camera size={18} />
                              <span className="text-[9px] font-sans font-semibold mt-1">Cambiar Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleProductPhotoUpload(l.id, e)}
                              />
                            </label>
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                {l.id}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f] bg-[#e8f1ec] px-2 py-0.5 rounded">
                                {l.fruit}
                              </span>
                              <span className="text-xs font-semibold text-gray-500">{l.harvestTag}</span>
                            </div>
                            <h3 className="font-serif font-bold text-[#1b4332] text-base mt-1">{l.name}</h3>
                            <p className="text-xs text-gray-600 line-clamp-1">{l.sensoryNotes}</p>

                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                              <span className="font-semibold text-emerald-800">
                                Stock Disp: <b>{l.availableKg.toLocaleString()} kg</b> / Total: {l.totalKg.toLocaleString()} kg
                              </span>
                              <span className="font-mono font-bold text-[#1b4332]">
                                FOB: ${l.priceFob.toFixed(2)} / kg
                              </span>
                              <span className="text-gray-500 font-mono">
                                Calidad: {l.sensoryScore}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLot(l)}
                              className="button button-small button-outline text-xs flex items-center gap-1.5"
                              data-testid={`btn-edit-lot-${l.id}`}
                            >
                              <Edit3 size={13} /> Editar Lote
                            </button>
                            <label className="button button-small button-outline text-xs cursor-pointer">
                              <Upload size={13} /> Subir Foto
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleProductPhotoUpload(l.id, e)}
                              />
                            </label>
                            <Link href={`/lote/${l.id}`} className="button button-small button-dark text-xs">
                              Ver Ficha Pública
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PERSONALIZAR PERFIL Y FOTOS DE COOPERATIVA */}
                {sellerTab === 'customize' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-serif font-bold text-[#1b4332]">Personalizar Perfil de Vendedor (Alibaba Gold Supplier)</h2>
                      <p className="text-xs text-gray-500">Configura la identidad visual, fotografías oficiales y datos comerciales de la cooperativa.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* FORMULARIO DE PERSONALIZACIÓN */}
                      <form onSubmit={handleSaveProfile} className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        {/* Subida de Banner y Logo Oficial */}
                        <div>
                          <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                            Banner de Tienda & Logo Oficial
                          </label>
                          <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mb-3 group">
                            <img src={coopProfile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center text-white text-xs font-semibold cursor-pointer transition-colors gap-2">
                              <Camera size={18} /> Cambiar Foto de Cabecera (Banner)
                              <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                            </label>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#1b4332] bg-white shadow shrink-0 group">
                              <img src={coopProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              <label className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center text-white cursor-pointer transition-colors" title="Cambiar logo oficial">
                                <Camera size={14} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                              </label>
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-[#1b4332] block">Logotipo / Sello Oficial</span>
                              <span className="text-[11px] text-gray-500 block">Formato recomendado: JPG o PNG cuadrado (500x500px).</span>
                            </div>
                          </div>
                        </div>

                        {/* Foto del Dirigente / Socio Productor */}
                        <div className="pt-4 border-t border-gray-100">
                          <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                            Representante / Dirigente Forestal
                          </label>
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0 group">
                              <img src={coopProfile.leaderImageUrl} alt="Dirigente" className="w-full h-full object-cover" />
                              <label className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center text-white cursor-pointer transition-colors">
                                <Camera size={14} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleLeaderImageUpload} />
                              </label>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500 block">Nombre del Representante</span>
                                <input
                                  type="text"
                                  value={coopProfile.leaderName}
                                  onChange={(e) => setCoopProfile({ ...coopProfile, leaderName: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded font-sans"
                                />
                              </div>
                              <div>
                                <span className="text-gray-500 block">Cargo Institucional</span>
                                <input
                                  type="text"
                                  value={coopProfile.leaderRole}
                                  onChange={(e) => setCoopProfile({ ...coopProfile, leaderRole: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded font-sans"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Galería de Instalaciones de Beneficio */}
                        <div className="pt-4 border-t border-gray-100">
                          <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                            Fotografías de Instalaciones & Parcelas
                          </label>
                          <p className="text-[11px] text-gray-500 mb-2">Exhibe módulos de beneficio, cajones de fermentación y secaderos solares.</p>
                          <div className="b2b-facility-uploader-grid">
                            {coopProfile.facilityImages.map((img, idx) => (
                              <div key={idx} className="b2b-facility-item h-24 group">
                                <img src={img} alt={`Instalación ${idx + 1}`} className="w-full h-full object-cover" />
                                <label className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer transition-colors gap-1">
                                  <Camera size={14} /> Cambiar Foto {idx + 1}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFacilityImageUpload(idx, e)}
                                  />
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Datos Generales de la Organización */}
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-700 font-semibold block mb-1">Nombre Oficial</span>
                              <input
                                type="text"
                                required
                                value={coopProfile.name}
                                onChange={(e) => setCoopProfile({ ...coopProfile, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <span className="text-gray-700 font-semibold block mb-1">RUC Agrario</span>
                              <input
                                type="text"
                                required
                                value={coopProfile.ruc}
                                onChange={(e) => setCoopProfile({ ...coopProfile, ruc: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-700 font-semibold block mb-1">Pueblo Originario / Comunidad</span>
                              <input
                                type="text"
                                value={coopProfile.community}
                                onChange={(e) => setCoopProfile({ ...coopProfile, community: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <span className="text-gray-700 font-semibold block mb-1">Departamento / Región</span>
                              <input
                                type="text"
                                value={coopProfile.department}
                                onChange={(e) => setCoopProfile({ ...coopProfile, department: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="text-xs">
                            <span className="text-gray-700 font-semibold block mb-1">Historia Comunitaria & Bioeconomía</span>
                            <textarea
                              rows={3}
                              value={coopProfile.story}
                              onChange={(e) => setCoopProfile({ ...coopProfile, story: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-sans text-xs leading-relaxed"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-700 font-semibold block mb-1">Capacidad Anual (MT/año)</span>
                              <input
                                type="number"
                                value={coopProfile.annualCapacityMt}
                                onChange={(e) => setCoopProfile({ ...coopProfile, annualCapacityMt: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                              />
                            </div>
                            <div>
                              <span className="text-gray-700 font-semibold block mb-1">Tiempo de Respuesta</span>
                              <input
                                type="text"
                                value={coopProfile.responseTime}
                                onChange={(e) => setCoopProfile({ ...coopProfile, responseTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-sans"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-700 font-semibold block mb-1">Teléfono WhatsApp de Contacto</span>
                              <input
                                type="text"
                                value={coopProfile.whatsappPhone}
                                onChange={(e) => setCoopProfile({ ...coopProfile, whatsappPhone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                              />
                            </div>
                            <div>
                              <span className="text-gray-700 font-semibold block mb-1">Correo Electrónico Oficial</span>
                              <input
                                type="email"
                                value={coopProfile.contactEmail}
                                onChange={(e) => setCoopProfile({ ...coopProfile, contactEmail: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-sans"
                              />
                            </div>
                          </div>

                          <div className="text-xs">
                            <span className="text-gray-700 font-semibold block mb-1">Cuenta Bancaria de Fideicomiso Escrow (CCI)</span>
                            <input
                              type="text"
                              value={coopProfile.escrowAccount}
                              onChange={(e) => setCoopProfile({ ...coopProfile, escrowAccount: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="button button-dark w-full justify-center text-sm py-2.5"
                          data-testid="btn-save-profile"
                        >
                          <Save size={16} /> Guardar Cambios de Perfil
                        </button>
                      </form>

                      {/* PREVISUALIZACIÓN EN VIVO (LIVE CARD PREVIEW) */}
                      <div className="lg:col-span-5 sticky top-24">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="p-3 bg-[#faf6f0] border-b border-gray-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                              Vista Previa de tu Tienda en Vivo
                            </span>
                            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                              Alibaba Gold Supplier
                            </span>
                          </div>

                          <div className="relative h-28 bg-gray-200">
                            <img src={coopProfile.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                            <div className="absolute -bottom-5 left-4 w-14 h-14 rounded-full border-2 border-white shadow overflow-hidden bg-white">
                              <img src={coopProfile.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                            </div>
                          </div>

                          <div className="p-4 pt-7 text-left space-y-3">
                            <div>
                              <h3 className="font-serif font-bold text-lg text-[#1b4332]">{coopProfile.name}</h3>
                              <p className="text-xs text-gray-600">{coopProfile.community} · {coopProfile.department}</p>
                              <span className="text-[10px] font-mono text-gray-500">RUC: {coopProfile.ruc}</span>
                            </div>

                            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                              {coopProfile.story}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-gray-100">
                              <div>
                                <span className="text-[10px] text-gray-400 block uppercase">Capacidad Anual</span>
                                <span className="font-bold text-[#1b4332]">{coopProfile.annualCapacityMt} MT / año</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 block uppercase">Respuesta</span>
                                <span className="font-bold text-[#2d6a4f]">{coopProfile.responseTime}</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-gray-400 block uppercase mb-1">Certificaciones Oficiales</span>
                              <div className="flex flex-wrap gap-1">
                                {coopProfile.certifications.slice(0, 3).map((c, i) => (
                                  <span key={i} className="text-[10px] bg-[#e8f1ec] text-[#1b4332] px-2 py-0.5 rounded font-medium">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs text-gray-500 font-mono">
                              <span>WhatsApp: {coopProfile.whatsappPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. UBICACIÓN SATELITAL Y GEORREFERENCIACIÓN OPENSTREETMAP */}
                {sellerTab === 'location' && (
                  <div className="max-w-4xl">
                    <div className="mb-6">
                      <h2 className="text-xl font-serif font-bold text-[#1b4332]">Ubicación Satelital & Georreferenciación NMEA</h2>
                      <p className="text-xs text-gray-500">
                        Coordenadas auditadas de la sede comunitaria y centro de acopio para cumplimiento con el Reglamento EUDR (UE 2023/1115).
                      </p>
                    </div>

                    <div className="b2b-location-card text-left space-y-5">
                      {/* Visor Interactivo OpenStreetMap Embebido */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1b4332] flex items-center gap-1.5">
                            <Navigation size={14} className="text-[#2d6a4f]" /> Visor Satelital OpenStreetMap en Vivo
                          </span>
                          <span className="text-[11px] font-mono text-gray-500">
                            Marcador: {coopProfile.latitude}°, {coopProfile.longitude}°
                          </span>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 relative">
                          <iframe
                            title="Visor OpenStreetMap Parcela"
                            width="100%"
                            height="340"
                            style={{ border: 0 }}
                            loading="lazy"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(Number(coopProfile.longitude) || -69.2) - 0.02}%2C${(Number(coopProfile.latitude) || -12.4667) - 0.02}%2C${(Number(coopProfile.longitude) || -69.2) + 0.02}%2C${(Number(coopProfile.latitude) || -12.4667) + 0.02}&layer=mapnik&marker=${coopProfile.latitude}%2C${coopProfile.longitude}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-xs font-bold text-gray-700 block mb-1">Latitud Satelital</span>
                          <input
                            type="text"
                            value={coopProfile.latitude}
                            onChange={(e) => setCoopProfile({ ...coopProfile, latitude: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-700 block mb-1">Longitud Satelital</span>
                          <input
                            type="text"
                            value={coopProfile.longitude}
                            onChange={(e) => setCoopProfile({ ...coopProfile, longitude: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-700 block mb-1">Precisión NMEA</span>
                          <input
                            type="text"
                            value={coopProfile.gpsAccuracy}
                            onChange={(e) => setCoopProfile({ ...coopProfile, gpsAccuracy: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={handleConfirmLocation}
                            className="button button-earth text-xs flex items-center gap-1.5"
                            data-testid="btn-confirm-location"
                          >
                            <CheckCircle2 size={15} /> Confirmar Ubicación Georreferenciada
                          </button>

                          <button
                            type="button"
                            onClick={handleAutoCaptureGps}
                            className="button button-outline text-xs flex items-center gap-1.5"
                            data-testid="btn-auto-gps"
                          >
                            <LocateFixed size={14} /> Auto-capturar Coordenadas GNSS
                          </button>
                        </div>

                        <a
                          href={`https://www.openstreetmap.org/?mlat=${coopProfile.latitude}&mlon=${coopProfile.longitude}#map=14/${coopProfile.latitude}/${coopProfile.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2d6a4f] hover:text-[#1b4332] font-semibold flex items-center gap-1"
                        >
                          <ExternalLink size={13} /> Abrir en pantalla completa
                        </a>
                      </div>

                      {locationConfirmed && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>
                              <b>Ubicación Georreferenciada Confirmada</b> · Sede en {coopProfile.community} ({coopProfile.latitude}°, {coopProfile.longitude}°). Acreditado: {confirmedTime}.
                            </span>
                          </div>
                          <span className="font-mono text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                            VALIDADO IN-SITU
                          </span>
                        </div>
                      )}

                      <div className="p-4 bg-[#faf6f0] rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-[#1b4332] block mb-1">
                          Validación Territorial PostGIS:
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed font-sans">
                          Sede comunitaria georreferenciada en <b>{coopProfile.community}</b> ({coopProfile.latitude}°, {coopProfile.longitude}°). 
                          Cero pérdida de cobertura boscosa comprobada en Sentinel-2 desde la fecha de corte regulatoria del 31 de diciembre de 2020.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. AUDITORÍA SENTINEL-2 */}
                {sellerTab === 'satellite' && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-left">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <h3 className="text-lg font-serif font-bold text-[#1b4332]">Gobernanza Territorial y Custodia Satelital</h3>
                        <p className="text-xs text-gray-500">Monitoreo continuo de concesiones y parcelas comunales de la Asociación Bosque Vivo.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Cero Alertas GLAD 2024-2025
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div className="p-3.5 rounded-lg bg-[#faf6f0] border border-gray-200 text-left">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Territorio Custodiado</span>
                        <p className="text-xl font-bold font-serif text-[#1b4332] mt-0.5">4,250 Hectáreas</p>
                        <p className="text-[11px] text-gray-600 mt-1">Bosque primario húmedo tropical</p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#faf6f0] border border-gray-200 text-left">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Salud del Dosel (NDVI)</span>
                        <p className="text-xl font-bold font-serif text-[#1b4332] mt-0.5">0.89 Promedio</p>
                        <p className="text-[11px] text-gray-600 mt-1">Sentinel-2 (ESA) actualizado semanalmente</p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#faf6f0] border border-gray-200 text-left">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Resolución Oficial</span>
                        <p className="text-xl font-bold font-serif text-[#1b4332] mt-0.5">SERFOR-MDD-042</p>
                        <p className="text-[11px] text-gray-600 mt-1">Concesión forestal no maderable vigente</p>
                      </div>
                    </div>
                  </div>
                )}

                </>
            )}
          </div>
        </div>
      </div>


      {/* MODAL CREAR NUEVA COSECHA / LOTE */}
      {isCreateLotModalOpen && (
        <div className="b2b-modal-backdrop" onClick={() => setIsCreateLotModalOpen(false)}>
          <div className="b2b-modal-panel p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b4332]">Registrar Nueva Cosecha / Lote Mayorista</h3>
                <p className="text-xs text-gray-500">Publica un nuevo lote de exportación en el catálogo de TrazAmazon.</p>
              </div>
              <button onClick={() => setIsCreateLotModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLotSubmit} className="space-y-4 pt-4 text-left">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nombre Comercial de la Cosecha</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Café de Sombra Altura · Bourbon Lavado"
                  value={newLotForm.name}
                  onChange={(e) => setNewLotForm({ ...newLotForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  data-testid="input-new-lot-name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Categoría / Fruto</label>
                  <select
                    value={newLotForm.fruit}
                    onChange={(e) => setNewLotForm({ ...newLotForm, fruit: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Cacao">Cacao Nativo</option>
                    <option value="Café">Café de Sombra</option>
                    <option value="Castaña">Castaña Amazónica</option>
                    <option value="Aguaje">Pulpa de Aguaje</option>
                    <option value="Copoazú">Copoazú Fino</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Etiqueta de Cosecha</label>
                  <input
                    type="text"
                    value={newLotForm.harvestTag}
                    onChange={(e) => setNewLotForm({ ...newLotForm, harvestTag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Stock Inicial (kg)</label>
                  <input
                    type="number"
                    min="100"
                    value={newLotForm.availableKg}
                    onChange={(e) => setNewLotForm({ ...newLotForm, availableKg: Number(e.target.value), totalKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Precio FOB ($/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={newLotForm.priceFob}
                    onChange={(e) => setNewLotForm({ ...newLotForm, priceFob: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Puntaje Sensorial</label>
                  <input
                    type="text"
                    value={newLotForm.sensoryScore}
                    onChange={(e) => setNewLotForm({ ...newLotForm, sensoryScore: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Notas Sensoriales / Descriptores</label>
                <textarea
                  rows={2}
                  value={newLotForm.sensoryNotes}
                  onChange={(e) => setNewLotForm({ ...newLotForm, sensoryNotes: e.target.value })}
                  placeholder="Ej. Notas de cacao profundo, jazmín silvestre y panela..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">URL de Imagen del Producto</label>
                <input
                  type="text"
                  value={newLotForm.image}
                  onChange={(e) => setNewLotForm({ ...newLotForm, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCreateLotModalOpen(false)}
                  className="button button-outline text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button button-primary text-xs flex items-center gap-1.5"
                  data-testid="btn-submit-create-lot"
                >
                  <Plus size={14} /> Publicar Nueva Cosecha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR COSECHA / LOTE */}
      {isEditLotModalOpen && editingLot && (
        <div className="b2b-modal-backdrop" onClick={() => setIsEditLotModalOpen(false)}>
          <div className="b2b-modal-panel p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b4332]">Editar Lote · {editingLot.id}</h3>
                <p className="text-xs text-gray-500">Actualiza las condiciones de venta, stock y perfil de cata.</p>
              </div>
              <button onClick={() => setIsEditLotModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditLot} className="space-y-4 pt-4 text-left">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={editingLot.name}
                  onChange={(e) => setEditingLot({ ...editingLot, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  data-testid="input-edit-lot-name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Stock Disponible (kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingLot.availableKg}
                    onChange={(e) => setEditingLot({ ...editingLot, availableKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Precio FOB ($/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editingLot.priceFob}
                    onChange={(e) => setEditingLot({ ...editingLot, priceFob: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Puntaje Sensorial</label>
                  <input
                    type="text"
                    value={editingLot.sensoryScore}
                    onChange={(e) => setEditingLot({ ...editingLot, sensoryScore: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Notas Sensoriales / Descriptores</label>
                <textarea
                  rows={2}
                  value={editingLot.sensoryNotes}
                  onChange={(e) => setEditingLot({ ...editingLot, sensoryNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditLotModalOpen(false)}
                  className="button button-outline text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button button-primary text-xs flex items-center gap-1.5"
                  data-testid="btn-save-lot-changes"
                >
                  <Save size={14} /> Guardar Cambios del Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        <AuthProvider>
          <B2BOrdersProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <RoutedErrorBoundary>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/marketplace" component={Marketplace} />
                  <Route path="/lote/:id" component={LotDetail} />
                  <Route path="/agroturismo" component={AgroturismoPage} />
                  <Route path="/panel" component={B2BDashboardPage} />
                  <Route path="/app" component={MobileAppLandingPage} />
                  <Route component={NotFound} />
                </Switch>
              </RoutedErrorBoundary>
            </WouterRouter>
            <Toaster />
          </B2BOrdersProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
