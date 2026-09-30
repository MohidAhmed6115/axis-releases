import { App as CapApp } from '@capacitor/app';
import { isAndroidCapacitor, isElectronEnvironment } from './usageStatsService';
import { setStoredGCalToken } from './calendarSyncService';

/**
 * Extracts access_token from redirect URI query string or hash fragment.
 */
export function extractTokenFromUrl(urlString: string): string | null {
  try {
    // 1. Check hash fragment: e.g. com.axis.app://oauth-callback#access_token=...
    const hashIndex = urlString.indexOf('#');
    if (hashIndex !== -1) {
      const hashParams = new URLSearchParams(urlString.substring(hashIndex + 1));
      const accessToken = hashParams.get('access_token');
      if (accessToken) return accessToken;
    }

    // 2. Check query string: e.g. com.axis.app://oauth-callback?access_token=...
    const searchIndex = urlString.indexOf('?');
    if (searchIndex !== -1) {
      const searchParams = new URLSearchParams(urlString.substring(searchIndex + 1));
      const accessToken = searchParams.get('access_token');
      if (accessToken) return accessToken;
    }
  } catch (e) {
    console.warn('Error parsing OAuth token from redirect URL:', e);
  }
  return null;
}

/**
 * Initializes deep link listener on Android for Google OAuth return redirect (com.axis.app://).
 */
export function initOAuthDeepLinkListener(onTokenReceived?: (token: string) => void): () => void {
  if (!isAndroidCapacitor()) {
    return () => {};
  }

  const listenerHandle = CapApp.addListener('appUrlOpen', (event) => {
    const rawUrl = event.url;
    if (rawUrl && (rawUrl.startsWith('com.axis.app://') || rawUrl.includes('oauth-callback'))) {
      const token = extractTokenFromUrl(rawUrl);
      if (token) {
        setStoredGCalToken(token);
        if (onTokenReceived) {
          onTokenReceived(token);
        }
      }
    }
  });

  return () => {
    listenerHandle.then((handle) => handle.remove()).catch(() => {});
  };
}

/**
 * Initiates Google OAuth in Electron environment using the Electron loopback / in-app window.
 */
export async function startElectronGoogleOAuth(clientId?: string): Promise<string | null> {
  if (!isElectronEnvironment()) return null;

  try {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.startGoogleOAuth) return null;

    const redirectUri = 'http://127.0.0.1:42813/oauth/callback';
    const effectiveClientId = clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(effectiveClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly')}&` +
      `prompt=select_account`;

    const result = await electronAPI.startGoogleOAuth(authUrl);
    if (result && result.access_token) {
      setStoredGCalToken(result.access_token);
      return result.access_token;
    }
  } catch (err) {
    console.warn('Electron OAuth flow error:', err);
  }
  return null;
}
