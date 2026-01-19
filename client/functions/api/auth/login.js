export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);

    // Construct redirect URI based on current origin
    // If running on localhost:5173, this will be http://localhost:5173/api/auth/callback
    // If running on production, this will be https://your-domain.pages.dev/api/auth/callback
    const redirectUri = `${url.origin}/api/auth/callback`;

    const APP_ID = env.LARK_APP_ID;

    if (!APP_ID) {
        return new Response("Missing LARK_APP_ID environment variable", { status: 500 });
    }

    const larkLoginUrl = `https://open.larksuite.com/open-apis/authen/v1/authorize?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=contact:user.id:readonly&state=RANDOM_STATE`;

    return Response.redirect(larkLoginUrl, 302);
}
