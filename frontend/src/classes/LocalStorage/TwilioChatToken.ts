/**
 * Hint: You probably shouldn't be using this directly. Check to see if you
 * should be using the Chat API.
 */
export default class LocalStorage {
  private static readonly _twilioChatTokenKey = 'twilioChatToken';

  private static readonly _twilioChatTokenExpiryKey = 'twilioChatTokenExpiry';

  private static readonly _twilioChatTokenConferenceIdKey = 'twilioChatTokenConferenceId';

  private static readonly _twilioChatUserProfileIdKey = 'twilioChatUserProfileId';

  static get twilioChatToken(): string | null {
    return localStorage.getItem(LocalStorage._twilioChatTokenKey);
  }

  static set twilioChatToken(value: string | null) {
    if (value) {
      localStorage.setItem(LocalStorage._twilioChatTokenKey, value);
    } else {
      localStorage.removeItem(LocalStorage._twilioChatTokenKey);
    }
  }

  static get twilioChatTokenExpiry(): Date | null {
    const str = localStorage.getItem(LocalStorage._twilioChatTokenExpiryKey);
    return str ? new Date(parseInt(str, 10)) : null;
  }

  static set twilioChatTokenExpiry(value: Date | null) {
    if (value) {
      localStorage.setItem(LocalStorage._twilioChatTokenExpiryKey, value.getTime().toString());
    } else {
      localStorage.removeItem(LocalStorage._twilioChatTokenExpiryKey);
    }
  }

  static get twilioChatTokenConferenceId(): string | null {
    return localStorage.getItem(LocalStorage._twilioChatTokenConferenceIdKey);
  }

  static set twilioChatTokenConferenceId(value: string | null) {
    if (value) {
      localStorage.setItem(LocalStorage._twilioChatTokenConferenceIdKey, value);
    } else {
      localStorage.removeItem(LocalStorage._twilioChatTokenConferenceIdKey);
    }
  }

  static get twilioChatUserProfileId(): string | null {
    return localStorage.getItem(LocalStorage._twilioChatUserProfileIdKey);
  }

  static set twilioChatUserProfileId(value: string | null) {
    if (value) {
      localStorage.setItem(LocalStorage._twilioChatUserProfileIdKey, value);
    } else {
      localStorage.removeItem(LocalStorage._twilioChatUserProfileIdKey);
    }
  }
}
