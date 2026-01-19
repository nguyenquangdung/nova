import { createSupabaseClient } from '../../utils/supabase';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { taskId, ownerName, ownerOpenId } = await request.json();

    const supabase = createSupabaseClient(env);

    try {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                owner_name: ownerName,
                owner_open_id: ownerOpenId
            })
            .eq('id', taskId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return new Response(JSON.stringify({ success: false, message: 'Task not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, message: 'Synced to Lark successfully', data: data[0] }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Sync failed:', error);
        return new Response(JSON.stringify({ success: false, message: 'Sync failed' }), { status: 500 });
    }
}
