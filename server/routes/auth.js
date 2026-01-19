const express = require('express');
const router = express.Router();
const { getUserAccessToken, getUserInfo } = require('../larkService');

const APP_ID = process.env.LARK_APP_ID;
// IMPORTANT: Redirect URI must match what is configured in Lark Console
// Example: http://localhost:3000/api/auth/callback
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

router.get('/login', (req, res) => {
    // Redirect user to Lark Login page
    const larkLoginUrl = `https://open.larksuite.com/open-apis/authen/v1/authorize?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=contact:user.id:readonly&state=RANDOM_STATE`;
    res.redirect(larkLoginUrl);
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Missing code');
    }

    try {
        const tokenData = await getUserAccessToken(code);
        const userInfo = await getUserInfo(tokenData.access_token);

        // In a real app, you would create a session or JWT here
        // For demo, we just redirect back to frontend with some info or store in cookie
        // Here we redirect to frontend with user info in query params (NOT SECURE for production, just for demo)

        const frontendUrl = `http://localhost:5173?name=${encodeURIComponent(userInfo.name)}&avatar=${encodeURIComponent(userInfo.avatar_url)}&open_id=${userInfo.open_id}&access_token=${tokenData.access_token}`;
        res.redirect(frontendUrl);
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).send('Authentication failed');
    }
});

module.exports = router;
