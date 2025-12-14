import OpenAI from "jsr:@openai/openai@4";
import { load } from "jsr:@std/dotenv";

// Load environment variables from .env file
await load({ export: true });

// Record type and status enums (matching backend definitions)
enum RecordType {
  VESSEL_REGISTRATION = 'vessel_registration',
  CARGO_MANIFEST = 'cargo_manifest',
  CREW_ROSTER = 'crew_roster',
  PORT_CLEARANCE = 'port_clearance',
  CUSTOMS_DECLARATION = 'customs_declaration',
  INSPECTION_REPORT = 'inspection_report',
  INCIDENT_REPORT = 'incident_report',
  COMPLIANCE_CERTIFICATE = 'compliance_certificate',
  MAINTENANCE_LOG = 'maintenance_log',
  NAVIGATIONAL_CHART = 'navigational_chart',
  REGULATORY_NOTICE = 'regulatory_notice',
  OTHER = 'other'
}

enum RecordStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  PENDING_REVIEW = 'pending_review',
  DRAFT = 'draft',
  EXPIRED = 'expired'
}

// Attribution type for records
enum AttributionType {
  AUTHORED_BY = 'authored_by',
  VERIFIED_BY = 'verified_by'
}

// Inventory item for cargo manifests
interface InventoryItem {
  item: string;
  quantity: number;
  tariff?: number;        // Tariff amount in diamonds/ingots
  quarantine?: boolean;   // Item requires quarantine
  hazardous?: boolean;    // Item is hazardous material
}

// Crew member for crew rosters
interface CrewMember {
  name: string;           // Crew member's full name
  role: string;           // Position/role on the vessel
}

interface RegistryRecord {
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
  inventory?: InventoryItem[];  // For cargo manifests
  crew?: CrewMember[];          // For crew rosters
}

// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_KEY");
if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable not set");
  Deno.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// In-universe ports with weighted distribution
const PORT_WEIGHTS: Record<string, number> = {
  'Port Sarim': 20,        // Major port
  'Olde Spawn': 5,        // Minor port
  'Satus City': 75,        // HQ port
};

// Weighted distributions for record types and statuses
const RECORD_TYPE_WEIGHTS: Record<RecordType, number> = {
  [RecordType.VESSEL_REGISTRATION]: 20,
  [RecordType.CARGO_MANIFEST]: 25,
  [RecordType.CREW_ROSTER]: 15,
  [RecordType.PORT_CLEARANCE]: 12,
  [RecordType.CUSTOMS_DECLARATION]: 10,
  [RecordType.INSPECTION_REPORT]: 8,
  [RecordType.INCIDENT_REPORT]: 3,
  [RecordType.COMPLIANCE_CERTIFICATE]: 5,
  [RecordType.MAINTENANCE_LOG]: 7,
  [RecordType.NAVIGATIONAL_CHART]: 4,
  [RecordType.REGULATORY_NOTICE]: 6,
  [RecordType.OTHER]: 5,
};

const RECORD_STATUS_WEIGHTS: Record<RecordStatus, number> = {
  [RecordStatus.ACTIVE]: 50,
  [RecordStatus.ARCHIVED]: 20,
  [RecordStatus.PENDING_REVIEW]: 15,
  [RecordStatus.DRAFT]: 10,
  [RecordStatus.EXPIRED]: 5,
};

// Attribution type per record type (authored vs verified)
const RECORD_ATTRIBUTION: Record<RecordType, AttributionType> = {
  [RecordType.VESSEL_REGISTRATION]: AttributionType.VERIFIED_BY,      // Official verification
  [RecordType.CARGO_MANIFEST]: AttributionType.AUTHORED_BY,           // Ship master authors
  [RecordType.CREW_ROSTER]: AttributionType.AUTHORED_BY,              // Ship master authors
  [RecordType.PORT_CLEARANCE]: AttributionType.VERIFIED_BY,           // Harbor official verifies
  [RecordType.CUSTOMS_DECLARATION]: AttributionType.AUTHORED_BY,      // Merchant/Captain authors
  [RecordType.INSPECTION_REPORT]: AttributionType.AUTHORED_BY,        // Inspector authors
  [RecordType.INCIDENT_REPORT]: AttributionType.AUTHORED_BY,          // Witness/Officer authors
  [RecordType.COMPLIANCE_CERTIFICATE]: AttributionType.VERIFIED_BY,   // Authority verifies
  [RecordType.MAINTENANCE_LOG]: AttributionType.AUTHORED_BY,          // Ship engineer authors
  [RecordType.NAVIGATIONAL_CHART]: AttributionType.VERIFIED_BY,       // Cartographer verifies
  [RecordType.REGULATORY_NOTICE]: AttributionType.AUTHORED_BY,        // Official authors
  [RecordType.OTHER]: AttributionType.AUTHORED_BY,                    // Default to authored
};

