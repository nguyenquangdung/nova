const { Client } = require('pg');
require('dotenv').config();

const setupDatabase = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL successfully.');

        // Initialize Tables
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                status TEXT DEFAULT 'To Do',
                owner_name TEXT,
                owner_open_id TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await client.query(createTableQuery);
        console.log('✅ Table "tasks" is ready.');

        // Insert Mock Data if table is empty
        const countRes = await client.query('SELECT COUNT(*) FROM tasks');
        if (parseInt(countRes.rows[0].count) === 0) {
            const insertMockQuery = `
                INSERT INTO tasks (title, status) VALUES 
                ('Thiết kế giao diện', 'To Do'),
                ('Xây dựng API', 'To Do'),
                ('Tích hợp Lark', 'To Do');
            `;
            await client.query(insertMockQuery);
            console.log('✅ Inserted mock data.');
        } else {
            console.log('ℹ️ Table "tasks" already has data. Skipping mock insert.');
        }

    } catch (err) {
        console.error('❌ Error setting up database:', err);
    } finally {
        await client.end();
    }
};

setupDatabase();
