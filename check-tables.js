const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:9636@localhost:5432/postgres',
});

async function checkTables() {
  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
    `);
    
    console.log('Tables in public schema:');
    result.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
