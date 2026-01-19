import { createSupabaseClient } from '../../utils/supabase';

export async function onRequestGet(context) {
    const { env } = context;
    const supabase = createSupabaseClient(env);

    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching tasks :', error);
        return new Response('Database error', { status: 500 });
    }
}
