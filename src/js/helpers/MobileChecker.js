/**
 * Class for mobile browser detection.
 */
class MobileChecker {
  static userAgent = navigator.userAgent;

  /**
   * Checks if the device is Android.
   * @returns {boolean} true if the device is Android, otherwise false.
   */
  static get isAndroid() {
    return Boolean(this.userAgent.match(/Android/i));
  }

  /**
   * Checks if the device is BlackBerry.
   * @returns {boolean} true if the device is BlackBerry, otherwise false.
   */
  static get isBlackBerry() {
    return Boolean(this.userAgent.match(/BlackBerry/i));
  }

  /**
   * Checks if the device is iOS (iPhone, iPad, or iPod).
   * @returns {boolean} true if the device is iOS, otherwise false.
   */
  static get isAppleOS() {
    return Boolean(this.userAgent.match(/iPhone|iPad|iPod/i));
  }

  /**
   * Checks if the device is Opera Mini.
   * @returns {boolean} true if the device is Opera Mini, otherwise false.
   */
  static get isOpera() {
    return Boolean(this.userAgent.match(/Opera Mini/i));
  }

  /**
   * Checks if the device is Windows.
   * @returns {boolean} true if the device is Windows, otherwise false.
   */
  static get isWindows() {
    return Boolean(this.userAgent.match(/IEMobile/i));
  }

  /**
   * Checks if the device is any of the supported types (Android, BlackBerry, iOS, Opera Mini, Windows).
   * @returns {boolean} true if the device is any of the supported types, otherwise false.
   */
  static get isAny() {
    return (
      this.isAndroid ||
      this.isBlackBerry ||
      this.isAppleOS ||
      this.isOpera ||
      this.isWindows
    );
  }
}

export default MobileChecker;
