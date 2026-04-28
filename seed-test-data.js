const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:9636@localhost:5432/postgres',
});

async function seedTestData() {
  try {
    await client.connect();

    // Create a test role first
    const roleResult = await client.query(`
      INSERT INTO "role" (id, name, code, level, "isDeleted", status, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Admin', 'ADMIN', 1, false, 'ACTIVE', NOW(), NOW())
      RETURNING id;
    `);

    const roleId = roleResult.rows[0].id;
    console.log('Created role:', roleId);

    // Create a test domain
    const domainResult = await client.query(`
      INSERT INTO "domain" (id, name, email, password, role_id, is_deleted, status, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Test Domain', 'test@domain.com', 'hashedpassword', $1, false, 'ACTIVE', NOW(), NOW())
      RETURNING id;
    `, [roleId]);

    const domainId = domainResult.rows[0].id;
    console.log('Created domain:', domainId);

    // Create a test location
    const locationResult = await client.query(`
      INSERT INTO "Location" (id, name, code, type, "domainId", status, "isDeleted", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), '{"en":"Test Location"}', $1, 'Site', $2, 'ACTIVE', false, NOW(), NOW())
      RETURNING *;
    `, ['LOCATION_' + Date.now(), domainId]);

    console.log('Created location:', locationResult.rows[0]);

    await client.end();
    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
}

seedTestData();
