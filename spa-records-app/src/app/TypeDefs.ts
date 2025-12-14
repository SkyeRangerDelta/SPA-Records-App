// Record Types for the Office of the Harbour Registry
export interface RegistryRecord {
  id: number;
  title: string;
  description: string;
  content: string;
  fileUrl?: string;
  status: RecordStatus;
  createdAt: Date;
  updatedAt: Date;
  createdAtFriendly: string;
  updatedAtFriendly: string;
  recordType: RecordType;
  department?: string;
  author: string;
}

export enum RecordType {
  VESSEL_REGISTRATION = 'vessel_registration',
  CARGO_MANIFEST = 'cargo_manifest',
  CREW_ROSTER = 'crew_roster',
  PORT_ENTRY_LOG = 'port_entry_log',
  PORT_DEPARTURE_LOG = 'port_departure_log',
  TRADE_AGREEMENT = 'trade_agreement',
  CUSTOMS_DECLARATION = 'customs_declaration',
  CHARTER_DOCUMENT = 'charter_document',
  ADMINISTRATIVE_POLICY = 'administrative_policy',
  CORRESPONDENCE = 'correspondence',
  INCIDENT_REPORT = 'incident_report',
  OTHER = 'other'
}

// Friendly display names for record types
export const RecordTypeLabels: Record<RecordType, string> = {
  [RecordType.VESSEL_REGISTRATION]: 'Vessel Registration',
  [RecordType.CARGO_MANIFEST]: 'Cargo Manifest',
  [RecordType.CREW_ROSTER]: 'Crew Roster',
  [RecordType.PORT_ENTRY_LOG]: 'Port Entry Log',
  [RecordType.PORT_DEPARTURE_LOG]: 'Port Departure Log',
  [RecordType.TRADE_AGREEMENT]: 'Trade Agreement',
  [RecordType.CUSTOMS_DECLARATION]: 'Customs Declaration',
  [RecordType.CHARTER_DOCUMENT]: 'Charter Document',
  [RecordType.ADMINISTRATIVE_POLICY]: 'Administrative Policy',
  [RecordType.CORRESPONDENCE]: 'Official Correspondence',
  [RecordType.INCIDENT_REPORT]: 'Incident Report',
  [RecordType.OTHER]: 'Other'
};

// Record Status Types
export enum RecordStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  PENDING_REVIEW = 'pending_review',
  DRAFT = 'draft',
  EXPIRED = 'expired'
}

export const RecordStatusLabels: Record<RecordStatus, string> = {
  [RecordStatus.ACTIVE]: 'Active',
  [RecordStatus.ARCHIVED]: 'Archived',
  [RecordStatus.PENDING_REVIEW]: 'Pending Review',
  [RecordStatus.DRAFT]: 'Draft',
  [RecordStatus.EXPIRED]: 'Expired'
};

export interface RecordRes {
  status: number;
  message: string;
  success: boolean;
  record?: RegistryRecord | null;
}

export interface RecordsListRes {
  status: number;
  message: string;
  success: boolean;
  records: RegistryRecord[];
}

export interface RecordsCountRes {
  status: number;
  message: string;
  success: boolean;
  count: number;
}

export interface Department {
  id: number;
  name: string;
  shortName: string;
  description: string;
  href: string;
}

export enum ServiceCategory {
  MEDICAL_WELFARE = 'medical_welfare',
  ADMINISTRATION_REGISTRY = 'administration_registry',
  NAVIGATION_SAFETY = 'navigation_safety',
  CARGO_TRADE = 'cargo_trade',
  SECURITY_ENFORCEMENT = 'security_enforcement',
  OTHER = 'other'
}

export const ServiceCategoryLabels: Record<ServiceCategory, string> = {
  [ServiceCategory.MEDICAL_WELFARE]: 'Medical & Welfare',
  [ServiceCategory.ADMINISTRATION_REGISTRY]: 'Administration & Registry',
  [ServiceCategory.NAVIGATION_SAFETY]: 'Navigation & Safety',
  [ServiceCategory.CARGO_TRADE]: 'Cargo & Trade',
  [ServiceCategory.SECURITY_ENFORCEMENT]: 'Security & Enforcement',
  [ServiceCategory.OTHER]: 'Other'
};

export enum ServiceType {
  // Medical & Welfare
  SICK_BAY_HOSPITAL = 'sick_bay_hospital',
  QUARANTINE_SECTION = 'quarantine_section',
  RELIEF_STORES = 'relief_stores',
  PLACEMENT_EMPLOYMENT = 'placement_employment',

  // Administration & Registry
  PORT_REGISTRY = 'port_registry',
  HARBOUR_DUES_CUSTOMS = 'harbour_dues_customs',

