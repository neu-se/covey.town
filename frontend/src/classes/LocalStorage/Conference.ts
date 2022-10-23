/**
 * Hint: You probably shouldn't be using this directly. Check to see if you
 * should be using a hook.
 */
export default class LocalStorage {
  private static readonly _currentConferenceIdKey = 'currentConferenceId';

  private static readonly _wasBannedFromNameKey = 'wasBannedFromName';

  private static readonly _wasManagerOrAdminKey = 'wasManagerOrAdmin';

  private static readonly _previousUserIdKey = 'previousUserId';

  static get currentConferenceId(): string | null {
    return localStorage.getItem(LocalStorage._currentConferenceIdKey);
  }

  static set currentConferenceId(value: string | null) {
    if (value) {
      localStorage.setItem(LocalStorage._currentConferenceIdKey, value);
    } else {
      localStorage.removeItem(LocalStorage._currentConferenceIdKey);
    }
  }

  static get wasBannedFromName(): string | null {
    return localStorage.getItem(LocalStorage._wasBannedFromNameKey);
  }

  static set wasBannedFromName(value: string | null) {
    if (value) {
      localStorage.setItem(LocalStorage._wasBannedFromNameKey, value);
    } else {
      localStorage.removeItem(LocalStorage._wasBannedFromNameKey);
    }
  }

  static get wasManagerOrAdmin(): boolean | null {
    return localStorage.getItem(LocalStorage._wasManagerOrAdminKey) === 'true';
  }

  static set wasManagerOrAdmin(value: boolean | null) {
    if (value) {
      localStorage.setItem(LocalStorage._wasManagerOrAdminKey, value === true ? 'true' : 'false');
    } else {
      localStorage.removeItem(LocalStorage._wasManagerOrAdminKey);
    }
  }

  static get previousUserId(): string | null {
    return localStorage.getItem(LocalStorage._previousUserIdKey);
  }

  static set previousUserId(value: string | null) {
    if (value) {
      localStorage.setItem(LocalStorage._previousUserIdKey, value);
    } else {
      localStorage.removeItem(LocalStorage._previousUserIdKey);
    }
  }
}
