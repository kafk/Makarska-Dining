        function openAddModal() {
            document.getElementById('addChoiceModal').style.display = 'block';
        }

        function closeAddChoiceModal() {
            document.getElementById('addChoiceModal').style.display = 'none';
        }

        let _editingRestaurantId = null;

        function openAddRestaurantModal() {
            _editingRestaurantId = null;
            closeAddChoiceModal();
            document.getElementById('addRestaurantModal').style.display = 'block';
            document.getElementById('addRestaurantModal').querySelector('h2').textContent = 'Add Location';
            document.getElementById('restaurantForm').reset();
            selectedLocation = null;

            const catSelect = document.getElementById('restaurantCategory');
            catSelect.innerHTML = '<option value="">Choose category...</option>';
            getAllCategories().forEach(cat => {
                catSelect.innerHTML += `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`;
            });

            resetRestaurantPhotoForm();
            resetLocationPicker();
        }

        function openEditRestaurantModal(id) {
            const r = restaurants.find(x => x.id === id);
            if (!r) return;
            _editingRestaurantId = id;

            // Close restaurant detail, open form
            document.getElementById('viewModal').classList.remove('open');
            document.getElementById('addRestaurantModal').style.display = 'block';
            document.getElementById('addRestaurantModal').querySelector('h2').textContent = 'Edit Location';
            document.getElementById('restaurantForm').reset();

            // Populate & pre-select category
            const catSelect = document.getElementById('restaurantCategory');
            catSelect.innerHTML = '<option value="">Choose category...</option>';
            getAllCategories().forEach(cat => {
                catSelect.innerHTML += `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`;
            });

            // Pre-fill fields
            document.getElementById('name').value = r.name || '';
            catSelect.value = r.category || r.mainCategory || '';
            document.getElementById('cuisine').value = r.cuisine || 'Croatian';
            document.getElementById('price').value = r.price || 1;
            document.getElementById('lat').value = r.lat;
            document.getElementById('lng').value = r.lng;
            document.getElementById('location').value = r.address || `${r.lat}, ${r.lng}`;
            if (r.address || r.lat) {
                document.querySelector('.location-picker-btn').classList.add('has-location');
                document.getElementById('locationText').textContent = r.address || `${r.lat?.toFixed(4)}, ${r.lng?.toFixed(4)}`;
            }
            selectedLocation = { lat: r.lat, lng: r.lng };

            // Show existing cover photo
            if (r.coverPhoto) {
                document.getElementById('restaurantPhotoPreview').innerHTML = `<img src="${r.coverPhoto}" alt="preview">`;
                document.getElementById('restaurantPhotoData').value = r.coverPhoto;
                document.getElementById('removeRestaurantPhotoBtn').style.display = 'flex';
            } else {
                resetRestaurantPhotoForm();
            }
        }

        function closeAddRestaurantModal() {
            document.getElementById('addRestaurantModal').style.display = 'none';
            resetRestaurantPhotoForm();
            resetLocationPicker();
        }

        // Location Picker functions
        let locationPickerMap = null;
        let locationPickerMarker = null;
        let pickedLocation = null;

        function openLocationPicker() {
            const modal = document.getElementById('locationPickerModal');
            modal.classList.add('open');
            
            // Initialize map if not already done
            setTimeout(() => {
                if (!locationPickerMap) {
                    locationPickerMap = L.map('locationPickerMap').setView([43.2965, 17.0175], 14);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap'
                    }).addTo(locationPickerMap);
                    
                    // Add click handler to map
                    locationPickerMap.on('click', function(e) {
                        placeLocationMarker(e.latlng.lat, e.latlng.lng);
                    });
                } else {
                    locationPickerMap.invalidateSize();
                }
                
                // If we already have a picked location, show it
                if (pickedLocation) {
                    placeLocationMarker(pickedLocation.lat, pickedLocation.lng);
                    locationPickerMap.setView([pickedLocation.lat, pickedLocation.lng], 16);
                }
            }, 100);
        }

        function closeLocationPicker() {
            const modal = document.getElementById('locationPickerModal');
            modal.classList.remove('open');
        }

        function placeLocationMarker(lat, lng) {
            // Remove existing marker
            if (locationPickerMarker) {
                locationPickerMap.removeLayer(locationPickerMarker);
            }
            
            // Create custom pin icon
            const pinIcon = L.divIcon({
                html: '<div style="font-size: 40px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>',
                className: 'custom-pin-icon',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            
            // Add new marker
            locationPickerMarker = L.marker([lat, lng], { 
                icon: pinIcon,
                draggable: true 
            }).addTo(locationPickerMap);
            
            // Update on drag
            locationPickerMarker.on('dragend', function(e) {
                const pos = e.target.getLatLng();
                pickedLocation = { lat: pos.lat, lng: pos.lng };
                reverseGeocode(pos.lat, pos.lng);
            });
            
            pickedLocation = { lat, lng };
            
            // Enable confirm button
            document.getElementById('confirmLocationBtn').disabled = false;
            
            // Get address for this location
            reverseGeocode(lat, lng);
        }

        function reverseGeocode(lat, lng) {
            // Show coordinates as fallback immediately
            const coordsText = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            document.getElementById('locationSearchInput').value = coordsText;
            
            // Try to get address using Nominatim (may fail due to CORS)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                if (data && data.display_name) {
                    // Shorten the address
                    const parts = data.display_name.split(',');
                    const shortAddress = parts.slice(0, 3).join(',').trim();
                    document.getElementById('locationSearchInput').value = shortAddress;
                }
            })
            .catch(() => {
                // Silently fail - coordinates are already shown as fallback
            });
        }

        function confirmLocation() {
            if (!pickedLocation) return;
            
            // Update the form fields
            document.getElementById('lat').value = pickedLocation.lat;
            document.getElementById('lng').value = pickedLocation.lng;
            document.getElementById('location').value = document.getElementById('locationSearchInput').value || `${pickedLocation.lat.toFixed(4)}, ${pickedLocation.lng.toFixed(4)}`;
            
            // Update the button text
            const locationBtn = document.querySelector('.location-picker-btn');
            const locationText = document.getElementById('locationText');
            locationText.textContent = document.getElementById('locationSearchInput').value || 'Location selected ✓';
            locationBtn.classList.add('has-location');
            
            // Also update selectedLocation for compatibility
            selectedLocation = pickedLocation;
            
            closeLocationPicker();
        }

        function resetLocationPicker() {
            pickedLocation = null;
            if (locationPickerMarker && locationPickerMap) {
                locationPickerMap.removeLayer(locationPickerMarker);
                locationPickerMarker = null;
            }
            
            const locationBtn = document.querySelector('.location-picker-btn');
            const locationText = document.getElementById('locationText');
            if (locationBtn) locationBtn.classList.remove('has-location');
            if (locationText) locationText.textContent = 'Tap to select location on map';
            
            const searchInput = document.getElementById('locationSearchInput');
            if (searchInput) searchInput.value = '';
            
            const confirmBtn = document.getElementById('confirmLocationBtn');
            if (confirmBtn) confirmBtn.disabled = true;
        }

        // Location search functionality
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('locationSearchInput');
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', function(e) {
                    clearTimeout(searchTimeout);
                    const query = e.target.value.trim();
                    
                    if (query.length < 3) return;
                    
                    searchTimeout = setTimeout(() => {
                        // Search using Nominatim
                        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Makarska Croatia')}&limit=1`, {
                            headers: {
                                'Accept': 'application/json'
                            }
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('Network error');
                            return response.json();
                        })
                        .then(data => {
                            if (data && data.length > 0) {
                                const result = data[0];
                                const lat = parseFloat(result.lat);
                                const lng = parseFloat(result.lon);
                                
                                locationPickerMap.setView([lat, lng], 17);
                                placeLocationMarker(lat, lng);
                            }
                        })
                        .catch(() => {
                            // Silently fail - user can still tap on map
                        });
                    }, 500);
                });
            }
        });

        // Detect if running in Capacitor native app
        function isNativeApp() {
            return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
        }

        // Take photo using Capacitor Camera plugin (native) or file input (browser)
        async function takeNativePhoto(onBase64) {
            try {
                const { Camera } = window.Capacitor.Plugins;
                const image = await Camera.getPhoto({
                    quality: 80,
                    allowEditing: false,
                    resultType: 'base64',
                    source: 'CAMERA'
                });
                // Compress before saving so the photo fits Firestore's 1MB doc limit when
                // Storage isn't available (base64 fallback) and uploads faster when it is.
                compressImage('data:image/jpeg;base64,' + image.base64String, 800, 0.8, onBase64);
            } catch (err) {
                if (err && err.message !== 'User cancelled photos app') {
                    alert('Could not open camera: ' + (err.message || err));
                }
            }
        }

        async function pickNativePhoto(onBase64) {
            try {
                const { Camera } = window.Capacitor.Plugins;
                const image = await Camera.getPhoto({
                    quality: 80,
                    allowEditing: false,
                    resultType: 'base64',
                    source: 'PHOTOS'
                });
                // Compress before saving so the photo fits Firestore's 1MB doc limit when
                // Storage isn't available (base64 fallback) and uploads faster when it is.
                compressImage('data:image/jpeg;base64,' + image.base64String, 800, 0.8, onBase64);
            } catch (err) {
                if (err && err.message !== 'User cancelled photos app') {
                    alert('Could not open photos: ' + (err.message || err));
                }
            }
        }

        // Restaurant photo functions
        function triggerRestaurantCamera() {
            if (isNativeApp()) {
                takeNativePhoto(base64 => setRestaurantPhotoFromBase64(base64));
            } else {
                document.getElementById('restaurantCameraInput').click();
            }
        }

        function triggerRestaurantGallery() {
            if (isNativeApp()) {
                pickNativePhoto(base64 => setRestaurantPhotoFromBase64(base64));
            } else {
                document.getElementById('restaurantGalleryInput').click();
            }
        }

        function setRestaurantPhotoFromBase64(base64) {
            compressImage(base64, 800, 0.8, function(compressed) {
                showRestaurantPhotoPreview(compressed);
            });
        }

        function handleRestaurantPhotoSelect(event) {
            try {
                const file = event.target.files && event.target.files[0];
                if (!file) {
                    event.target.value = '';
                    return;
                }

                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Photo is too large. Please select an image under 5MB.');
                    event.target.value = '';
                    return;
                }

                // Check file type
                if (!file.type || !file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    event.target.value = '';
                    return;
                }

                const reader = new FileReader();
                
                reader.onerror = function() {
                    alert('Error reading photo. Please try again.');
                    event.target.value = '';
                };
                
                reader.onload = function(e) {
                    try {
                        // Compress and show preview
                        compressImage(e.target.result, 800, 0.8, function(compressedImage) {
                            showRestaurantPhotoPreview(compressedImage);
                        });
                    } catch (err) {
                        alert('Error processing photo. Please try again.');
                    }
                };
                reader.readAsDataURL(file);
                
                // Reset the input
                event.target.value = '';
            } catch (err) {
                alert('Error with photo. Please try again.');
                if (event.target) event.target.value = '';
            }
        }

        function showRestaurantPhotoPreview(imageData) {
            const previewContainer = document.getElementById('restaurantPhotoPreview');
            const photoDataInput = document.getElementById('restaurantPhotoData');
            const removeBtn = document.getElementById('removeRestaurantPhotoBtn');

            previewContainer.innerHTML = `<img src="${imageData}" alt="Restaurant photo preview">`;
            photoDataInput.value = imageData;
            removeBtn.style.display = 'flex';
        }

        function removeRestaurantPhoto() {
            const previewContainer = document.getElementById('restaurantPhotoPreview');
            const photoDataInput = document.getElementById('restaurantPhotoData');
            const removeBtn = document.getElementById('removeRestaurantPhotoBtn');

            previewContainer.innerHTML = `
                <div class="food-photo-empty">
                    <span>🏪</span>
                    <span>No photo added</span>
                </div>
            `;
            photoDataInput.value = '';
            removeBtn.style.display = 'none';
        }

        function resetRestaurantPhotoForm() {
            removeRestaurantPhoto();
            const cameraInput = document.getElementById('restaurantCameraInput');
            const galleryInput = document.getElementById('restaurantGalleryInput');
            if (cameraInput) cameraInput.value = '';
            if (galleryInput) galleryInput.value = '';
        }

        function openAddFoodModal(preselectedRestaurantId) {
            closeAddChoiceModal();
            // Close restaurant detail if open (it sits above the food modal)
            const viewModal = document.getElementById('viewModal');
            if (viewModal) viewModal.classList.remove('open');
            document.getElementById('addFoodModal').style.display = 'block';
            document.getElementById('foodForm').reset();
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            document.getElementById('visitDate').valueAsDate = new Date();
            
            // Reset photo section
            resetFoodPhotoForm();
            
            // Populate restaurant dropdown
            const select = document.getElementById('foodRestaurant');
            select.innerHTML = '<option value="">Choose a restaurant...</option>';
            restaurants.forEach(r => {
                select.innerHTML += `<option value="${r.id}">${r.name}</option>`;
            });

            // Pre-select restaurant if coming from restaurant detail
            const preId = preselectedRestaurantId || currentRestaurantId;
            if (preId) select.value = preId;
            
            // Populate category dropdown
            const catSelect = document.getElementById('foodCategory');
            catSelect.innerHTML = '<option value="">Choose category...</option>';
            const categories = getAllCategories();
            categories.forEach(cat => {
                catSelect.innerHTML += `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`;
            });
            
            // Hide subcategory initially
            document.getElementById('foodSubcategoryGroup').style.display = 'none';
        }
        
        function populateFoodSubcategories() {
            const category = document.getElementById('foodCategory').value;
            const subGroup = document.getElementById('foodSubcategoryGroup');
            const subSelect = document.getElementById('foodSubcategory');

            const allSubs = [...(JSON.parse(localStorage.getItem('customSubcategories')) || [])];
            const filtered = allSubs.filter(s => s.parentId === category || s.categoryId === category);

            if (filtered.length === 0) {
                subGroup.style.display = 'none';
                return;
            }

            subGroup.style.display = 'block';
            subSelect.innerHTML = '<option value="">Choose type...</option>';

            // Group by group field
            const groups = {};
            filtered.forEach(s => {
                const g = s.group || '';
                if (!groups[g]) groups[g] = [];
                groups[g].push(s);
            });

            Object.entries(groups).forEach(([groupName, subs]) => {
                if (groupName) {
                    const optGroup = document.createElement('optgroup');
                    optGroup.label = groupName;
                    subs.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s.id;
                        opt.textContent = (s.emoji || '') + ' ' + (s.name || s.label);
                        optGroup.appendChild(opt);
                    });
                    subSelect.appendChild(optGroup);
                } else {
                    subs.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s.id;
                        opt.textContent = (s.emoji || '') + ' ' + (s.name || s.label);
                        subSelect.appendChild(opt);
                    });
                }
            });
        }

        function closeAddFoodModal() {
            document.getElementById('addFoodModal').style.display = 'none';
            const wt = document.getElementById('dishWaitTime');
            if (wt) wt.value = '';
            resetFoodPhotoForm();
        }

        function closeAddModal() {
            closeAddChoiceModal();
            closeAddRestaurantModal();
            closeAddFoodModal();
        }

        function closeViewModal() {
            document.getElementById('viewModal').classList.remove('open');
        }

        // Update address for a restaurant
