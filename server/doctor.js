const { Client } = require('pg');
require('dotenv').config();

const runDoctor = async () => {
    console.log('👨‍⚕️ DATABASE DOCTOR IS RUNNING...\n');

    // 1. Check Env Variables
    console.log('1. Checking Environment Variables...');
    if (!process.env.DATABASE_URL) {
        console.error('❌ Missing DATABASE_URL in .env');
        return;
    }
    console.log('✅ DATABASE_URL found.');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 2. Check Connection
        console.log('\n2. Testing Database Connection...');
        await client.connect();
        console.log('✅ Connection to Supabase successful.');

        // 3. List Tables
        console.log('\n3. Listing Public Tables...');
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        const tables = tablesRes.rows.map(row => row.table_name);
        if (tables.length === 0) {
            console.warn('⚠️ No tables found in "public" schema.');
        } else {
            console.log('Found tables:', tables.join(', '));
        }

        // 4. Inspect "tasks" table
        if (tables.includes('tasks')) {
            console.log('\n4. Inspecting "tasks" table content (First 5 rows)...');
            const tasksRes = await client.query('SELECT * FROM tasks ORDER BY id ASC LIMIT 5');
            console.table(tasksRes.rows);
        } else {
            console.error('❌ Table "tasks" DOES NOT EXIST. Run "node setup.js" to create it.');
        }

    } catch (err) {
        console.error('❌ DIAGNOSIS FAILED:', err.message);
    } finally {
        await client.end();
        console.log('\n👨‍⚕️ Doctor finished.');
    }
};

runDoctor();
