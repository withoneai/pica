import axios from 'axios';
import qs from 'qs';
import { DataObject, OAuthResponse } from '../../lib/types';

export const refresh = async ({ body }: DataObject): Promise<OAuthResponse> => {
    try {
        const {
            OAUTH_CLIENT_ID: client_id,
            OAUTH_CLIENT_SECRET: client_secret,
            OAUTH_REFRESH_TOKEN: refresh_token,
            OAUTH_METADATA: { meta },
        } = body;

        let refreshToken = refresh_token;
        const ZOHO_ACCOUNTS_DOMAIN = meta.ZOHO_ACCOUNTS_DOMAIN;

        const requestBody = {
            grant_type: 'refresh_token',
            client_id,
            client_secret,
            refresh_token,
        };

        const response = await axios({
            url: `${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: qs.stringify(requestBody),
        });

        const {
            data: {
                access_token: accessToken,
                token_type: tokenType,
                expires_in: expiresIn,
            },
        } = response;

        // Update the refresh token if a new token is allocated
        if (response.data.refresh_token) {
            refreshToken = response.data.refresh_token;
        }

        return {
            accessToken,
            refreshToken,
            expiresIn,
            tokenType,
            meta,
        };
    } catch (error) {
        throw new Error(`Error fetching refresh token for Zoho: ${error}`);
    }
};
