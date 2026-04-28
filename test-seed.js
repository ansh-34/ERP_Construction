const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:9636@localhost:5432/postgres',
});

async function seedTestData() {
  try {
    await client.connect();

    // Create a test domain
    const domainResult = await client.query(`
      INSERT INTO "Domain" (id, name, email, "createdAt", "updatedAt", "isDeleted")
      VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Test Domain', 'test@domain.com', NOW(), NOW(), false)
      RETURNING id;
    `);

    const domainId = domainResult.rows[0].id;
    console.log('Created domain:', domainId);

    // Create a test location
    const locationResult = await client.query(`
      INSERT INTO "Location" (id, name, type, code, "domainId", status, "isDeleted", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, 'Site', $2, $3, 'ACTIVE', false, NOW(), NOW())
      RETURNING *;
    `, ['Test Location', 'LOCATION_' + Date.now(), domainId]);

    console.log('Created location:', locationResult.rows[0]);

    await client.end();
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
}

seedTestData();
