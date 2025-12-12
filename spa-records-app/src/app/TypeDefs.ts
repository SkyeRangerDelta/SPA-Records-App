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
