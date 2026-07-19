// Shared helper for calling the Old Dragon API: standard headers, and a
// request wrapper that transparently refreshes an expired access token once
// before giving up and sending the user back to /login.
//
// Ajudante compartilhado para chamar a API do Old Dragon: cabeçalhos padrão,
// e um wrapper de requisição que renova o access token uma vez antes de
// desistir e mandar o usuário de volta para /login.
'use strict';

const axios = require('axios');

const OLDDRAGON_BASE_URL = process.env.OLDDRAGON_BASE_URL || 'https://olddragon.com.br';
const USER_AGENT = 'OldDragon-Example-App (contact: oi@olddragon.com.br)';

// Every request to the API must send these three headers.
function apiHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
  };
}

// Exchanges a refresh token for a new access token.
// See docs/autenticacao.md "Renovação de Token" in olddragon-api.
async function refreshAccessToken(refreshToken) {
  const response = await axios.post(
    `${OLDDRAGON_BASE_URL}/token`,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }),
    { headers: { 'User-Agent': USER_AGENT } }
  );
  return response.data; // { access_token, refresh_token, ... }
}

// A 401 with `WWW-Authenticate: Bearer error="insufficient_scope"` means the
// token is valid but missing a required scope (e.g. content.write) -- no
// amount of refreshing will fix that, so it must never trigger a retry loop.
function isInsufficientScope(error) {
  const wwwAuthenticate = error.response?.headers?.['www-authenticate'] || '';
  return wwwAuthenticate.includes('insufficient_scope');
}

// Thrown when the access token could not be refreshed and the caller must
// send the user back through /login.
class NeedsLoginError extends Error {}

// Performs an authenticated request against the API. On a plain 401
// (expired/invalid token) it refreshes the access token once, updates the
// logged-in session, and retries. Insufficient-scope 401s are never retried.
async function apiRequest(req, config) {
  try {
    return await axios({ ...config, headers: apiHeaders(req.user.accessToken) });
  } catch (error) {
    if (error.response?.status !== 401 || isInsufficientScope(error)) throw error;
    if (!req.user.refreshToken) throw new NeedsLoginError('No refresh token available');

    let tokens;
    try {
      tokens = await refreshAccessToken(req.user.refreshToken);
    } catch {
      throw new NeedsLoginError('Refresh token exchange failed');
    }

    req.user.accessToken = tokens.access_token;
    req.user.refreshToken = tokens.refresh_token || req.user.refreshToken;
    // Persist the new tokens on the session (passport re-serializes req.user).
    await new Promise((resolve, reject) => req.login(req.user, (err) => (err ? reject(err) : resolve())));

    return axios({ ...config, headers: apiHeaders(req.user.accessToken) });
  }
}

// Clears the (now unusable) session and sends the user back through /login.
function redirectToLogin(req, res) {
  req.logout(() => res.redirect('/login'));
}

module.exports = {
  OLDDRAGON_BASE_URL,
  apiHeaders,
  apiRequest,
  isInsufficientScope,
  NeedsLoginError,
  redirectToLogin,
};
