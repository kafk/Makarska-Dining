// ============================================================================
// Native platform wrapper — thin layer around Capacitor plugins (Camera).
// Keeps all native plugin calls in ONE place so they're easy to find and mock,
// and so build/signing quirks (iOS enums-as-strings, etc.) live in a single spot.
// See repo memory: Capacitor Camera enums must be passed as plain strings.
// ============================================================================

// Detect if running inside the Capacitor native app (vs. a browser).
function isNativeApp() {
    return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
}

// Take a photo with the device camera. Compresses before invoking the callback
// so the result fits Firestore's 1MB doc limit (base64 fallback) and uploads
// faster to Storage.
async function takeNativePhoto(onBase64) {
    try {
        const { Camera } = window.Capacitor.Plugins;
        const image = await Camera.getPhoto({
            quality: 80,
            allowEditing: false,
            resultType: 'base64',
            source: 'CAMERA'
        });
        compressImage('data:image/jpeg;base64,' + image.base64String, 800, 0.8, onBase64);
    } catch (err) {
        if (err && err.message !== 'User cancelled photos app') {
            alert('Could not open camera: ' + (err.message || err));
        }
    }
}

// Pick an existing photo from the device library.
async function pickNativePhoto(onBase64) {
    try {
        const { Camera } = window.Capacitor.Plugins;
        const image = await Camera.getPhoto({
            quality: 80,
            allowEditing: false,
            resultType: 'base64',
            source: 'PHOTOS'
        });
        compressImage('data:image/jpeg;base64,' + image.base64String, 800, 0.8, onBase64);
    } catch (err) {
        if (err && err.message !== 'User cancelled photos app') {
            alert('Could not open photos: ' + (err.message || err));
        }
    }
}
