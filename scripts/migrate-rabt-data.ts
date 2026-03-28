import "dotenv/config";
import { Pool } from "pg";

const ETIHAD_DB = process.env.DATABASE_URL!;
const RABT_DB = "postgresql://neondb_owner:npg_9vFmztlA2eDS@ep-delicate-recipe-adzxdtuf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Governorate code mapping from lib/data/governorates.ts
const governorateCodes: Record<string, string> = {
  "القاهرة": "CA",
  "الجيزة": "GZ",
  "الإسكندرية": "AX",
  "الدقهلية": "DK",
  "البحر الأحمر": "RS",
  "البحيرة": "BH",
  "الفيوم": "FY",
  "الغربية": "GH",
  "الإسماعيلية": "IS",
  "المنوفية": "MN",
  "المنيا": "MY",
  "القليوبية": "QL",
  "الوادي الجديد": "NV",
  "السويس": "SZ",
  "أسوان": "AS",
  "أسيوط": "AY",
  "بني سويف": "BS",
  "بورسعيد": "PS",
  "دمياط": "DM",
  "الشرقية": "SH",
  "جنوب سيناء": "SS",
  "كفر الشيخ": "KS",
  "مطروح": "MT",
  "الأقصر": "LX",
  "قنا": "QN",
  "شمال سيناء": "NS",
  "سوهاج": "SG",
};

// Extra governorate not in rabt but in etihad's list
const extraGovernorates: { name: string; code: string }[] = [
  { name: "البحر الأحمر", code: "RS" },
];

async function main() {
  const rabtPool = new Pool({ connectionString: RABT_DB });
  const etihadPool = new Pool({ connectionString: ETIHAD_DB });

  try {
    // 1. Migrate governorates with codes
    console.log("=== Migrating Governorates ===");
    const { rows: rabtGovs } = await rabtPool.query("SELECT * FROM governorates ORDER BY name");

    for (const gov of rabtGovs) {
      const code = governorateCodes[gov.name] || "XX";
      const exists = await etihadPool.query(
        'SELECT id FROM governorates WHERE name = $1',
        [gov.name]
      );
      if (exists.rows.length > 0) {
        console.log(`  Governorate "${gov.name}" already exists, skipping`);
        continue;
      }
      await etihadPool.query(
        `INSERT INTO governorates (id, name, code, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [gov.id, gov.name, code, gov.isActive, gov.createdAt, gov.updatedAt]
      );
      console.log(`  Migrated governorate: ${gov.name} (${code})`);
    }

    // Check if البحر الأحمر exists (it's in etihad's list but might not be in rabt's 27)
    for (const extra of extraGovernorates) {
      const exists = await etihadPool.query(
        'SELECT id FROM governorates WHERE name = $1',
        [extra.name]
      );
      if (exists.rows.length === 0) {
        await etihadPool.query(
          `INSERT INTO governorates (id, name, code, "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, true, NOW(), NOW())`,
          [`extra_${extra.code}`, extra.name, extra.code]
        );
        console.log(`  Added extra governorate: ${extra.name} (${extra.code})`);
      }
    }

    // 2. Migrate units
    console.log("\n=== Migrating Units ===");
    const { rows: rabtUnits } = await rabtPool.query("SELECT * FROM units");

    for (const unit of rabtUnits) {
      const exists = await etihadPool.query(
        'SELECT id FROM units WHERE id = $1',
        [unit.id]
      );
      if (exists.rows.length > 0) {
        console.log(`  Unit "${unit.name}" already exists, skipping`);
        continue;
      }
      await etihadPool.query(
        `INSERT INTO units (id, "governorateId", name, "whatsappLink", address, phone, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [unit.id, unit.governorateId || null, unit.name, unit.whatsappLink, unit.address, unit.phone, unit.isActive, unit.createdAt, unit.updatedAt]
      );
      console.log(`  Migrated unit: ${unit.name}`);
    }

    // 3. Migrate users
    console.log("\n=== Migrating Users ===");
    const { rows: rabtUsers } = await rabtPool.query("SELECT * FROM users");

    for (const user of rabtUsers) {
      const exists = await etihadPool.query(
        'SELECT id FROM users WHERE id = $1 OR email = $2',
        [user.id, user.email]
      );
      if (exists.rows.length > 0) {
        console.log(`  User "${user.email}" already exists, skipping`);
        continue;
      }
      await etihadPool.query(
        `INSERT INTO users (id, email, password, name, phone, role, "unitId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6::\"Role\", $7, $8, $9)`,
        [user.id, user.email, user.password, user.name, user.phone, user.role, user.unitId || null, user.createdAt, user.updatedAt]
      );
      console.log(`  Migrated user: ${user.email} (${user.role})`);
    }

    // 4. Migrate applications
    console.log("\n=== Migrating Applications ===");
    const { rows: rabtApps } = await rabtPool.query("SELECT * FROM applications");

    for (const app of rabtApps) {
      const exists = await etihadPool.query(
        'SELECT id FROM applications WHERE id = $1',
        [app.id]
      );
      if (exists.rows.length > 0) {
        console.log(`  Application "${app.id}" already exists, skipping`);
        continue;
      }
      await etihadPool.query(
        `INSERT INTO applications (
          id, "userId", "governorateId", "fullName", "nationalId", phone, "birthDate",
          education, address, status, "assignedUnitId", "adminNote",
          "photoUrl", "nationalIdPhotoUrl", "nationalIdPhotoBackUrl",
          experiences, "submittedAt", "decidedAt", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::\"ApplicationStatus\", $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          app.id, app.userId, app.governorateId, app.fullName, app.nationalId,
          app.phone, app.birthDate, app.education, app.address, app.status,
          app.assignedUnitId || null, app.adminNote,
          app.photoUrl, app.nationalIdPhotoUrl, app.nationalIdPhotoBackUrl,
          app.experiences, app.submittedAt, app.decidedAt, app.createdAt, app.updatedAt
        ]
      );
      console.log(`  Migrated application: ${app.fullName} (${app.status})`);
    }

    // 5. Backfill Member.governorateId
    console.log("\n=== Backfilling Member.governorateId ===");
    const { rows: members } = await etihadPool.query(
      'SELECT id, governorate FROM "Member" WHERE "governorateId" IS NULL'
    );

    let updated = 0;
    for (const member of members) {
      const { rows: govRows } = await etihadPool.query(
        'SELECT id FROM governorates WHERE name = $1',
        [member.governorate]
      );
      if (govRows.length > 0) {
        await etihadPool.query(
          'UPDATE "Member" SET "governorateId" = $1 WHERE id = $2',
          [govRows[0].id, member.id]
        );
        updated++;
      }
    }
    console.log(`  Updated ${updated} of ${members.length} members`);

    console.log("\n=== Migration Complete! ===");

    // Verify counts
    const counts = await etihadPool.query(`
      SELECT 'governorates' as tbl, count(*) FROM governorates
      UNION ALL SELECT 'units', count(*) FROM units
      UNION ALL SELECT 'users', count(*) FROM users
      UNION ALL SELECT 'applications', count(*) FROM applications
    `);
    console.log("\nFinal counts in etihad DB:");
    for (const row of counts.rows) {
      console.log(`  ${row.tbl}: ${row.count}`);
    }

  } finally {
    await rabtPool.end();
    await etihadPool.end();
  }
}

main().catch(console.error);
