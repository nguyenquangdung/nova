import { getUserAccessToken, getUserInfo } from '../../utils/lark';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return new Response('Missing code', { status: 400 });
    }

    try {
        const tokenData = await getUserAccessToken(code, env);
        const userInfo = await getUserInfo(tokenData.access_token);

        // Redirect to home with params (Same simple strategy as before)
        const homeUrl = new URL('/', url.origin);
        homeUrl.searchParams.set('name', userInfo.name);
        homeUrl.searchParams.set('avatar', userInfo.avatar_url);
        homeUrl.searchParams.set('open_id', userInfo.open_id);
        homeUrl.searchParams.set('access_token', tokenData.access_token);

        return Response.redirect(homeUrl.toString(), 302);
    } catch (error) {
        console.error('Login failed:', error);
        return new Response('Authentication failed: ' + error.message, { status: 500 });
    }
}
