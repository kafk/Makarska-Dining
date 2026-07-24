        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCFAWge9ldMBE_ToKDBwn6_T1G1ZrBeQgY",
            authDomain: "makarsk-dining.firebaseapp.com",
            projectId: "makarsk-dining",
            storageBucket: "makarsk-dining.firebasestorage.app",
            messagingSenderId: "573489897014",
            appId: "1:573489897014:web:25889f1f530a70badd8297",
            measurementId: "G-1S9NFBM9D3"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();
        const storage = firebase.storage();
        // Cap Storage retry times so a missing/misconfigured bucket can never hang a photo save.
        try { storage.setMaxUploadRetryTime(8000); storage.setMaxOperationRetryTime(8000); } catch (e) {}

        // Upload a base64 image to Firebase Storage and return the download URL
        async function uploadPhoto(base64DataUrl, storagePath) {
            try {
                // Convert base64 to Blob without fetch (works on iOS WebView)
                const parts = base64DataUrl.split(',');
                const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
                const raw = atob(parts[1]);
                const arr = new Uint8Array(raw.length);
                for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
                const blob = new Blob([arr], { type: mime });

                const ref = storage.ref(storagePath);
                // Race the upload against a hard timeout so photo saving never stalls if
                // Storage is unreachable or not enabled — we fall back to base64 instead.
                const doUpload = (async () => {
                    await ref.put(blob, { contentType: mime });
                    return await ref.getDownloadURL();
                })();
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Storage upload timed out')), 10000));
                return await Promise.race([doUpload, timeout]);
            } catch (err) {
                console.warn('Storage upload failed, saving photo locally instead:', err && err.message);
                return base64DataUrl; // fall back: save base64 (works offline / if Storage not enabled)
            }
        }

        function storagePhotoPath(restaurantId, type, name) {
            return `restaurants/${restaurantId}/${type}/${name}`;
        }

        // Current user state
        let currentUser = null;

        // ========== AUTHENTICATION FUNCTIONS ==========

        // Convert username to email format for Firebase Auth
        function usernameToEmail(username) {
            return username.toLowerCase().trim() + '@makarska-dining.app';
        }

        async function handleForgotPassword() {
            const username = document.getElementById('loginUsername').value.trim();
            if (!username) {
                alert('Enter your username first, then tap "Forgot password?"');
                return;
            }
            const email = usernameToEmail(username);
            try {
                await auth.sendPasswordResetEmail(email);
                alert('✅ Password reset email sent to the address linked to "' + username + '".\n\nCheck your inbox (and spam folder).');
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    alert('No account found for username "' + username + '".');
                } else {
                    alert('Could not send reset email: ' + error.message);
                }
            }
        }

        // Show login form
        function showLoginForm() {
            document.getElementById('loginFormContainer').style.display = 'block';
            document.getElementById('registerFormContainer').style.display = 'none';
            document.getElementById('loginError').textContent = '';
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        }

        // Show register form
        function showRegisterForm() {
            document.getElementById('loginFormContainer').style.display = 'none';
            document.getElementById('registerFormContainer').style.display = 'block';
            document.getElementById('registerError').textContent = '';
            document.getElementById('registerUsername').value = '';
            document.getElementById('registerPassword').value = '';
            document.getElementById('registerPasswordConfirm').value = '';
        }

        // Handle email/password login
        async function handleEmailLogin() {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');

            if (!username || !password) {
                errorDiv.textContent = 'Please enter username and password';
                return;
            }

            try {
                errorDiv.textContent = 'Signing in...';
                const email = usernameToEmail(username);
                await auth.signInWithEmailAndPassword(email, password);
                // Auth state listener will handle navigation
            } catch (error) {
                console.error('Login error:', error);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    errorDiv.textContent = 'Invalid username or password';
                } else if (error.code === 'auth/too-many-requests') {
                    errorDiv.textContent = 'Too many attempts. Try again later.';
                } else {
                    errorDiv.textContent = 'Login failed. Please try again.';
                }
            }
        }

        // Handle registration
        async function handleRegister() {
            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerPasswordConfirm').value;
            const errorDiv = document.getElementById('registerError');

            if (!username || !password || !confirmPassword) {
                errorDiv.textContent = 'Please fill in all fields';
                return;
            }

            if (username.length < 3) {
                errorDiv.textContent = 'Username must be at least 3 characters';
                return;
            }

            if (password.length < 6) {
                errorDiv.textContent = 'Password must be at least 6 characters';
                return;
            }

            if (password !== confirmPassword) {
                errorDiv.textContent = 'Passwords do not match';
                return;
            }

            try {
                errorDiv.textContent = 'Creating account...';
                const email = usernameToEmail(username);
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);

                // Update display name with username
                await userCredential.user.updateProfile({
                    displayName: username
                });

                // Save user profile to Firestore
                await db.collection('users').doc(userCredential.user.uid).set({
                    username: username,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Auth state listener will handle navigation
            } catch (error) {
                console.error('Registration error:', error);
                if (error.code === 'auth/email-already-in-use') {
                    errorDiv.textContent = 'Username already taken';
                } else if (error.code === 'auth/weak-password') {
                    errorDiv.textContent = 'Password is too weak';
                } else {
                    errorDiv.textContent = 'Registration failed. Please try again.';
                }
            }
        }

        // Handle logout
        async function handleLogout() {
            try {
                await auth.signOut();
                showLoginScreen();
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Auth state listener
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            if (user) {
                console.log('User logged in:', user.displayName || user.email);
                // User is signed in, proceed to app
                handleLogin();
            } else {
                console.log('User logged out');
                // User is signed out, show login screen
                showLoginScreen();
            }
        });

        // Firestore helper functions
        async function saveRestaurantsToFirestore(restaurantsData) {
            try {
                const batch = db.batch();

                // Save each restaurant as a document
                restaurantsData.forEach(restaurant => {
                    const docRef = db.collection('restaurants').doc(String(restaurant.id));
                    batch.set(docRef, restaurant);
                });

                await batch.commit();
                console.log('Restaurants saved to Firestore');
                return true;
            } catch (error) {
                console.error('Error saving to Firestore:', error);
                return false;
            }
        }

        async function loadRestaurantsFromFirestore() {
            try {
                const snapshot = await db.collection('restaurants').get();
                if (snapshot.empty) {
                    console.log('No restaurants in Firestore');
                    return null;
                }
                const data = [];
                snapshot.forEach(doc => { data.push(doc.data()); });
                console.log('Loaded', data.length, 'restaurants from Firestore');
                return data;
            } catch (error) {
                console.error('Error loading from Firestore:', error);
                return null;
            }
        }

        async function saveRestaurantToFirestore(restaurant) {
            try {
                await db.collection('restaurants').doc(String(restaurant.id)).set(restaurant);
                console.log('☁️ Saved to Firestore:', restaurant.name);
                return true;
            } catch (error) {
                console.error('❌ Error saving', restaurant.name, 'to Firestore:', error.message);
                return false;
            }
        }

        async function deleteRestaurantFromFirestore(restaurantId) {
            try {
                await db.collection('restaurants').doc(String(restaurantId)).delete();
                console.log('Restaurant deleted from Firestore');
                return true;
            } catch (error) {
                console.error('Error deleting from Firestore:', error);
                return false;
            }
        }

        // ========== GROUPS FIRESTORE FUNCTIONS ==========

        async function saveGroupsToFirestore(groupsData) {
            try {
                // Save all groups as a single document (simpler for user-specific data)
                await db.collection('userdata').doc('groups').set({ groups: groupsData });
                console.log('☁️ Groups saved to Firestore:', groupsData.length, 'groups');
                return true;
            } catch (error) {
                console.error('❌ Error saving groups to Firestore:', error);
                return false;
            }
        }

        async function loadGroupsFromFirestore() {
            try {
                const doc = await db.collection('userdata').doc('groups').get();
                if (doc.exists && doc.data().groups) {
                    console.log('☁️ Loaded groups from Firestore:', doc.data().groups.length);
                    return doc.data().groups;
                }
                return null;
            } catch (error) {
                console.error('Error loading groups from Firestore:', error);
                return null;
            }
        }

        async function initGroupsFirestoreSync() {
            try {
                const firestoreGroups = await loadGroupsFromFirestore();

                if (firestoreGroups && firestoreGroups.length > 0) {
                    // Use Firestore data
                    userGroups = firestoreGroups;
                    localStorage.setItem('userGroups', JSON.stringify(userGroups));
                    console.log('✅ Groups synced from Firestore');
                } else {
                    // Upload local groups to Firestore
                    const localGroups = JSON.parse(localStorage.getItem('userGroups')) || [];
                    if (localGroups.length > 0) {
                        await saveGroupsToFirestore(localGroups);
                        console.log('✅ Local groups uploaded to Firestore');
                    }
                }
            } catch (error) {
                console.error('Groups Firestore sync failed:', error);
            }
        }

        // ========== END GROUPS FIRESTORE ==========

        // Sync status indicator
        let firestoreConnected = false;

        async function initFirestoreSync() {
            try {
                console.log('Starting Firestore sync...');

                // Try to load from Firestore first
                const firestoreData = await loadRestaurantsFromFirestore();

                if (firestoreData && firestoreData.length > 0) {
                    // Use Firestore data
                    restaurants = firestoreData;
                    localStorage.setItem('restaurants', JSON.stringify(restaurants));
                    firestoreConnected = true;
                    console.log('✅ Synced from Firestore:', firestoreData.length, 'restaurants');
                } else {
                    // Upload local data to Firestore if Firestore is empty
                    const localData = JSON.parse(localStorage.getItem('restaurants'));
                    if (localData && localData.length > 0) {
                        console.log('Firestore empty, uploading', localData.length, 'restaurants...');

                        // Upload each restaurant individually (in case some are too large)
                        let uploaded = 0;
                        let failed = 0;
                        for (const restaurant of localData) {
                            try {
                                await db.collection('restaurants').doc(String(restaurant.id)).set(restaurant);
                                uploaded++;
                            } catch (err) {
                                console.warn('Failed to upload', restaurant.name, ':', err.message);
                                failed++;
                            }
                        }

                        firestoreConnected = true;
                        console.log('✅ Uploaded to Firestore:', uploaded, 'success,', failed, 'failed');

                        if (failed > 0) {
                            console.warn('Some restaurants failed - they may have photos that are too large (>1MB limit)');
                        }
                    } else {
                        console.log('No local data to upload');
                        firestoreConnected = true;
                    }
                }

                // Also sync groups
                await initGroupsFirestoreSync();

                updateSyncStatus(true);
            } catch (error) {
                console.error('❌ Firestore sync failed:', error);
                updateSyncStatus(false);
            }
        }

        function updateSyncStatus(connected) {
            const statusEl = document.getElementById('syncStatus');
            if (statusEl) {
                statusEl.innerHTML = connected
                    ? '<span style="color: #27ae60;">☁️ Synced</span>'
                    : '<span style="color: #e74c3c;">⚠️ Offline</span>';
            }
        }

        // Save a single restaurant to both localStorage and Firestore
        async function saveRestaurant(restaurant) {
            localStorage.setItem('restaurants', JSON.stringify(restaurants));

            if (firestoreConnected) {
                await saveRestaurantToFirestore(restaurant);
            }
        }

        // Delete a restaurant from both localStorage and Firestore
        async function deleteRestaurant(restaurantId) {
            if (firestoreConnected) {
                await deleteRestaurantFromFirestore(restaurantId);
            }
        }
