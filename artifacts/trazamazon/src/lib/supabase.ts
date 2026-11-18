/**
 * Cliente y Servicios de Supabase Cloud para TrazAmazon B2B
 * Proyecto: yaxjpdhqjqsfqhladhl (Producción)
 */

export const SUPABASE_URL = 'https://yaxjpdhqjqsfqhladhl.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlheGpwZGhxanFzZnFoamxhZGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMDYwMTEsImV4cCI6MjExMDU4MjAxMX0.OVzKKrZNq9h6zfSQ3HP0f8A0_4WB-oS2PakXAVjPNts';

export interface CooperativeProfile {
  id: string;
  name: string;
  ruc: string;
  community: string;
  region: string;
  department: string;
  story: string;
  annualCapacityMt: number;
  responseTime: string;
  certifications: string[];
  avatarUrl: string;
  bannerUrl: string;
  leaderName: string;
  leaderRole: string;
  leaderImageUrl: string;
  facilityImages: string[];
  latitude: string;
  longitude: string;
  gpsAccuracy: string;
  contactEmail: string;
  whatsappPhone: string;
  escrowAccount: string;
  updatedAt?: string;
}

export const defaultCooperativeProfile: CooperativeProfile = {
  id: 'coop-bosque-vivo',
  name: 'Asociación Bosque Vivo',
  ruc: '20608912341',
  community: 'Boca Pariamanu · Pueblo Amahuaca',
  region: 'Cuenca del Río Las Piedras - Tahuamanu',
  department: 'Madre de Dios, Perú',
  story:
    'Comunidad nativa amazónica dedicada a la bioeconomía regenerativa y custodia de 4,250 hectáreas de bosque primario. Recolectamos cacao criollo silvestre, castaña y frutos amazónicos bajo dosel natural, garantizando cero deforestación y precio justo para 64 familias.',
  annualCapacityMt: 45,
  responseTime: '< 2 horas',
  certifications: [
    'Gold Supplier Agroforestal',
    'Cero Deforestación (Sentinel-2)',
    'Criollo Nativo Certificado',
    'Orgánico USDA / UE',
    'Comercio Justo / Fair Trade'
  ],
  avatarUrl: '/producer-maria-illustration.jpg',
  bannerUrl: '/amazon-cacao-hero.jpg',
  leaderName: 'Santos Huamán',
  leaderRole: 'Presidente del Consejo de Vigilancia Forestal',
  leaderImageUrl: '/producer-maria-illustration.jpg',
  facilityImages: [
    '/amazon-cacao-hero.jpg',
    '/coffee.jpg',
    '/producer-maria-illustration.jpg'
  ],
  latitude: '-12.4667',
  longitude: '-69.2000',
  gpsAccuracy: '±1.8m NMEA',
  contactEmail: 'presidencia@bosquevivo-madrededios.pe',
  whatsappPhone: '+51 982 410 882',
  escrowAccount: 'BCP CCI 002-191-002847192019-54 (Fideicomiso Escrow)',
  updatedAt: new Date().toISOString()
};

/**
 * Obtiene el perfil de la cooperativa desde Supabase Cloud con respaldo en almacenamiento local
 */
export async function fetchCooperativeProfile(): Promise<CooperativeProfile> {
  try {
    const cached = localStorage.getItem('trazamazon-coop-profile');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/cooperative_profiles?id=eq.coop-bosque-vivo`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('trazamazon-coop-profile', JSON.stringify(data[0]));
        return data[0];
      }
    }
  } catch {}

  return defaultCooperativeProfile;
}

/**
 * Guarda o actualiza el perfil de la cooperativa en Supabase Cloud y en local
 */
export async function saveCooperativeProfile(profile: CooperativeProfile): Promise<{ success: boolean; cloudSynced: boolean }> {
  profile.updatedAt = new Date().toISOString();

  try {
    localStorage.setItem('trazamazon-coop-profile', JSON.stringify(profile));
  } catch {}

  let cloudSynced = false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/cooperative_profiles`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      cloudSynced = true;
    }
  } catch {}

  return { success: true, cloudSynced };
}

/**
 * Genera el script DDL SQL completo para crear la estructura de tablas en la consola de Supabase
 */
export function getSupabaseSchemaSql(): string {
  return `-- ============================================================================
-- ESQUEMA DDL DE PRODUCCIÓN PARA TRAZAMAZON (Supabase PostgreSQL + PostGIS)
-- Proyecto: yaxjpdhqjqsfqhladhl
-- ============================================================================

-- 1. Habilitar extensión geoespacial para parcelas
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tabla de Perfiles de Cooperativas y Vendedores
CREATE TABLE IF NOT EXISTS public.cooperative_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ruc TEXT,
    community TEXT,
    region TEXT,
    department TEXT,
    story TEXT,
    annual_capacity_mt NUMERIC DEFAULT 0,
    response_time TEXT DEFAULT '< 2 horas',
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    avatar_url TEXT,
    banner_url TEXT,
    leader_name TEXT,
    leader_role TEXT,
    leader_image_url TEXT,
    facility_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    latitude TEXT,
    longitude TEXT,
    gps_accuracy TEXT DEFAULT '±1.8m NMEA',
    contact_email TEXT,
    whatsapp_phone TEXT,
    escrow_account TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Cotizaciones y Órdenes B2B (Trade Assurance / Escrow)
CREATE TABLE IF NOT EXISTS public.b2b_orders (
    id TEXT PRIMARY KEY,
    lot_id TEXT NOT NULL,
    lot_name TEXT NOT NULL,
    fruit TEXT NOT NULL,
    cooperative TEXT NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_org TEXT NOT NULL,
    buyer_country TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sample', 'commercial_rfq')),
    requested_kg NUMERIC NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    total_usd NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('submitted', 'quoted', 'sample_dispatched', 'contract_locked')),
    tracking_code TEXT,
    courier TEXT,
    senasa_guide TEXT,
    escrow_status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Lotes de Cosecha Publicados
CREATE TABLE IF NOT EXISTS public.product_lots (
    id TEXT PRIMARY KEY,
    fruit TEXT NOT NULL,
    name TEXT NOT NULL,
    cooperative TEXT NOT NULL,
    available_kg NUMERIC NOT NULL,
    total_kg NUMERIC NOT NULL,
    price_fob NUMERIC NOT NULL,
    dispatch_status TEXT NOT NULL,
    image_url TEXT,
    coordinates TEXT,
    sensory_score TEXT,
    ndvi_score NUMERIC,
    lot_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Políticas de Acceso RLS (Row Level Security)
ALTER TABLE public.cooperative_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública para perfiles de cooperativas" 
    ON public.cooperative_profiles FOR SELECT USING (true);

CREATE POLICY "Lectura pública para catálogo de lotes" 
    ON public.product_lots FOR SELECT USING (true);

CREATE POLICY "Acceso para órdenes B2B autenticadas" 
    ON public.b2b_orders FOR ALL USING (true);
`;
}
