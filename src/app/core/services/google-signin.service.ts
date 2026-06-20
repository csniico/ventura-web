import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Loads Google Identity Services and yields a Google ID token, which the
 * backend exchanges for a session (POST /auth/sign-in-google). Mirrors the
 * mobile app's idToken flow.
 *
 * We render Google's official button (popup flow) rather than One Tap
 * (`prompt()`): One Tap relies on FedCM, which browsers frequently block, and
 * fails with opaque "dismissed / NetworkError" messages. The rendered button
 * is reliable and works regardless of FedCM/third-party-cookie settings.
 */
@Injectable({ providedIn: 'root' })
export class GoogleSignInService {
  private scriptLoaded?: Promise<void>;

  get clientId(): string | undefined {
    return (environment as any).googleClientId as string | undefined;
  }

  private loadScript(): Promise<void> {
    if (this.scriptLoaded) return this.scriptLoaded;
    this.scriptLoaded = new Promise<void>((resolve, reject) => {
      const w = window as any;
      if (w.google?.accounts?.id) return resolve();
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
      document.head.appendChild(script);
    });
    return this.scriptLoaded;
  }

  /**
   * Renders the "Sign in with Google" button into [container]. [onToken] is
   * called with the ID token on success; [onError] on configuration/load
   * failures. Note: the GIS callback runs outside Angular's zone — callers
   * should re-enter the zone (NgZone.run) before touching component state.
   */
  async renderButton(
    container: HTMLElement,
    onToken: (idToken: string) => void,
    onError?: (error: Error) => void,
  ): Promise<void> {
    if (!this.clientId) {
      onError?.(new Error('Google sign-in is not configured (missing client id).'));
      return;
    }
    try {
      await this.loadScript();
    } catch (e) {
      onError?.(e as Error);
      return;
    }
    const google = (window as any).google;
    google.accounts.id.initialize({
      client_id: this.clientId,
      use_fedcm_for_prompt: false,
      callback: (response: { credential?: string }) => {
        if (response?.credential) onToken(response.credential);
        else onError?.(new Error('No credential returned by Google.'));
      },
    });
    const width = Math.min(400, Math.max(240, container.clientWidth || 360));
    google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width,
    });
  }
}