// Departments by record type (for records that require department assignment)
const RECORD_DEPARTMENTS: Partial<Record<RecordType, string[]>> = {
  [RecordType.VESSEL_REGISTRATION]: ['Office of the Harbour Registry'],
  [RecordType.CARGO_MANIFEST]: ['Office of the Harbour Registry', 'Customs & Trade Office'],
  [RecordType.CREW_ROSTER]: ['Office of the Harbour Registry'],
  [RecordType.PORT_CLEARANCE]: ['Office of the Harbour Registry', 'Customs & Trade Office'],
  [RecordType.CUSTOMS_DECLARATION]: ['Customs & Trade Office'],
  [RecordType.INSPECTION_REPORT]: ['Office of Vessel Inspection', 'Office of Safety & Compliance'],
  [RecordType.INCIDENT_REPORT]: ['Office of Safety & Compliance', 'Harbour Guard Command'],
  [RecordType.COMPLIANCE_CERTIFICATE]: ['Office of Safety & Compliance'],
  [RecordType.MAINTENANCE_LOG]: ['Office of Vessel Inspection'],
  [RecordType.NAVIGATIONAL_CHART]: ['Office of Cartographic Records'],
  [RecordType.REGULATORY_NOTICE]: ['Office of the Portmaster', 'Council of Sarim'],
};

// Helper function to select weighted random item
function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [item, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return item;
    }
  }

  return entries[0][0]; // Fallback
}

// Helper to generate record identifiers with proper formatting
function generateRecordIdentifier(recordType: RecordType, port: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');

  // Port codes
  const portCodes: Record<string, string> = {
    'Port Sarim': 'SAR',
    'Olde Spawn': 'OSP',
    'Satus City': 'SAT',
  };
  const portCode = portCodes[port] || 'UNK';

  switch (recordType) {
    case RecordType.VESSEL_REGISTRATION:
      return `VR-${year}-${portCode}-${seq}`;
    case RecordType.CARGO_MANIFEST:
      return `CM-${portCode}-${year}${month}-${seq}`;
    case RecordType.CREW_ROSTER:
      return `CR-${year}-${seq}`;
    case RecordType.PORT_CLEARANCE:
      return `PC-${portCode}-${year}${month}-${seq}`;
    case RecordType.CUSTOMS_DECLARATION:
      return `CD-${portCode}-${year}-${seq}`;
    case RecordType.INSPECTION_REPORT:
      return `IR-${year}-${portCode}-${seq}`;
    case RecordType.INCIDENT_REPORT:
      return `INC-${year}${month}-${portCode}-${seq}`;
    case RecordType.COMPLIANCE_CERTIFICATE:
      return `CC-${year}-${seq}`;
    case RecordType.MAINTENANCE_LOG:
      return `ML-${year}${month}-${seq}`;
    case RecordType.NAVIGATIONAL_CHART:
      return `NC-${portCode}-${seq}`;
    case RecordType.REGULATORY_NOTICE:
      return `RN-${year}-${seq}`;
    default:
      return `OTH-${year}-${seq}`;
  }
}