  // Navigation & Safety
  HARBOUR_PILOTS = 'harbour_pilots',
  TIDE_WEATHER_BOARD = 'tide_weather_board',
  BEACON_LIGHTHOUSE = 'beacon_lighthouse',

  // Cargo & Trade
  BONDED_WAREHOUSES = 'bonded_warehouses',
  INSPECTION_WEIGHT = 'inspection_weight',
  HAZARDOUS_GOODS = 'hazardous_goods',
  SHIP_CHANDLER = 'ship_chandler',

  // Security & Enforcement
  HARBOUR_GUARD = 'harbour_guard',
  JAIL_CONFINEMENT = 'jail_confinement',
  COURTS_HEARING_HALLS = 'courts_hearing_halls',

  OTHER = 'other'
}

export const ServiceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.SICK_BAY_HOSPITAL]: 'Sick Bay & Hospital',
  [ServiceType.QUARANTINE_SECTION]: 'Quarantine Section',
  [ServiceType.RELIEF_STORES]: 'Relief Stores',
  [ServiceType.PLACEMENT_EMPLOYMENT]: 'Placement & Employment Office',
  [ServiceType.PORT_REGISTRY]: 'Port Registry Office',
  [ServiceType.HARBOUR_DUES_CUSTOMS]: 'Harbour Dues & Customs Office',
  [ServiceType.HARBOUR_PILOTS]: 'Harbour Pilots',
  [ServiceType.TIDE_WEATHER_BOARD]: 'Tide & Weather Board',
  [ServiceType.BEACON_LIGHTHOUSE]: 'Beacon, Signal, and Lighthouse Maintenance',
  [ServiceType.BONDED_WAREHOUSES]: 'Bonded Warehouses',
  [ServiceType.INSPECTION_WEIGHT]: 'Inspection and Weight Services',
  [ServiceType.HAZARDOUS_GOODS]: 'Hazardous Goods Handling',
  [ServiceType.SHIP_CHANDLER]: 'Ship Chandler & Requisitions Office',
  [ServiceType.HARBOUR_GUARD]: 'Harbour Guard',
  [ServiceType.JAIL_CONFINEMENT]: 'Jail & Confinement Cells',
  [ServiceType.COURTS_HEARING_HALLS]: 'Courts & Hearing Halls',
  [ServiceType.OTHER]: 'Other'
};

export const ServiceTypeCategories: Record<ServiceType, ServiceCategory> = {
  [ServiceType.SICK_BAY_HOSPITAL]: ServiceCategory.MEDICAL_WELFARE,
  [ServiceType.QUARANTINE_SECTION]: ServiceCategory.MEDICAL_WELFARE,
  [ServiceType.RELIEF_STORES]: ServiceCategory.MEDICAL_WELFARE,
  [ServiceType.PLACEMENT_EMPLOYMENT]: ServiceCategory.MEDICAL_WELFARE,
  [ServiceType.PORT_REGISTRY]: ServiceCategory.ADMINISTRATION_REGISTRY,
  [ServiceType.HARBOUR_DUES_CUSTOMS]: ServiceCategory.ADMINISTRATION_REGISTRY,
  [ServiceType.HARBOUR_PILOTS]: ServiceCategory.NAVIGATION_SAFETY,
  [ServiceType.TIDE_WEATHER_BOARD]: ServiceCategory.NAVIGATION_SAFETY,
  [ServiceType.BEACON_LIGHTHOUSE]: ServiceCategory.NAVIGATION_SAFETY,
  [ServiceType.BONDED_WAREHOUSES]: ServiceCategory.CARGO_TRADE,
  [ServiceType.INSPECTION_WEIGHT]: ServiceCategory.CARGO_TRADE,
  [ServiceType.HAZARDOUS_GOODS]: ServiceCategory.CARGO_TRADE,
  [ServiceType.SHIP_CHANDLER]: ServiceCategory.CARGO_TRADE,
  [ServiceType.HARBOUR_GUARD]: ServiceCategory.SECURITY_ENFORCEMENT,
  [ServiceType.JAIL_CONFINEMENT]: ServiceCategory.SECURITY_ENFORCEMENT,
  [ServiceType.COURTS_HEARING_HALLS]: ServiceCategory.SECURITY_ENFORCEMENT,
  [ServiceType.OTHER]: ServiceCategory.OTHER
};

export interface Service {
  type: ServiceType;
  category: ServiceCategory;
  available: boolean;
  notes?: string;
}

export interface PortRecord {
  id: number;
  name: string;
  parentMunicipality: string;
  alignment: string;
  description: string;
  services: Service[];
  harbormaster: string;
  docks: number;
  berths: number;
}
