import BadgrLibInterface, { BadgrTokensResponse, IssuersResponse, BadgeClassesResponse } from "./BadgrLibInterface";
import * as dotenv from 'dotenv';
import axios from 'axios';
import qs from 'qs';

dotenv.config();

export default class BadgrLib implements BadgrLibInterface {
  private _axios;

  constructor() {
    if (!process.env.BADGR_API_ENDPOINT) {
      throw new Error('Missing Badgr API endpoint');
    }
    this._axios = axios.create({
      baseURL: process.env.BADGR_API_ENDPOINT
    });
  }

  getAccessTokens(username: string, password: string): Promise<BadgrTokensResponse> {
    return new Promise((resolve, reject) => {
      this._axios.post(`/o/token`, qs.stringify({
          username,
          password
        }))
        .then((resp) => {
          const { data } = resp;
          const _badgrTokensResponse: BadgrTokensResponse = {
            error: false,
            badgrTokens: {
              accessToken: data.access_token,
              tokenType: data.token_type,
              expiresIn: data.expires_in,
              refreshToken: data.refresh_token,
              scope: data.scope
            }
          };
          resolve(_badgrTokensResponse);
        })
        .catch((err) => {
          const _badgrTokensResponse: BadgrTokensResponse = {
            error: true
          };
          if (err.response) {
            _badgrTokensResponse.errorMessage = err.response.data.error_description;
          } else {
            _badgrTokensResponse.errorMessage = err.message;
          }
          reject(_badgrTokensResponse);
        });
    });
  }

  refreshAccessTokens(refreshToken: string): Promise<BadgrTokensResponse> {
    return new Promise((resolve, reject) => {
      this._axios.post(`/o/token`, qs.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }))
        .then((resp) => {
          const { data } = resp;
          const _badgrTokensResponse: BadgrTokensResponse = {
            error: false,
            badgrTokens: {
              accessToken: data.access_token,
              tokenType: data.token_type,
              expiresIn: data.expires_in,
              refreshToken: data.refresh_token,
              scope: data.scope
            }
          };
          resolve(_badgrTokensResponse);
        })
        .catch((err) => {
          const _badgrTokensResponse: BadgrTokensResponse = {
            error: true
          };
          if (err.message) {
            _badgrTokensResponse.errorMessage = err.message;
          }
          reject(_badgrTokensResponse);
        });
    });
  }

  getIssuers(accessToken: string, entityId?: string): Promise<IssuersResponse> {
    return new Promise((resolve, reject) => {
      this._axios.get(`/v2/issuers${entityId ? '/' + entityId : ''}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .then((resp) => {
          const _issuersResponse: IssuersResponse = {
            error: false,
            issuers: resp.data.result
          };
          resolve(_issuersResponse);
        })
        .catch((err) => {
          const _issuersResponse: IssuersResponse = {
            error: true,
            errorMessage: err.response.statusText || err.message
          };
          reject(_issuersResponse);
        });
    });
  }

  getBadgeClasses(accessToken: string, entityId?: string): Promise<BadgeClassesResponse> {
    return new Promise((resolve, reject) => {
      this._axios.get(`/v2/badgeclasses${entityId ? '/' + entityId : ''}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .then((resp) => {
          const _badgeClassesResponse: BadgeClassesResponse = {
            error: false,
            badgeClasses: resp.data.result
          };
          resolve(_badgeClassesResponse);
        })
        .catch((err) => {
          const _badgeClassesResponse: BadgeClassesResponse = {
            error: true,
            errorMessage: err.response.statusText || err.message
          };
          reject(_badgeClassesResponse);
        });
    });
  }
}
