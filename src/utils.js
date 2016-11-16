/*
 Positioning Related Methods
 ---------------------------
 */

export function isSafari() {
    const userAgent = navigator.userAgent.toLowerCase();
    if ((userAgent.indexOf('safari') !== -1) && (userAgent.indexOf('chrome') === -1)) {
        return true;
    }
    return false;
}