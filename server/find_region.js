const { Client } = require('pg');
require('dotenv').config();

const regions = [
    'aws-0-us-east-1',
    'aws-0-eu-central-1',
    'aws-0-us-west-1', // Already tested but retrying won't hurt
    'aws-0-ap-southeast-1', // Already tested
    'aws-0-sa-east-1',
    'aws-0-eu-west-1',
    'aws-0-eu-west-2',
    'aws-0-eu-west-3',
    'aws-0-ap-northeast-1',
    'aws-0-ap-northeast-2',
    'aws-0-ap-southeast-2',
    'aws-0-ca-central-1',
    'aws-0-ap-south-1',
    'aws-0-us-west-2'
];

const checkRegion = async (region) => {
    // Note: Pooler usually needs port 6543 and Transaction Mode (postgres.projectref)
    // But for Session mode (port 5432) we use [db_user].[project_ref]
    // The pooler URL format: postgres://[user].[project_ref]:[password]@[region].pooler.supabase.com:6543/postgres

    // User provided password: @Mothaiba456 (need encoding)
    const encodedPass = '%40Mothaiba456';
    const connectionString = `postgres://postgres.fvpxjbicnhtykgzotunu:${encodedPass}@${region}.pooler.supabase.com:6543/postgres`;

    // Using port 6543 for Transaction Pooler (recommended for serverless)

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000 // 3s timeout
    });

    try {
        await client.connect();
        console.log(`✅ FOUND REGION: ${region}`);
        await client.end();
        return region;
    } catch (e) {
        // console.log(`❌ ${region}: ${e.message}`);
        return null;
    }
};

const find = async () => {
    console.log('Searching for correct region pooler...');
    for (const region of regions) {
        process.stdout.write(`Testing ${region}... `);
        const result = await checkRegion(region);
        if (result) {
            console.log('\nSUCCESS!');
            process.exit(0);
        } else {
            console.log('Failed');
        }
    }
    console.log('Could not find region.');
};

find();
