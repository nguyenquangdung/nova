const axios = require('axios');
require('dotenv').config();

const APP_ID = process.env.LARK_APP_ID;
const APP_SECRET = process.env.LARK_APP_SECRET;

const getAppAccessToken = async () => {
    try {
        const response = await axios.post('https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal', {
            app_id: APP_ID,
            app_secret: APP_SECRET
        });
        return response.data.app_access_token;
    } catch (error) {
        console.error('Error getting app access token:', error.response?.data || error.message);
        throw error;
    }
};

const getUserAccessToken = async (code) => {
    try {
        const appAccessToken = await getAppAccessToken();
        const response = await axios.post('https://open.larksuite.com/open-apis/authen/v1/oidc/access_token', {
            grant_type: 'authorization_code',
            code: code
        }, {
            headers: {
                'Authorization': `Bearer ${appAccessToken}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting user access token:', error.response?.data || error.message);
        throw error;
    }
};

const getUserInfo = async (userAccessToken) => {
    try {
        const response = await axios.get('https://open.larksuite.com/open-apis/authen/v1/user_info', {
            headers: {
                'Authorization': `Bearer ${userAccessToken}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting user info:', error.response?.data || error.message);
        throw error;
    }
};

const getUserTasks = async (userAccessToken) => {
    try {
        const response = await axios.get('https://open.larksuite.com/open-apis/task/v2/tasks', {
            headers: {
                'Authorization': `Bearer ${userAccessToken}`
            },
            params: {
                page_size: 50
            }
        });
        return response.data.data.items || [];
    } catch (error) {
        console.error('Error getting user tasks:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    getAppAccessToken,
    getUserAccessToken,
    getUserInfo,
    getUserTasks
};