// Helper to generate structured titles based on record type
function generateRecordTitle(
  recordType: RecordType,
  identifier: string,
  vesselName: string,
  port: string,
  date: Date
): string {
  const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  switch (recordType) {
    case RecordType.VESSEL_REGISTRATION:
      return `Vessel Registration: ${vesselName} (${identifier})`;
    case RecordType.CARGO_MANIFEST:
      return `Cargo Manifest ${identifier} - ${vesselName} at ${port}`;
    case RecordType.CREW_ROSTER:
      return `Crew Roster ${identifier}: ${vesselName}`;
    case RecordType.PORT_CLEARANCE:
      return `Port Clearance Certificate ${identifier} - ${vesselName}`;
    case RecordType.CUSTOMS_DECLARATION:
      return `Customs Declaration ${identifier}: ${vesselName}`;
    case RecordType.INSPECTION_REPORT:
      return `Inspection Report ${identifier}: ${vesselName}`;
    case RecordType.INCIDENT_REPORT:
      return `Incident Report ${identifier} - ${port} Harbour`;
    case RecordType.COMPLIANCE_CERTIFICATE:
      return `Certificate of Compliance ${identifier}: ${vesselName}`;
    case RecordType.MAINTENANCE_LOG:
      return `Maintenance Log ${identifier} - ${vesselName}`;
    case RecordType.NAVIGATIONAL_CHART:
      return `Navigational Chart ${identifier}: ${port} Approaches`;
    case RecordType.REGULATORY_NOTICE:
      return `Regulatory Notice ${identifier} - Issued ${dateStr}`;
    case RecordType.OTHER:
      return `Official Record ${identifier}`;
    default:
      return `Record ${identifier}`;
  }
}

// SPA Universe context for GPT system prompt
const SPA_UNIVERSE_CONTEXT = `You are generating official documentation for the Sarim Port Authority (SPA), a global maritime trade authority in a fantasy world.

SETTING & LORE:
- Founded in Port Sarim during the "Year of the Great Crossing" when first fleets connected isolated settlements of the Old World
- Established by the Council of Sarim to manage harbor disputes over docking rights, tariffs, and cargo claims
- Now operates as the backbone of global trade with offices in every major port across the known world
- Oversees trade routes spanning oceans, deserts, and frozen tundras
- Functions as both trade authority and governing entity for safe harbors, negotiations, and international cooperation

STYLE & TONE:
- Formal, professional bureaucratic language with age-of-sail maritime terminology
- Use terms like: berth, mooring, heave-to, quay, wharf, harbour dues, tariffs, bonded warehouses
- Official titles: Portmaster, Harbourmaster, Dockmaster, Master (ship captain), Surgeon/Chirurgeon
- Documents often bear the phrase "Under the Seal of the Sarim Port Authority"

WORLD-SPECIFIC ELEMENTS:
- This is a Minecraft-based fantasy world with both traditional sailing vessels and magical/technical elements
- Hazardous materials include: TNT, gunpowder, blaze powder, redstone dust, lava buckets
- Regulatory concerns: Ender Dragons, Withers, Elytra (forbidden near docks), redstone devices
- Payment in diamonds or ingots
- Communication via nether portal relays, signal bells, flags, beacons, colored pennants

Generate realistic, varied, and immersive content that fits this universe.`;

