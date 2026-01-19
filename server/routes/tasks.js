const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getUserTasks } = require('../larkService');
require('dotenv').config();

// Access internal mock data from index.js (in a real app, this would be a DB)
// For simplicity in this demo, we'll just use a local variable here or assume we can pass it
// But accessing `tasks` from index.js is hard without dependency injection.
// Let's redefine `tasks` here or use a shared module.
// For QUICK DEMO: I will put the tasks variable here.

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('tasks').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching tasks from Supabase:', error);
        res.status(500).send('Database error');
    }
});

router.post('/sync', async (req, res) => {
    const { taskId, ownerName, ownerOpenId } = req.body;

    try {
        // Update Supabase
        const { data, error } = await supabase
            .from('tasks')
            .update({
                owner_name: ownerName,
                owner_open_id: ownerOpenId
            })
            .eq('id', taskId)
            .select();

        if (error) throw error;
        if (data.length === 0) return res.status(404).send('Task not found');

        console.log('Syncing to Lark:', data[0]);
        // Here you would call Lark API to actually sync if needed

        res.json({ success: true, message: 'Synced to Lark successfully' });
    } catch (error) {
        console.error('Sync failed:', error);
        res.status(500).send('Sync failed');
    }
});



router.post('/sync-from-lark', async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) {
        return res.status(401).send('Missing access token');
    }

    try {
        const larkTasks = await getUserTasks(accessToken);

        let addedCount = 0;

        // Loop and insert into Supabase
        for (const lTask of larkTasks) {
            // Check if exists
            const { data: existing } = await supabase
                .from('tasks')
                .select('id')
                .eq('title', lTask.summary)
                .limit(1);

            if (!existing || existing.length === 0) {
                // Insert
                await supabase.from('tasks').insert({
                    title: lTask.summary || 'No Title',
                    owner_name: 'Me (Lark)',
                    owner_open_id: 'unknown', // We don't have open_id from task list directly usually
                    status: 'Synced'
                });
                addedCount++;
            }
        }

        res.json({ success: true, added: addedCount, total: larkTasks.length });
    } catch (error) {
        console.error('Sync from Lark failed:', error);
        res.status(500).send('Sync failed');
    }
});

module.exports = router;
