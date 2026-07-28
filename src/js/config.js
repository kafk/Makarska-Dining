// ============================================================================
// Central configuration — single source of truth for keys, endpoints, version.
// Loaded FIRST (before firebase-data.js and the feature scripts) so these
// globals are available everywhere. Classic script: top-level `const` is shared
// across all scripts on the page.
// ============================================================================

// App version shown in the UI. Keep this in sync with the "version" field in
// package.json, which is the source of truth for native (iOS/Android) builds —
// Codemagic reads package.json and sets the store marketing version from it.
const APP_VERSION = '2.4.4';

// Firebase project configuration.
const firebaseConfig = {
    apiKey: "AIzaSyCFAWge9ldMBE_ToKDBwn6_T1G1ZrBeQgY",
    authDomain: "makarsk-dining.firebaseapp.com",
    projectId: "makarsk-dining",
    storageBucket: "makarsk-dining.firebasestorage.app",
    messagingSenderId: "573489897014",
    appId: "1:573489897014:web:25889f1f530a70badd8297",
    measurementId: "G-1S9NFBM9D3"
};

// Google Maps Geocoding API key (address → lat/lng lookups).
const GOOGLE_API_KEY = 'AIzaSyDlyFKGOFUYSdFChTse3dZvFnOWU2E94JM';

// Reflect the version in the document title so config.js is the single web-side
// source of truth for the displayed version.
document.addEventListener('DOMContentLoaded', function () {
    document.title = 'Makarska Dining v' + APP_VERSION;
    var vtag = document.getElementById('loginVersion');
    if (vtag) vtag.textContent = 'v' + APP_VERSION;
});
