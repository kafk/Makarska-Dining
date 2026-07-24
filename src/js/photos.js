        function saveRestaurants() {
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            // Sync all to Firestore
            if (typeof saveRestaurantsToFirestore === 'function') {
                saveRestaurantsToFirestore(restaurants);
            }
        }

        async function saveRestaurant(e) {
            if (e) e.preventDefault();

            const nameValue = document.getElementById('name').value;
            const cuisineValue = document.getElementById('cuisine').value;
            const priceValue = document.getElementById('price').value;
            const categoryValue = document.getElementById('restaurantCategory').value;

            if (!nameValue || !nameValue.trim()) { alert('Please enter a restaurant name'); return; }
            if (!categoryValue) { alert('Please choose a place category'); return; }

            try {
                const rawPhotoData = document.getElementById('restaurantPhotoData').value;

                if (_editingRestaurantId) {
                    const r = restaurants.find(x => x.id === _editingRestaurantId);
                    if (!r) return;
                    r.name = nameValue.trim();
                    r.cuisine = cuisineValue;
                    r.price = parseInt(priceValue);
                    r.category = categoryValue;
                    r.mainCategory = categoryValue;
                    r.lat = parseFloat(document.getElementById('lat').value) || r.lat;
                    r.lng = parseFloat(document.getElementById('lng').value) || r.lng;
                    if (rawPhotoData) {
                        r.coverPhoto = rawPhotoData.startsWith('data:')
                            ? await uploadPhoto(rawPhotoData, storagePhotoPath(r.id, 'cover', 'cover.jpg'))
                            : rawPhotoData;
                    }
                    localStorage.setItem('restaurants', JSON.stringify(restaurants));
                    saveRestaurantToFirestore(r);
                    loadMarkers();
                    populateSidebar();
                    closeAddRestaurantModal();
                    viewRestaurantWithDishes(_editingRestaurantId);
                    _editingRestaurantId = null;
                    return;
                }

                // CREATE new restaurant
                const newId = Date.now();
                const coverUrl = rawPhotoData && rawPhotoData.startsWith('data:')
                    ? await uploadPhoto(rawPhotoData, storagePhotoPath(newId, 'cover', 'cover.jpg'))
                    : rawPhotoData || null;

                const restaurant = {
                    id: newId,
                    name: nameValue.trim(),
                    cuisine: cuisineValue,
                    price: parseInt(priceValue),
                    category: categoryValue,
                    mainCategory: categoryValue,
                    lat: parseFloat(document.getElementById('lat').value) || 43.2964,
                    lng: parseFloat(document.getElementById('lng').value) || 17.0175,
                    foodRating: 0,
                    serviceRating: 0,
                    visitDate: new Date().toISOString().split('T')[0],
                    notes: '',
                    foodItems: [],
                    photos: [],
                    coverPhoto: coverUrl
                };

                restaurants.push(restaurant);

                try {
                    localStorage.setItem('restaurants', JSON.stringify(restaurants));
                    // Sync to Firestore
                    saveRestaurantToFirestore(restaurant);
                } catch (storageError) {
                    alert('Storage is full! Try deleting some old restaurants or photos first.');
                    restaurants.pop();
                    return;
                }

                loadMarkers();
                populateSidebar();
                closeAddRestaurantModal();
                resetRestaurantPhotoForm();
                
            } catch (error) {
                alert('Error saving restaurant: ' + error.message);
            }
        }

        document.getElementById('restaurantForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveRestaurant(e);
        });

        async function saveFoodItem(e) {
            if (e) e.preventDefault();
            
            const restaurantId = parseInt(document.getElementById('foodRestaurant').value);
            const category = document.getElementById('foodCategory').value;
            const subcategory = document.getElementById('foodSubcategory').value;
            const dishName = document.getElementById('dishName').value.trim();
            const foodRating = parseInt(document.getElementById('foodRating').value) || 0;
            const visitDate = document.getElementById('visitDate').value;
            
            if (!restaurantId) { alert('Please select a restaurant'); return; }
            if (!category) { alert('Please select a category'); return; }
            if (!dishName) { alert('Please enter a dish name'); return; }
            if (!visitDate) { alert('Please select a visit date'); return; }
            
            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant) { alert('Restaurant not found'); return; }
            
            try {
                const rawPhoto = document.getElementById('foodPhotoData').value;
                const foodItemId = Date.now();
                const photoUrl = rawPhoto && rawPhoto.startsWith('data:')
                    ? await uploadPhoto(rawPhoto, storagePhotoPath(restaurantId, `food/${foodItemId}`, 'cover.jpg'))
                    : rawPhoto || null;
                
                const visitEntry = {
                    date: visitDate,
                    year: new Date(visitDate).getFullYear(),
                    cost: document.getElementById('dishPrice').value,
                    tasteRating: foodRating,
                    serviceRating: parseInt(document.getElementById('serviceRating').value) || 0,
                    waitTime: document.getElementById('dishWaitTime').value,
                    comment: document.getElementById('foodNotes').value,
                    photo: photoUrl
                };

                const foodItem = {
                    id: foodItemId,
                    name: dishName,
                    category: category,
                    subcategory: subcategory,
                    visits: [visitEntry],
                    price: visitEntry.cost,
                    foodRating: foodRating,
                    serviceRating: parseInt(document.getElementById('serviceRating').value) || 0,
                    visitDate: visitDate,
                    notes: visitEntry.comment,
                    photo: photoUrl
                };
                
                if (!restaurant.foodItems) restaurant.foodItems = [];
                restaurant.foodItems.push(foodItem);
                
                if (photoUrl) {
                    if (!restaurant.photos) restaurant.photos = [];
                    restaurant.photos.push({
                        url: photoUrl,
                        rating: foodItem.foodRating,
                        category: category,
                        subcategory: subcategory,
                        dishName: foodItem.name,
                        caption: foodItem.notes,
                        date: foodItem.visitDate
                    });
                }
                
                const allRatings = restaurant.foodItems.filter(f => f.foodRating > 0);
                if (allRatings.length > 0) {
                    restaurant.foodRating = Math.round(allRatings.reduce((sum, f) => sum + f.foodRating, 0) / allRatings.length);
                    restaurant.serviceRating = Math.round(allRatings.reduce((sum, f) => sum + f.serviceRating, 0) / allRatings.length);
                }
                restaurant.visitDate = foodItem.visitDate;
                
                localStorage.setItem('restaurants', JSON.stringify(restaurants));
                // Sync to Firestore
                saveRestaurantToFirestore(restaurant);
                
                loadMarkers();
                populateSidebar();
                closeAddFoodModal();

                // Re-open restaurant detail if we came from there
                if (currentRestaurantId === restaurantId) {
                    viewRestaurantWithDishes(restaurantId);
                }
                
            } catch (error) {
                alert('Error saving food item: ' + error.message);
            }
        }

        document.getElementById('foodForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveFoodItem(e);
        });

        // Food item photo functions
        function triggerFoodCamera() {
            if (isNativeApp()) {
                takeNativePhoto(base64 => setFoodPhotoFromBase64(base64));
            } else {
                document.getElementById('foodCameraInput').click();
            }
        }

        function triggerFoodGallery() {
            if (isNativeApp()) {
                pickNativePhoto(base64 => setFoodPhotoFromBase64(base64));
            } else {
                document.getElementById('foodGalleryInput').click();
            }
        }

        function setFoodPhotoFromBase64(base64) {
            compressImage(base64, 800, 0.8, function(compressed) {
                showFoodPhotoPreview(compressed);
            });
        }

        function handleFoodPhotoSelect(event) {
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
                            showFoodPhotoPreview(compressedImage);
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

        function showFoodPhotoPreview(imageData) {
            const previewContainer = document.getElementById('foodPhotoPreview');
            const photoDataInput = document.getElementById('foodPhotoData');
            const removeBtn = document.getElementById('removeFoodPhotoBtn');

            previewContainer.innerHTML = `<img src="${imageData}" alt="Food photo preview">`;
            photoDataInput.value = imageData;
            removeBtn.style.display = 'flex';
        }

        function removeFoodPhoto() {
            const previewContainer = document.getElementById('foodPhotoPreview');
            const photoDataInput = document.getElementById('foodPhotoData');
            const removeBtn = document.getElementById('removeFoodPhotoBtn');

            previewContainer.innerHTML = `
                <div class="food-photo-empty">
                    <span>📷</span>
                    <span>No photo added</span>
                </div>
            `;
            photoDataInput.value = '';
            removeBtn.style.display = 'none';
        }

        function resetFoodPhotoForm() {
            removeFoodPhoto();
            document.getElementById('foodCameraInput').value = '';
            document.getElementById('foodGalleryInput').value = '';
        }

        function viewRestaurant(id) {
            // Use the same view that includes dishes and photos
            viewRestaurantWithDishes(id);
        }

        function deleteRestaurant(id) {
            // Create custom confirm dialog
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
            
            const dialog = document.createElement('div');
            dialog.style.cssText = 'background:white;padding:24px;border-radius:16px;max-width:300px;text-align:center;';
            dialog.innerHTML = `
                <h3 style="margin-bottom:16px;color:#2d3436;">Delete Restaurant?</h3>
                <p style="margin-bottom:20px;color:#636e72;">This action cannot be undone.</p>
                <div style="display:flex;gap:12px;justify-content:center;">
                    <button id="cancelDeleteBtn" style="padding:10px 24px;border:2px solid #e9ecef;background:white;border-radius:8px;font-weight:600;cursor:pointer;">Cancel</button>
                    <button id="confirmDeleteBtn" style="padding:10px 24px;border:none;background:#ff6b6b;color:white;border-radius:8px;font-weight:600;cursor:pointer;">Delete</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            document.getElementById('cancelDeleteBtn').onclick = function() {
                document.body.removeChild(overlay);
            };
            
            document.getElementById('confirmDeleteBtn').onclick = async function() {
                try {
                    restaurants = restaurants.filter(r => r.id !== id);
                    localStorage.setItem('restaurants', JSON.stringify(restaurants));
                    // Delete from Firestore
                    deleteRestaurantFromFirestore(id);
                    document.body.removeChild(overlay);
                    closeViewModal();
                    loadMarkers();
                    populateSidebar();
                } catch (error) {
                    alert('Error deleting restaurant');
                    document.body.removeChild(overlay);
                }
            };
            
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            };
        }

        // Photo handling functions
        // Photo handling variables
        let pendingPhotoData = null;
        let pendingPhotoRestaurantId = null;
        let currentPhotoRating = 0;

        // Cover photo change functions
        function changeCoverPhotoCamera(restaurantId) {
            const input = document.getElementById(`coverPhotoCameraInput-${restaurantId}`);
            if (input) {
                input.click();
            }
        }

        function changeCoverPhotoGallery(restaurantId) {
            const input = document.getElementById(`coverPhotoGalleryInput-${restaurantId}`);
            if (input) {
                input.click();
            }
        }

        function handleCoverPhotoChange(event, restaurantId) {
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
                        // Compress and save
                        compressImage(e.target.result, 800, 0.8, async function(compressedImage) {
                            const restaurant = restaurants.find(r => r.id === restaurantId);
                            if (!restaurant) return;
                            const url = await uploadPhoto(compressedImage, storagePhotoPath(restaurantId, 'cover', 'cover.jpg'));
                            restaurant.coverPhoto = url;
                            localStorage.setItem('restaurants', JSON.stringify(restaurants));

                            // Refresh the view
                            viewRestaurantWithDishes(restaurantId);
                            
                            // Also update markers to show new photo in list
                            loadMarkers();
                            populateSidebar();
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

        function triggerCameraCapture(restaurantId) {
            const input = document.getElementById(`cameraCapture-${restaurantId}`);
            if (input) {
                input.click();
            }
        }

        function triggerGalleryUpload(restaurantId) {
            const input = document.getElementById(`galleryUpload-${restaurantId}`);
            if (input) {
                input.click();
            }
        }

        function handlePhotoCapture(event, restaurantId) {
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
                        // Show crop modal first before compression
                        showPhotoCropModal(e.target.result, restaurantId);
                    } catch (err) {
                        alert('Error processing photo. Please try again.');
                    }
                };
                reader.readAsDataURL(file);
                
                // Reset the input so the same file can be selected again
                event.target.value = '';
            } catch (err) {
                alert('Error capturing photo. Please try again.');
                if (event.target) event.target.value = '';
            }
        }

        // Photo crop modal state
        let cropImageScale = 1;
        let cropImageX = 0;
        let cropImageY = 0;
        let cropStartX = 0;
        let cropStartY = 0;
        let cropIsDragging = false;
        let cropOriginalImage = null;
        let cropRestaurantId = null;

        function showPhotoCropModal(imageUrl, restaurantId) {
            // Debug: confirm function is called
            console.log('showPhotoCropModal called', restaurantId);
            
            cropOriginalImage = imageUrl;
            cropRestaurantId = restaurantId;
            cropImageScale = 1;
            cropImageX = 0;
            cropImageY = 0;

            // Create modal if it doesn't exist
            let modal = document.getElementById('photoCropModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'photoCropModal';
                modal.className = 'photo-crop-modal';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="photo-crop-header">
                    <span class="photo-crop-title">Adjust Photo</span>
                    <button class="photo-crop-close" onclick="closePhotoCropModal()">×</button>
                </div>
                
                <div class="photo-crop-container" id="cropContainer"
                     ontouchstart="handleCropTouchStart(event)"
                     ontouchmove="handleCropTouchMove(event)"
                     ontouchend="handleCropTouchEnd(event)"
                     onmousedown="handleCropMouseDown(event)"
                     onmousemove="handleCropMouseMove(event)"
                     onmouseup="handleCropMouseUp(event)"
                     onmouseleave="handleCropMouseUp(event)">
                    <img class="photo-crop-image" id="cropImage" src="${imageUrl}" alt="Crop preview" draggable="false">
                    <div class="photo-crop-frame">
                        <div class="photo-crop-grid-v1"></div>
                        <div class="photo-crop-grid-v2"></div>
                    </div>
                </div>
                
                <div class="photo-crop-hint">Drag to position • Pinch or use buttons to zoom</div>
                
                <div class="photo-crop-controls">
                    <div class="photo-crop-zoom">
                        <button class="photo-crop-zoom-btn" onclick="cropZoom(-0.2)">−</button>
                        <span class="photo-crop-zoom-label" id="cropZoomLabel">100%</span>
                        <button class="photo-crop-zoom-btn" onclick="cropZoom(0.2)">+</button>
                    </div>
                </div>
                
                <div class="photo-crop-footer">
                    <button class="photo-crop-btn cancel" onclick="closePhotoCropModal()">Cancel</button>
                    <button class="photo-crop-btn confirm" onclick="confirmPhotoCrop()">Use Photo</button>
                </div>
            `;

            modal.classList.add('open');
            
            // Initialize transform
            setTimeout(updateCropTransform, 50);
        }

        // Touch handlers
        let lastTouchDist = 0;
        let pinchStartScale = 1;

        function handleCropTouchStart(e) {
            e.preventDefault();
            if (e.touches.length === 1) {
                cropIsDragging = true;
                cropStartX = e.touches[0].clientX - cropImageX;
                cropStartY = e.touches[0].clientY - cropImageY;
            } else if (e.touches.length === 2) {
                cropIsDragging = false;
                lastTouchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                pinchStartScale = cropImageScale;
            }
        }

        function handleCropTouchMove(e) {
            e.preventDefault();
            if (e.touches.length === 1 && cropIsDragging) {
                cropImageX = e.touches[0].clientX - cropStartX;
                cropImageY = e.touches[0].clientY - cropStartY;
                updateCropTransform();
            } else if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                cropImageScale = Math.max(0.5, Math.min(3, pinchStartScale * (dist / lastTouchDist)));
                document.getElementById('cropZoomLabel').textContent = Math.round(cropImageScale * 100) + '%';
                updateCropTransform();
            }
        }

        function handleCropTouchEnd(e) {
            cropIsDragging = false;
        }

        // Mouse handlers
        function handleCropMouseDown(e) {
            e.preventDefault();
            cropIsDragging = true;
            cropStartX = e.clientX - cropImageX;
            cropStartY = e.clientY - cropImageY;
        }

        function handleCropMouseMove(e) {
            if (!cropIsDragging) return;
            e.preventDefault();
            cropImageX = e.clientX - cropStartX;
            cropImageY = e.clientY - cropStartY;
            updateCropTransform();
        }

        function handleCropMouseUp(e) {
            cropIsDragging = false;
        }

        function setupCropEvents() {
            // Now using inline handlers
        }

        function cropZoom(delta) {
            cropImageScale = Math.max(0.5, Math.min(3, cropImageScale + delta));
            document.getElementById('cropZoomLabel').textContent = Math.round(cropImageScale * 100) + '%';
            updateCropTransform();
        }

        function updateCropTransform() {
            const img = document.getElementById('cropImage');
            if (img) {
                img.style.transform = `translate(${cropImageX}px, ${cropImageY}px) scale(${cropImageScale})`;
            }
        }

        function closePhotoCropModal() {
            const modal = document.getElementById('photoCropModal');
            if (modal) {
                modal.classList.remove('open');
            }
            cropOriginalImage = null;
            cropRestaurantId = null;
        }

        function confirmPhotoCrop() {
            // Create cropped image from canvas
            const img = document.getElementById('cropImage');
            const frame = document.querySelector('.photo-crop-frame');
            const container = document.getElementById('cropContainer');
            
            if (!img || !frame || !container) {
                closePhotoCropModal();
                return;
            }

            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Get frame dimensions and position
                const frameRect = frame.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();
                
                // Calculate what part of the image is in the frame
                const scaleX = img.naturalWidth / imgRect.width;
                const scaleY = img.naturalHeight / imgRect.height;
                
                const cropX = (frameRect.left - imgRect.left) * scaleX;
                const cropY = (frameRect.top - imgRect.top) * scaleY;
                const cropWidth = frameRect.width * scaleX;
                const cropHeight = frameRect.height * scaleY;
                
                // Set canvas size (square output)
                canvas.width = 800;
                canvas.height = 800;
                
                // Draw cropped portion
                ctx.drawImage(
                    img,
                    Math.max(0, cropX),
                    Math.max(0, cropY),
                    cropWidth,
                    cropHeight,
                    0,
                    0,
                    800,
                    800
                );
                
                const croppedImage = canvas.toDataURL('image/jpeg', 0.85);
                
                // Close crop modal and show rating modal
                closePhotoCropModal();
                
                pendingPhotoData = croppedImage;
                pendingPhotoRestaurantId = cropRestaurantId;
                currentPhotoRating = 0;
                showPhotoRatingModal(croppedImage);
                
            } catch (err) {
                // If cropping fails, use original image
                closePhotoCropModal();
                compressImage(cropOriginalImage, 800, 0.8, function(compressedImage) {
                    pendingPhotoData = compressedImage;
                    pendingPhotoRestaurantId = cropRestaurantId;
                    currentPhotoRating = 0;
                    showPhotoRatingModal(compressedImage);
                });
            }
        }

        function showPhotoRatingModal(imageUrl) {
            // Create modal if it doesn't exist
            let modal = document.getElementById('photoRateModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'photoRateModal';
                modal.className = 'photo-rate-modal';
                document.body.appendChild(modal);
            }
            
            // Build category options
            const categories = getAllCategories();
            const categoryOptions = categories.map(cat => 
                `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`
            ).join('');
            
            modal.innerHTML = `
                <div class="photo-rate-content">
                    <img class="photo-rate-preview" id="photoRatePreview" src="${imageUrl}" alt="Preview">
                    <div class="photo-rate-body">
                        <h3 class="photo-rate-title">Rate this item</h3>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">What is this? 📂</label>
                            <select class="photo-rate-input" id="photoCategory" onchange="updatePhotoSubcategories()">
                                <option value="">Select category...</option>
                                ${categoryOptions}
                            </select>
                        </div>
                        
                        <div class="photo-rate-field" id="photoSubcategoryField" style="display: none;">
                            <label class="photo-rate-label">Type 📁</label>
                            <select class="photo-rate-input" id="photoSubcategory">
                                <option value="">Select type...</option>
                            </select>
                        </div>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">How was it? ⭐</label>
                            <div class="photo-rate-stars" id="photoRateStars">
                                <span class="photo-rate-star" data-rating="1" onclick="setPhotoRating(1)">☆</span>
                                <span class="photo-rate-star" data-rating="2" onclick="setPhotoRating(2)">☆</span>
                                <span class="photo-rate-star" data-rating="3" onclick="setPhotoRating(3)">☆</span>
                                <span class="photo-rate-star" data-rating="4" onclick="setPhotoRating(4)">☆</span>
                                <span class="photo-rate-star" data-rating="5" onclick="setPhotoRating(5)">☆</span>
                            </div>
                        </div>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">Name</label>
                            <input type="text" class="photo-rate-input" id="photoDishName" placeholder="e.g. Grilled Sea Bass, Mojito...">
                        </div>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">Price (optional)</label>
                            <input type="text" class="photo-rate-input" id="photoPrice" placeholder="e.g. €15">
                        </div>
                        
                        <div class="photo-rate-field">
                            <label class="photo-rate-label">Notes (optional)</label>
                            <input type="text" class="photo-rate-input" id="photoCaption" placeholder="e.g. Best fish I've ever had!">
                        </div>
                        
                        <div class="photo-rate-buttons">
                            <button class="photo-rate-btn cancel" onclick="closePhotoRatingModal()">Cancel</button>
                            <button class="photo-rate-btn save" onclick="savePhotoWithRating()">Save</button>
                        </div>
                    </div>
                </div>
            `;

            currentPhotoRating = 0;
            modal.classList.add('open');
        }
        
        function updatePhotoSubcategories() {
            const categoryId = document.getElementById('photoCategory').value;
            const subcategoryField = document.getElementById('photoSubcategoryField');
            const subcategorySelect = document.getElementById('photoSubcategory');
            
            if (!categoryId) {
                subcategoryField.style.display = 'none';
                return;
            }
            
            // Get subcategories for this category
            const subs = filterSubcategories[categoryId] || [];
            const customSubs = customSubcategories.filter(s => s.categoryId === categoryId);
            const allSubs = [...subs.filter(s => s.id !== 'all'), ...customSubs];
            
            if (allSubs.length === 0) {
                subcategoryField.style.display = 'none';
                return;
            }
            
            subcategorySelect.innerHTML = '<option value="">Select type...</option>' +
                allSubs.map(sub => `<option value="${sub.id}">${sub.label}</option>`).join('');
            subcategoryField.style.display = 'block';
        }

        function setPhotoRating(rating) {
            currentPhotoRating = rating;
            updateStarDisplay();
        }

        function updateStarDisplay() {
            const stars = document.querySelectorAll('#photoRateStars .photo-rate-star');
            stars.forEach((star, index) => {
                if (index < currentPhotoRating) {
                    star.textContent = '★';
                    star.classList.add('active');
                } else {
                    star.textContent = '☆';
                    star.classList.remove('active');
                }
            });
        }

        function closePhotoRatingModal() {
            const modal = document.getElementById('photoRateModal');
            if (modal) {
                modal.classList.remove('open');
            }
            pendingPhotoData = null;
            pendingPhotoRestaurantId = null;
            currentPhotoRating = 0;
        }

        async function savePhotoWithRating() {
            const categoryId = document.getElementById('photoCategory').value;
            const dishName = document.getElementById('photoDishName').value.trim();
            
            if (!categoryId) { alert('Please select a category'); return; }
            if (!dishName) { alert('Please enter a name'); return; }
            if (currentPhotoRating === 0) { alert('Please give a rating'); return; }
            if (!pendingPhotoData || !pendingPhotoRestaurantId) { alert('Error: No photo data'); return; }

            const restaurant = restaurants.find(r => r.id === pendingPhotoRestaurantId);
            if (!restaurant) { alert('Error: Restaurant not found'); return; }
            if (!restaurant.photos) restaurant.photos = [];

            const ts = Date.now();
            const url = await uploadPhoto(pendingPhotoData, storagePhotoPath(pendingPhotoRestaurantId, 'photos', `${ts}.jpg`));

            const photoObject = {
                url: url,
                rating: currentPhotoRating,
                category: categoryId,
                subcategory: document.getElementById('photoSubcategory')?.value || '',
                dishName: dishName,
                price: document.getElementById('photoPrice').value.trim(),
                caption: document.getElementById('photoCaption').value.trim(),
                date: new Date().toISOString()
            };

            restaurant.photos.push(photoObject);

            try {
                localStorage.setItem('restaurants', JSON.stringify(restaurants));
                // Sync to Firestore
                saveRestaurantToFirestore(restaurant);
            } catch (e) {
                alert('Storage full! Try deleting some photos first.');
                restaurant.photos.pop();
                return;
            }

            // Close modal and refresh view
            closePhotoRatingModal();
            viewRestaurantWithDishes(pendingPhotoRestaurantId);
        }

        function compressImage(dataUrl, maxWidth, quality, callback) {
            // Target max size: 500KB (safe for Firestore 1MB limit with other data)
            const MAX_SIZE_BYTES = 200 * 1024; // 200KB max so photos fit in Firestore docs

            try {
                const img = new Image();

                img.onerror = function() {
                    callback(dataUrl);
                };

                img.onload = function() {
                    try {
                        let currentMaxWidth = maxWidth;
                        let currentQuality = quality;

                        function tryCompress() {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            // Calculate new dimensions
                            if (width > currentMaxWidth) {
                                height = Math.round((height * currentMaxWidth) / width);
                                width = currentMaxWidth;
                            }

                            canvas.width = width;
                            canvas.height = height;

                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);

                            // Convert to compressed JPEG
                            const compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

                            // Check size
                            const sizeBytes = Math.round((compressedDataUrl.length * 3) / 4);

                            if (sizeBytes > MAX_SIZE_BYTES && currentQuality > 0.3) {
                                // Still too big - reduce quality and try again
                                currentQuality -= 0.1;
                                currentMaxWidth = Math.round(currentMaxWidth * 0.8);
                                console.log(`Photo too large (${Math.round(sizeBytes/1024)}KB), reducing to ${currentMaxWidth}px @ ${Math.round(currentQuality*100)}%`);
                                tryCompress();
                            } else {
                                console.log(`Photo compressed to ${Math.round(sizeBytes/1024)}KB`);
                                callback(compressedDataUrl);
                            }
                        }

                        tryCompress();
                    } catch (err) {
                        callback(dataUrl);
                    }
                };
                img.src = dataUrl;
            } catch (err) {
                callback(dataUrl);
            }
        }

        function deletePhoto(restaurantId, photoIndex) {
            if (!confirm('Delete this photo?')) return;

            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant || !restaurant.photos) return;

            restaurant.photos.splice(photoIndex, 1);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            saveRestaurantToFirestore(restaurant);
            viewRestaurantWithDishes(restaurantId);
        }

        // ---- Menu photo functions ----
        function triggerMenuCamera(id) {
            if (isNativeApp()) {
                takeNativePhoto(b64 => saveMenuPhoto(id, b64));
            } else {
                document.getElementById('menuCameraInput-' + id).click();
            }
        }
        function triggerMenuGallery(id) {
            if (isNativeApp()) {
                pickNativePhoto(b64 => saveMenuPhoto(id, b64));
            } else {
                document.getElementById('menuGalleryInput-' + id).click();
            }
        }
        function handleMenuPhotoCapture(event, id) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => { compressImage(e.target.result, 1200, 0.85, b64 => saveMenuPhoto(id, b64)); };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
        async function saveMenuPhoto(id, base64) {
            const restaurant = restaurants.find(r => r.id === id);
            if (!restaurant) return;
            if (!restaurant.menuPhotos) restaurant.menuPhotos = [];
            const url = await uploadPhoto(base64, storagePhotoPath(id, 'menu', Date.now() + '.jpg'));
            restaurant.menuPhotos.push(url);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            saveRestaurantToFirestore(restaurant);
            viewRestaurantWithDishes(id);
        }
        function deleteMenuPhoto(id, index) {
            if (!confirm('Delete this menu photo?')) return;
            const restaurant = restaurants.find(r => r.id === id);
            if (!restaurant || !restaurant.menuPhotos) return;
            restaurant.menuPhotos.splice(index, 1);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            saveRestaurantToFirestore(restaurant);
            viewRestaurantWithDishes(id);
        }
        function openMenuPhotoFullscreen(src) {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
            overlay.innerHTML = `<img src="${src}" style="max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px;">`;
            overlay.onclick = () => document.body.removeChild(overlay);
            document.body.appendChild(overlay);
        }

        // ---- Receipt photo functions ----
        function triggerReceiptCamera(id) {
            if (isNativeApp()) {
                takeNativePhoto(b64 => saveReceiptPhoto(id, b64));
            } else {
                document.getElementById('receiptCameraInput-' + id).click();
            }
        }
        function triggerReceiptGallery(id) {
            if (isNativeApp()) {
                pickNativePhoto(b64 => saveReceiptPhoto(id, b64));
            } else {
                document.getElementById('receiptGalleryInput-' + id).click();
            }
        }
        function handleReceiptPhotoCapture(event, id) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => { compressImage(e.target.result, 1200, 0.85, b64 => saveReceiptPhoto(id, b64)); };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
        async function saveReceiptPhoto(id, base64) {
            const restaurant = restaurants.find(r => r.id === id);
            if (!restaurant) return;
            if (!restaurant.receiptPhotos) restaurant.receiptPhotos = [];
            const url = await uploadPhoto(base64, storagePhotoPath(id, 'receipts', Date.now() + '.jpg'));
            restaurant.receiptPhotos.push(url);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            saveRestaurantToFirestore(restaurant);
            viewRestaurantWithDishes(id);
        }
        function deleteReceiptPhoto(id, index) {
            if (!confirm('Delete this receipt photo?')) return;
            const restaurant = restaurants.find(r => r.id === id);
            if (!restaurant || !restaurant.receiptPhotos) return;
            restaurant.receiptPhotos.splice(index, 1);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            saveRestaurantToFirestore(restaurant);
            viewRestaurantWithDishes(id);
        }

        function openPhotoModalByIndex(restaurantId, photoIndex) {
            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant || !restaurant.photos || !restaurant.photos[photoIndex]) return;
            
            const photo = restaurant.photos[photoIndex];
            const photoUrl = typeof photo === 'object' ? photo.url : photo;
            
            // If it's just a URL string, use simple modal
            if (typeof photo !== 'object') {
                openPhotoModal(photoUrl);
                return;
            }
            
            // Show detailed dish modal
            openDishDetailModal(photo, restaurant, photoIndex);
        }
        
        function openDishDetailModal(photo, restaurant, photoIndex) {
            let modal = document.getElementById('dishInfoModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'dishInfoModal';
                modal.className = 'photo-modal';
                document.body.appendChild(modal);
            }
            
            const stars = '★'.repeat(photo.rating || 0) + '☆'.repeat(5 - (photo.rating || 0));
            const category = getAllCategories().find(c => c.id === photo.category);
            const categoryLabel = category ? `${category.emoji} ${category.name}` : '';
            
            modal.innerHTML = `
                <div class="dish-info-modal-content">
                    <button class="photo-modal-close" onclick="closeDishInfoModal()">×</button>
                    <img class="dish-info-image" src="${photo.url}" alt="${photo.dishName || 'Dish'}">
                    <div class="dish-info-body">
                        <h2 class="dish-info-name">${photo.dishName || 'Unnamed'}</h2>
                        <div class="dish-info-rating">
                            <span class="dish-info-stars">${stars}</span>
                            <span class="dish-info-rating-num">${photo.rating || 0}/5</span>
                        </div>
                        ${categoryLabel ? `<div class="dish-info-category">${categoryLabel}${photo.subcategory ? ' • ' + photo.subcategory : ''}</div>` : ''}
                        ${photo.price ? `<div class="dish-info-price">${photo.price}</div>` : ''}
                        <div class="dish-info-restaurant">📍 ${restaurant.name}</div>
                        ${photo.caption ? `<div class="dish-info-notes">"${photo.caption}"</div>` : ''}
                        ${photo.date ? `<div class="dish-info-date">📅 ${new Date(photo.date).toLocaleDateString()}</div>` : ''}
                        <button class="dish-info-delete-btn" onclick="deletePhotoFromModal(${restaurant.id}, ${photoIndex})">🗑️ Delete</button>
                    </div>
                </div>
            `;
            
            modal.classList.add('open');
        }
        
        function closeDishInfoModal() {
            const modal = document.getElementById('dishInfoModal');
            if (modal) {
                modal.classList.remove('open');
            }
        }
        
        function deletePhotoFromModal(restaurantId, photoIndex) {
            if (!confirm('Delete this item?')) return;

            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant || !restaurant.photos) return;

            restaurant.photos.splice(photoIndex, 1);
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            // Sync to Firestore
            saveRestaurantToFirestore(restaurant);

            closeDishInfoModal();
            viewRestaurantWithDishes(restaurantId);
        }

        function openPhotoModal(photoUrl) {
            // Create modal if it doesn't exist
            let modal = document.getElementById('photoViewModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'photoViewModal';
                modal.className = 'photo-modal';
                modal.innerHTML = `
                    <button class="photo-modal-close" onclick="closePhotoModal()">×</button>
                    <img class="photo-modal-content" id="photoModalImage" src="" alt="Food photo">
                `;
                document.body.appendChild(modal);
            }

            document.getElementById('photoModalImage').src = photoUrl;
            modal.classList.add('open');
        }

        function closePhotoModal() {
            const modal = document.getElementById('photoViewModal');
            if (modal) {
                modal.classList.remove('open');
            }
        }

        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
            if (event.target.id === 'dishDetailModal') {
                event.target.style.display = 'none';
            }
            if (event.target.id === 'photoViewModal') {
                closePhotoModal();
            }
            if (event.target.id === 'photoRateModal') {
                closePhotoRatingModal();
            }
            if (event.target.id === 'dishInfoModal') {
                closeDishInfoModal();
            }
        }

        // Settings data - stored in localStorage
