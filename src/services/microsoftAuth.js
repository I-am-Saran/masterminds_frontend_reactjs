import { PublicClientApplication } from "@azure/msal-browser";

const tenantId = (import.meta.env.VITE_MS_TENANT_ID || "").trim();
const clientId = (import.meta.env.VITE_MS_CLIENT_ID || "").trim();

/**
 * MSAL Browser uses Entra ID Authorization Code Flow with PKCE by default for SPA logins.
 * loginPopup acquires an OIDC id_token that the backend validates against JWKS.
 */
const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri:
      typeof window !== "undefined" ? `${window.location.origin}/login` : "",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

const loginRequest = {
  scopes: ["openid", "profile", "email"],
  prompt: "select_account",
};

let msalInstance = null;
let msalInitPromise = null;

export function isMicrosoftAuthConfigured() {
  return Boolean(clientId && tenantId);
}

async function getMsalInstance() {
  if (!isMicrosoftAuthConfigured()) {
    return null;
  }

  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }

  if (!msalInitPromise) {
    msalInitPromise = msalInstance.initialize();
  }

  await msalInitPromise;
  return msalInstance;
}

export async function signInWithMicrosoftPopup() {
  const instance = await getMsalInstance();
  if (!instance) {
    throw new Error(
      "Microsoft sign-in is not configured. Please contact your administrator."
    );
  }

  const response = await instance.loginPopup(loginRequest);
  const idToken = response.idToken;

  if (!idToken) {
    throw new Error(
      "Microsoft sign-in did not return a valid ID token. Please try again."
    );
  }

  return idToken;
}

export function getMicrosoftAuthErrorMessage(error) {
  if (!error) {
    return "Microsoft sign-in failed. Please try again.";
  }

  const code = error.errorCode || error.code;
  if (code === "user_cancelled" || code === "popup_window_error") {
    return "Microsoft sign-in was cancelled.";
  }

  return error.message || "Microsoft sign-in failed. Please try again.";
}
