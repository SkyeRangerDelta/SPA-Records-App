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
}

// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_KEY");
if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable not set");
  Deno.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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

// Generate record content using GPT-3.5-turbo
async function generateRecordContent(recordType: RecordType, recordStatus: RecordStatus) {
  const prompt = `Generate a realistic maritime port authority record with the following details:

Record Type: ${recordType.replace(/_/g, ' ')}
Status: ${recordStatus.replace(/_/g, ' ')}

Please provide a JSON object with these fields:
- title: A concise title for this record (10-80 characters)
- description: A brief summary (50-150 characters)
- content: Detailed content for this record (200-500 characters, use realistic maritime terminology)
- author: A realistic full name of a port authority official
- department: Optional - a relevant port authority department name (only if applicable to the record type)

Keep the tone professional and use realistic maritime/port authority language. Respond ONLY with valid JSON, no markdown formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a maritime records generator for the Sarim Port Authority. Generate realistic, professional port authority documentation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0]?.message?.content?.trim();
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the JSON response
    const parsed = JSON.parse(responseContent);
    return parsed;
  } catch (error) {
    console.error(`Error generating content for ${recordType}:`, error);
    // Fallback to basic content
    return {
      title: `${recordType.replace(/_/g, ' ')} Record`,
      description: `A ${recordStatus.replace(/_/g, ' ')} record for ${recordType.replace(/_/g, ' ')}`,
      content: `This is a ${recordStatus.replace(/_/g, ' ')} ${recordType.replace(/_/g, ' ')} record for the Sarim Port Authority.`,
      author: "Port Authority Official",
      department: undefined
    };
  }
}

// Generate a single record
async function generateRecord(id: number): Promise<RegistryRecord> {
  const recordType = weightedRandom(RECORD_TYPE_WEIGHTS);
  const status = weightedRandom(RECORD_STATUS_WEIGHTS);

  console.log(`Generating record ${id}: ${recordType} (${status})...`);

  const content = await generateRecordContent(recordType, status);

  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Random date within last year
  const updatedAt = new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime())); // Between created and now

  return {
    title: content.title,
    description: content.description,
    content: content.content,
    fileUrl: Math.random() > 0.7 ? `https://files.sarimportauthority.org/records/${id}.pdf` : undefined,
    status,
    createdAt,
    updatedAt,
    createdAtFriendly: createdAt.toLocaleDateString(),
    updatedAtFriendly: updatedAt.toLocaleDateString(),
    recordType,
    department: content.department,
    author: content.author,
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
