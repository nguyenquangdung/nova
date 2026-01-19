const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const checkHttp = async () => {
    console.log('Testing HTTPS connection via supabase-js...');
    try {
        const { data, error } = await supabase.from('tasks').select('*').limit(1);
        if (error) {
            console.log('Connection successful, but request failed (likely table missing):');
            console.log(error);
        } else {
            console.log('Connection successful! Data:', data);
        }
    } catch (e) {
        console.log('Connection failed:', e.message);
    }
};

checkHttp();
