export const getAppAccessToken = async (env) => {
    try {
        const response = await fetch('https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                app_id: env.LARK_APP_ID,
                app_secret: env.LARK_APP_SECRET
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get app access token: ${error}`);
        }

        const data = await response.json();
        return data.app_access_token;
    } catch (error) {
        console.error('Error getting app access token:', error);
        throw error;
    }
};

export const getUserAccessToken = async (code, env) => {
    try {
        const appAccessToken = await getAppAccessToken(env);
        const response = await fetch('https://open.larksuite.com/open-apis/authen/v1/oidc/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${appAccessToken}`
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get user access token: ${error}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error getting user access token:', error);
        throw error;
    }
};

export const getUserInfo = async (userAccessToken) => {
    try {
        const response = await fetch('https://open.larksuite.com/open-apis/authen/v1/user_info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userAccessToken}`
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get user info: ${error}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error getting user info:', error);
        throw error;
    }
};

export const getUserTasks = async (userAccessToken) => {
    try {
        const url = new URL('https://open.larksuite.com/open-apis/task/v2/tasks');
        url.searchParams.append('page_size', '50');

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userAccessToken}`
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get user tasks: ${error}`);
        }

        const data = await response.json();
        return data.data.items || [];
    } catch (error) {
        console.error('Error getting user tasks:', error);
        throw error;
    }
};