// Generate record content using GPT-3.5-turbo
async function generateRecordContent(
  recordType: RecordType,
  recordStatus: RecordStatus,
  port: string,
  attributionType: AttributionType
) {
  // Build specific guidance based on record type
  const recordGuidance: Record<RecordType, string> = {
    [RecordType.VESSEL_REGISTRATION]: "Generate a vessel name and registration details. Include vessel type (merchantman, frigate, cargo hauler, etc.), tonnage, and any notable features.",
    [RecordType.CARGO_MANIFEST]: "Generate a diverse cargo manifest with 4-8 items. Include both mundane trade goods (wheat, wool, iron ore, timber, etc.) and Minecraft-specific items (redstone, diamonds, enchanted items, TNT, gunpowder, blaze powder, etc.). For each item, determine if it requires tariffs (standard goods), quarantine (food, livestock, suspicious items), or is hazardous (TNT, gunpowder, lava, etc.).",
    [RecordType.CREW_ROSTER]: "Generate a crew roster with 5-12 crew members. Include standard maritime roles with varied, realistic names. Roles should include Master (captain), First Mate, Bosun, Surgeon/Chirurgeon, Carpenter, Cook, Quartermaster, Gunner, and various Able Seamen or Deckhands.",
    [RecordType.PORT_CLEARANCE]: "Describe the clearance process, inspection results, and any conditions or restrictions placed on the vessel.",
    [RecordType.CUSTOMS_DECLARATION]: "Detail declared goods, their assessed value, tariffs owed, and any special permits or exemptions.",
    [RecordType.INSPECTION_REPORT]: "Document findings from vessel inspection, safety compliance, structural integrity, and any required repairs or violations.",
    [RecordType.INCIDENT_REPORT]: "Narrate the incident (collision, hazardous material spill, dispute, weather damage, etc.) with witness accounts and immediate actions taken.",
    [RecordType.COMPLIANCE_CERTIFICATE]: "State what regulations/standards are being certified as met, validity period, and any conditions.",
    [RecordType.MAINTENANCE_LOG]: "Record maintenance activities performed, parts replaced, systems serviced, and engineer observations.",
    [RecordType.NAVIGATIONAL_CHART]: "Describe the charted area, notable features (reefs, channels, hazards, safe anchorages), depth soundings, and cartographer notes.",
    [RecordType.REGULATORY_NOTICE]: "Announce new regulations, policy changes, safety warnings, or official proclamations from the Council of Sarim.",
    [RecordType.OTHER]: "Generate appropriate administrative or official documentation relevant to port authority operations.",
  };

  const attributionField = attributionType === AttributionType.AUTHORED_BY ? 'authorName' : 'verifierName';
  const attributionGuidance = attributionType === AttributionType.AUTHORED_BY
    ? "The person who authored/wrote this document (e.g., ship captain, inspector, merchant, witness)"
    : "The SPA official who verified/certified this document (use titles like Harbourmaster, Dockmaster, Inspector, Customs Officer)";

  // Special handling for cargo manifests with inventory
  const isCargoManifest = recordType === RecordType.CARGO_MANIFEST;
  const inventoryGuidance = isCargoManifest ? `
- inventory: Array of 4-8 cargo items, each with:
  - item: Item name (string)
  - quantity: Number of units (number)
  - tariff: Optional tariff amount in diamonds (number, 0-10, only for standard trade goods)
  - quarantine: Optional boolean (true for food, livestock, or suspicious items that need inspection)
  - hazardous: Optional boolean (true for TNT, gunpowder, blaze powder, lava buckets, etc.)
  Example: {"item": "Redstone Dust", "quantity": 450, "tariff": 3}, {"item": "TNT", "quantity": 24, "hazardous": true}` : '';

  // Special handling for crew rosters
  const isCrewRoster = recordType === RecordType.CREW_ROSTER;
  const crewGuidance = isCrewRoster ? `
- crew: Array of 5-12 crew members, each with:
  - name: Full name of the crew member (string, use varied realistic names)
  - role: Position/role on the vessel (string, e.g., "Master", "First Mate", "Bosun", "Surgeon", "Carpenter", "Cook", "Quartermaster", "Gunner", "Able Seaman", "Deckhand")
  Example: {"name": "James Hawthorne", "role": "Master"}, {"name": "Sarah Blackwell", "role": "First Mate"}` : '';

  const prompt = `Generate content for this ${recordType.replace(/_/g, ' ')} record:

Record Type: ${recordType.replace(/_/g, ' ')}
Status: ${recordStatus.replace(/_/g, ' ')}
Port: ${port}

${recordGuidance[recordType]}

Provide a JSON object with these fields ONLY:
- vesselName: A creative, thematic vessel name (if applicable to this record type; use "N/A" for non-vessel records)
- description: A concise summary of this record (50-150 characters)
- content: Detailed narrative/data/lists for the record body (250-500 characters). Be specific, varied, and immersive. Use in-universe terminology.
- ${attributionField}: ${attributionGuidance}${inventoryGuidance}${crewGuidance}

DO NOT generate: title, identifier, department, or dates. These are handled by templates.
Use diverse, realistic language. Vary your descriptions and avoid repetitive phrasing.
Respond ONLY with valid JSON, no markdown formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SPA_UNIVERSE_CONTEXT
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,  // Increased for more variety
      max_tokens: 600,
    });

    const responseContent = completion.choices[0]?.message?.content?.trim();
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the JSON response
    const parsed = JSON.parse(responseContent);
    return {
      vesselName: parsed.vesselName || "N/A",
      description: parsed.description || `${recordType.replace(/_/g, ' ')} record`,
      content: parsed.content || `Official ${recordType.replace(/_/g, ' ')} documentation.`,
      authorName: parsed.authorName || parsed.verifierName || "Unknown Official",
      inventory: parsed.inventory || undefined,  // Only present for cargo manifests
      crew: parsed.crew || undefined             // Only present for crew rosters
    };
  } catch (error) {
    console.error(`Error generating content for ${recordType}:`, error);
    // Fallback to basic content
    return {
      vesselName: "N/A",
      description: `${recordStatus.replace(/_/g, ' ')} ${recordType.replace(/_/g, ' ')} record`,
      content: `Official ${recordType.replace(/_/g, ' ')} documentation for ${port}.`,
      authorName: "Port Authority Official",
      inventory: undefined,
      crew: undefined
    };
  }
}

// Generate a single record
async function generateRecord(id: number): Promise<RegistryRecord> {
  const recordType = weightedRandom(RECORD_TYPE_WEIGHTS);
  const status = weightedRandom(RECORD_STATUS_WEIGHTS);
  const port = weightedRandom(PORT_WEIGHTS);
  const attributionType = RECORD_ATTRIBUTION[recordType];

  console.log(`Generating record ${id}: ${recordType} at ${port} (${status})...`);

  // Generate dates within the specified range: June 23, 2020 to now
  const earliestDate = new Date('2020-06-23T00:00:00');
  const now = new Date();
  const timeRange = now.getTime() - earliestDate.getTime();

  // Random creation date within the allowed range
  const createdAt = new Date(earliestDate.getTime() + Math.random() * timeRange);

  // Updated date is between creation date and now
  const updatedAt = new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime()));

  // Generate record identifier and content
  const identifier = generateRecordIdentifier(recordType, port, createdAt);
  const generatedContent = await generateRecordContent(recordType, status, port, attributionType);

  // Generate title using template
  const title = generateRecordTitle(
    recordType,
    identifier,
    generatedContent.vesselName,
    port,
    createdAt
  );

  // Select department if applicable
  let department: string | undefined = undefined;
  const departmentOptions = RECORD_DEPARTMENTS[recordType];
  if (departmentOptions && departmentOptions.length > 0) {
    department = departmentOptions[Math.floor(Math.random() * departmentOptions.length)];
  }

  // File URL probability varies by record type
  let fileUrlProbability = 0.3; // Default 30%
  if ([RecordType.NAVIGATIONAL_CHART, RecordType.COMPLIANCE_CERTIFICATE, RecordType.VESSEL_REGISTRATION].includes(recordType)) {
    fileUrlProbability = 0.7; // 70% for official certificates and charts
  }

  return {
    title,
    description: generatedContent.description,
    content: generatedContent.content,
    fileUrl: Math.random() < fileUrlProbability ? `https://files.sarimportauthority.org/records/${identifier}.pdf` : undefined,
    status,
    createdAt,
    updatedAt,
    createdAtFriendly: createdAt.toLocaleDateString(),
    updatedAtFriendly: updatedAt.toLocaleDateString(),
    recordType,
    department,
    author: generatedContent.authorName,
    inventory: generatedContent.inventory,  // Include inventory for cargo manifests
    crew: generatedContent.crew,            // Include crew for crew rosters
  };
}

// Main function
async function main() {
  const args = Deno.args;
  const count = args[0] ? parseInt(args[0]) : 10;

  if (isNaN(count) || count < 1) {
    console.error("Usage: deno run --allow-net --allow-env generate-records.ts <count>");
    console.error("Example: deno run --allow-net --allow-env generate-records.ts 25");
    Deno.exit(1);
  }

  console.log(`Generating ${count} records...`);
  console.log("This may take a moment as we use GPT-3.5-turbo to generate realistic content.\n");

  const records: RegistryRecord[] = [];

  for (let i = 1; i <= count; i++) {
    const record = await generateRecord(i);
    records.push(record);

    // Small delay to avoid rate limiting
    if (i < count) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✓ Generated ${count} records successfully!\n`);
  console.log(JSON.stringify(records, null, 2));
}

// Run the script
if (import.meta.main) {
  main();
}
