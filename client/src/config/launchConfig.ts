/**
 * Elite Legal Desk - Official Inauguration Configuration
 * 
 * Controls the ceremonial full-screen velvet curtain launch experience.
 * 
 * Configuration:
 * - Set LAUNCH_MODE to true to enable the inauguration curtain for visitors.
 * - Set LAUNCH_MODE to false to disable it entirely (everyone enters directly).
 * - Can also be set via the VITE_LAUNCH_MODE environment variable ('true' | 'false').
 * 
 * Behavior:
 * - When enabled, first-time visitors see the grand velvet curtains and launch button.
 * - Clicking "LAUNCH ELITE LEGAL DESK" plays the ceremonial opening animation.
 * - On completion, a flag is stored in localStorage so subsequent visits or refreshes
 *   go straight to the normal website.
 * - Developers/Reviewers can re-trigger the launch at any time by appending
 *   `?relaunch=true` or `?preview_launch=true` to the URL.
 */

export const LAUNCH_MODE: boolean = 
  import.meta.env.VITE_LAUNCH_MODE !== undefined
    ? import.meta.env.VITE_LAUNCH_MODE === 'true'
    : true; // Enabled for the Official Launch

export const LAUNCH_STORAGE_KEY = 'eld_official_launch_completed_v1';

/**
 * Checks if the inauguration launch was already completed in this browser.
 */
export const isLaunchCompleted = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(LAUNCH_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Records that the launch animation has finished successfully.
 */
export const markLaunchCompleted = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAUNCH_STORAGE_KEY, 'true');
  } catch (err) {
    console.warn('Could not save launch status to localStorage', err);
  }
};

/**
 * Resets the launch status so the curtain can be experienced again.
 */
export const resetLaunchState = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LAUNCH_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear launch status from localStorage', err);
  }
};
