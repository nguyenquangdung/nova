import { createSupabaseClient } from '../../utils/supabase';
import { getUserTasks } from '../../utils/lark';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { accessToken } = await request.json();

    if (!accessToken) {
        return new Response('Missing access token', { status: 401 });
    }

    const supabase = createSupabaseClient(env);

    try {
        const larkTasks = await getUserTasks(accessToken);
        let addedCount = 0;

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
                    owner_open_id: 'unknown',
                    status: 'Synced'
                });
                addedCount++;
            }
        }

        return new Response(JSON.stringify({ success: true, added: addedCount, total: larkTasks.length }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Sync from Lark failed:', error);
        return new Response(JSON.stringify({ success: false, message: 'Sync failed' }), { status: 500 });
    }
}
