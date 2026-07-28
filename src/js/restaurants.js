        function initMap() {
            map = L.map('map').setView([43.2964, 17.0175], 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            map.on('click', function(e) {
                if (document.getElementById('addRestaurantModal').style.display === 'block') {
                    selectedLocation = e.latlng;
                    document.getElementById('lat').value = e.latlng.lat;
                    document.getElementById('lng').value = e.latlng.lng;
                    document.getElementById('location').value = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
                }
            });

            loadMarkers();
            populateSidebar();
            initAutocomplete();
            initUserLocation();
            fitMapBelowHeader();
        }

        // Offset the map so it starts BELOW the fixed search header — otherwise the
        // map's zoom control and top markers get hidden behind the search bar.
        function fitMapBelowHeader() {
            const header = document.querySelector('.header');
            const mapEl = document.getElementById('map');
            if (!mapEl) return;
            const h = header ? header.offsetHeight : 0;
            mapEl.style.marginTop = h + 'px';
            mapEl.style.height = 'calc(100vh - ' + h + 'px)';
            if (map) map.invalidateSize();
        }
        window.addEventListener('resize', fitMapBelowHeader);

        // ---- Current location: live dot + always-visible "locate me" button ----
        let userLocationMarker = null;
        let userLatLng = null;
        let locateBtn = null;

        function initUserLocation() {
            if (!map || !('geolocation' in navigator)) return;

            // Always-visible round "locate me" button (top-right), Google Maps style.
            const LocateControl = L.Control.extend({
                options: { position: 'topright' },
                onAdd: function () {
                    const btn = L.DomUtil.create('button', 'locate-btn');
                    btn.type = 'button';
                    btn.title = 'Center on my location';
                    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>';
                    L.DomEvent.disableClickPropagation(btn);
                    L.DomEvent.on(btn, 'click', goToMyLocation);
                    locateBtn = btn;
                    return btn;
                }
            });
            map.addControl(new LocateControl());

            navigator.geolocation.watchPosition(onUserPosition, function () { /* ignore errors */ }, {
                enableHighAccuracy: true,
                maximumAge: 15000,
                timeout: 20000
            });
        }

        // Center the map on the user. If we don't have a fix yet, request one.
        function goToMyLocation() {
            if (userLatLng) {
                map.setView(userLatLng, Math.max(map.getZoom(), 16));
            } else if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    onUserPosition(pos);
                    if (userLatLng) map.setView(userLatLng, 16);
                }, function () {
                    alert('Could not get your location. Please allow location access.');
                }, { enableHighAccuracy: true, timeout: 20000 });
            }
        }

        function onUserPosition(pos) {
            userLatLng = [pos.coords.latitude, pos.coords.longitude];
            if (!userLocationMarker) {
                userLocationMarker = L.circleMarker(userLatLng, {
                    radius: 7,
                    color: '#ffffff',
                    weight: 3,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    interactive: false
                }).addTo(map);
            } else {
                userLocationMarker.setLatLng(userLatLng);
            }
        }

        // Restaurant autocomplete using OpenStreetMap
        function initAutocomplete() {
            const nameInput = document.getElementById('name');
            const resultsDiv = document.getElementById('autocompleteResults');
            let debounceTimer;
            let selectedRestaurantData = null;

            nameInput.addEventListener('input', function() {
                const query = this.value.trim();
                clearTimeout(debounceTimer);
                
                if (query.length < 3) {
                    resultsDiv.classList.remove('show');
                    return;
                }

                debounceTimer = setTimeout(() => {
                    searchRestaurants(query);
                }, 500);
            });

            nameInput.addEventListener('focus', function() {
                if (resultsDiv.children.length > 0 && this.value.length >= 3) {
                    resultsDiv.classList.add('show');
                }
            });

            document.addEventListener('click', function(e) {
                if (!nameInput.contains(e.target) && !resultsDiv.contains(e.target)) {
                    resultsDiv.classList.remove('show');
                }
            });

            async function searchRestaurants(query) {
                // Don't show loading state to avoid confusion if search fails
                try {
                    // Search for restaurants/cafes/bars in Makarska area
                    const bbox = '17.0,43.2,17.1,43.35'; // Makarska bounding box
                    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}+restaurant+cafe+bar&format=json&limit=8&bounded=1&viewbox=${bbox}&addressdetails=1`;
                    
                    const response = await fetch(url, {
                        headers: {
                            'Accept-Language': 'en'
                        }
                    });
                    
                    if (!response.ok) {
                        resultsDiv.classList.remove('show');
                        return;
                    }
                    
                    const data = await response.json();
                    
                    if (data.length > 0) {
                        displayResults(data.slice(0, 8));
                    } else {
                        resultsDiv.classList.remove('show');
                    }
                } catch (error) {
                    // Silently fail - user can still type manually
                    resultsDiv.classList.remove('show');
                }
            }

            function displayResults(results) {
                if (results.length === 0) {
                    resultsDiv.classList.remove('show');
                    return;
                }

                resultsDiv.innerHTML = results.map(place => {
                    const name = place.name || place.display_name.split(',')[0];
                    const address = place.address ? 
                        [place.address.road, place.address.house_number, place.address.city || place.address.town].filter(Boolean).join(', ') :
                        place.display_name.split(',').slice(1, 3).join(',');
                    const type = place.type || place.class || '';
                    
                    return `
                        <div class="autocomplete-item" data-name="${name}" data-lat="${place.lat}" data-lng="${place.lon}" data-address="${address}">
                            <div class="name">${name}</div>
                            <div class="address">${address}</div>
                            ${type ? `<div class="type">${type}</div>` : ''}
                        </div>
                    `;
                }).join('');

                resultsDiv.classList.add('show');

                // Add click handlers
                resultsDiv.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.addEventListener('click', function() {
                        nameInput.value = this.dataset.name;
                        document.getElementById('lat').value = this.dataset.lat;
                        document.getElementById('lng').value = this.dataset.lng;
                        document.getElementById('location').value = `${parseFloat(this.dataset.lat).toFixed(5)}, ${parseFloat(this.dataset.lng).toFixed(5)}`;
                        
                        // Update map marker
                        selectedLocation = {lat: parseFloat(this.dataset.lat), lng: parseFloat(this.dataset.lng)};
                        map.setView([this.dataset.lat, this.dataset.lng], 17);
                        
                        resultsDiv.classList.remove('show');
                    });
                });
            }
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        }

        function switchTab(tab) {
            const menuTab = document.getElementById('menuTab');
            const restaurantTab = document.getElementById('restaurantTab');
            const menuSection = document.getElementById('menuReviewsSection');
            const restaurantSection = document.getElementById('restaurantReviewsSection');

            if (tab === 'menu') {
                menuTab.classList.add('active');
                restaurantTab.classList.remove('active');
                menuSection.style.display = 'block';
                restaurantSection.style.display = 'none';
                populateMenuReviews();
            } else {
                menuTab.classList.remove('active');
                restaurantTab.classList.add('active');
                menuSection.style.display = 'none';
                restaurantSection.style.display = 'block';
            }
        }

        function switchBottomNav(view) {
            const homeBtn = document.getElementById('bottomNavHome');
            const restaurantsBtn = document.getElementById('bottomNavRestaurants');
            const foodBtn = document.getElementById('bottomNavFood');
            const settingsBtn = document.getElementById('bottomNavSettings');
            const sidebar = document.getElementById('sidebar');
            const restaurantsSidebarView = document.getElementById('restaurantsSidebarView');
            const topDishesView = document.getElementById('topDishesView');
            const mapEl = document.getElementById('map');
            const restaurantsListView = document.getElementById('restaurantsListView');
            const settingsView = document.getElementById('settingsView');
            const floatingHeader = document.querySelector('.header');
            const floatingAddBtn = document.getElementById('floatingAddBtn');
            const demoPinBtn = document.getElementById('demoPinBtn');

            // Reset all buttons
            homeBtn.classList.remove('active');
            restaurantsBtn.classList.remove('active');
            foodBtn.classList.remove('active');
            if (settingsBtn) settingsBtn.classList.remove('active');

            // Hide all views
            sidebar.classList.remove('open');
            document.getElementById('sidebarOverlay').classList.remove('open');
            mapEl.style.display = 'none';
            restaurantsListView.style.display = 'none';
            topDishesView.style.display = 'none';
            if (settingsView) settingsView.style.display = 'none';
            
            // Also hide settings sub-pages
            hideAllSettingsSubPages();

            if (view === 'home') {
                homeBtn.classList.add('active');
                mapEl.style.display = 'block';
                if (floatingHeader) floatingHeader.style.display = 'block';
                if (floatingAddBtn) floatingAddBtn.classList.add('show');
                if (demoPinBtn) demoPinBtn.style.display = 'block';
                const headerIcon = document.querySelector('.header h1 .header-icon');
                if (headerIcon) headerIcon.textContent = '🍽️';
                fitMapBelowHeader();
                
            } else if (view === 'restaurants') {
                restaurantsBtn.classList.add('active');
                restaurantsListView.style.display = 'block';
                if (floatingHeader) floatingHeader.style.display = 'none';
                if (floatingAddBtn) floatingAddBtn.classList.remove('show');
                if (demoPinBtn) demoPinBtn.style.display = 'none';
                populateRestaurantsList();
                
            } else if (view === 'food') {
                foodBtn.classList.add('active');
                topDishesView.style.display = 'block';
                if (floatingHeader) floatingHeader.style.display = 'none';
                if (floatingAddBtn) floatingAddBtn.classList.remove('show');
                if (demoPinBtn) demoPinBtn.style.display = 'none';
                populateTopDishes();
                
            } else if (view === 'settings') {
                settingsBtn.classList.add('active');
                settingsView.style.display = 'block';
                if (floatingHeader) floatingHeader.style.display = 'none';
                if (floatingAddBtn) floatingAddBtn.classList.remove('show');
                if (demoPinBtn) demoPinBtn.style.display = 'none';
            }
        }

        // Settings sub-page navigation
        function hideAllSettingsSubPages() {
            const categoriesView = document.getElementById('settingsCategoriesView');
            const subcategoriesView = document.getElementById('settingsSubcategoriesView');
            const priceRangesView = document.getElementById('settingsPriceRangesView');
            const groupMembersView = document.getElementById('settingsGroupMembersView');
            const inviteMembersView = document.getElementById('settingsInviteMembersView');
            if (categoriesView) categoriesView.style.display = 'none';
            if (subcategoriesView) subcategoriesView.style.display = 'none';
            if (priceRangesView) priceRangesView.style.display = 'none';
            if (groupMembersView) groupMembersView.style.display = 'none';
            if (inviteMembersView) inviteMembersView.style.display = 'none';
        }

        function showSettingsPage(page) {
            const settingsView = document.getElementById('settingsView');
            settingsView.style.display = 'none';
            hideAllSettingsSubPages();

            if (page === 'categories') {
                document.getElementById('settingsCategoriesView').style.display = 'block';
                populateCategoriesList();
            } else if (page === 'subcategories') {
                document.getElementById('settingsSubcategoriesView').style.display = 'block';
                populateSubcategoriesList();
            } else if (page === 'priceranges') {
                document.getElementById('settingsPriceRangesView').style.display = 'block';
                populatePriceRangesList();
            } else if (page === 'groupmembers') {
                document.getElementById('settingsGroupMembersView').style.display = 'block';
                populateGroupMembersList();
            } else if (page === 'invitemembers') {
                document.getElementById('settingsInviteMembersView').style.display = 'block';
                displayCurrentGroupInviteCode();
            }
        }

        function hideSettingsPage(page) {
            hideAllSettingsSubPages();
            document.getElementById('settingsView').style.display = 'block';
        }

        // Group Members functions
        function populateGroupMembersList() {
            const container = document.getElementById('groupMembersList');
            const groupNameEl = document.getElementById('currentGroupName');
            const groupMetaEl = document.getElementById('currentGroupMeta');
            
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (!currentGroup) {
                container.innerHTML = '<div class="settings-empty">No group selected</div>';
                return;
            }

            groupNameEl.textContent = currentGroup.name;

            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            const isOwner = currentGroup.ownerUid === currentUid;

            // Load members from Firestore if group has an inviteCode
            if (currentGroup.inviteCode) {
                db.collection('groups').doc(currentGroup.inviteCode).get().then(doc => {
                    const fsMembers = doc.exists ? (doc.data().memberNames || doc.data().members || []) : [];
                    const memberCount = Array.isArray(fsMembers) ? fsMembers.length : (currentGroup.members || 1);
                    groupMetaEl.textContent = memberCount + ' member' + (memberCount !== 1 ? 's' : '');

                    let html = '';
                    // Always show creator first
                    const ownerName = currentGroup.ownerName || 'Creator';
                    const isMe = currentGroup.ownerUid === currentUid;
                    html += `<div class="member-card">
                        <div class="member-avatar" style="background:linear-gradient(135deg,#ff6b6b,#ff8787);">${ownerName.charAt(0).toUpperCase()}</div>
                        <div class="member-info">
                            <div class="member-name">${ownerName}${isMe ? ' (You)' : ''}</div>
                            <div class="member-role">Admin · Created group</div>
                        </div>
                    </div>`;

                    // Show other members
                    if (doc.exists && Array.isArray(doc.data().memberNames)) {
                        doc.data().memberNames.forEach(m => {
                            if (m.uid === currentGroup.ownerUid) return; // already shown
                            const isSelf = m.uid === currentUid;
                            html += `<div class="member-card">
                                <div class="member-avatar" style="background:linear-gradient(135deg,#74b9ff,#0984e3);">${(m.name || '?').charAt(0).toUpperCase()}</div>
                                <div class="member-info">
                                    <div class="member-name">${m.name || 'Member'}${isSelf ? ' (You)' : ''}</div>
                                    <div class="member-role">Member</div>
                                </div>
                                ${isOwner && !isSelf ? `<button onclick="removeMemberFromGroup('${currentGroup.inviteCode}', '${m.uid}', '${m.name}')" style="background:#ffe3e3;color:#e74c3c;border:none;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;">Remove</button>` : ''}
                            </div>`;
                        });
                    } else if (memberCount > 1) {
                        // Fallback: just show count
                        html += `<div class="member-card">
                            <div class="member-avatar" style="background:linear-gradient(135deg,#74b9ff,#0984e3);">?</div>
                            <div class="member-info"><div class="member-name">Other members</div><div class="member-role">${memberCount - 1} joined</div></div>
                        </div>`;
                    }

                    container.innerHTML = html;
                }).catch(() => {
                    groupMetaEl.textContent = (currentGroup.members || 1) + ' members';
                    container.innerHTML = `<div class="member-card">
                        <div class="member-avatar" style="background:linear-gradient(135deg,#ff6b6b,#ff8787);">D</div>
                        <div class="member-info"><div class="member-name">You</div><div class="member-role">Admin</div></div>
                    </div>`;
                });
            } else {
                groupMetaEl.textContent = '1 member';
                container.innerHTML = `<div class="member-card">
                    <div class="member-avatar" style="background:linear-gradient(135deg,#ff6b6b,#ff8787);">D</div>
                    <div class="member-info"><div class="member-name">You</div><div class="member-role">Admin · Created group</div></div>
                </div>`;
            }
        }

        async function removeMemberFromGroup(inviteCode, uid, name) {
            if (!confirm('Remove ' + name + ' from the group?')) return;
            try {
                // Remove from memberNames array
                const doc = await db.collection('groups').doc(inviteCode).get();
                if (doc.exists) {
                    const data = doc.data();
                    const updatedNames = (data.memberNames || []).filter(m => m.uid !== uid);
                    const updatedMembers = (data.members || []).filter(m => m !== uid);
                    await db.collection('groups').doc(inviteCode).update({
                        memberNames: updatedNames,
                        members: updatedMembers
                    });
                }
                alert(name + ' has been removed from the group.');
                populateGroupMembersList();
            } catch(e) {
                alert('Could not remove member: ' + e.message);
            }
        }

        function displayCurrentGroupInviteCode() {
            const codeDisplay = document.getElementById('inviteCodeDisplay');
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            
            if (currentGroup && currentGroup.inviteCode) {
                codeDisplay.textContent = currentGroup.inviteCode;
            } else {
                codeDisplay.textContent = '------';
            }
        }

        function copyCurrentGroupCode() {
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (currentGroup && currentGroup.inviteCode) {
                navigator.clipboard.writeText(currentGroup.inviteCode).then(() => {
                    alert('Invite code copied: ' + currentGroup.inviteCode);
                });
            }
        }

        function shareViaWhatsApp() {
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (currentGroup) {
                const link = `https://kafk.github.io/Makarska-Dining/#join=${currentGroup.inviteCode}`;
                const text = `Join my group "${currentGroup.name}" on Makarska Dining!\n\nTap this link: ${link}\n\nOr use code: ${currentGroup.inviteCode}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }
        }

        function shareViaEmail() {
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (currentGroup) {
                const subject = `Join ${currentGroup.name} on Makarska Dining`;
                const body = `Join my group "${currentGroup.name}" on Makarska Dining!\n\nUse invite code: ${currentGroup.inviteCode}`;
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
            }
        }

        function shareViaLink() {
            const currentGroup = userGroups.find(g => g.id === currentGroupId) || userGroups[0];
            if (currentGroup) {
                const link = `https://kafk.github.io/Makarska-Dining/#join=${currentGroup.inviteCode}`;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(link).then(() => alert('Link copied: ' + link));
                } else {
                    alert('Share this link: ' + link);
                }
            }
        }

        function populateRestaurantsList() {
            const container = document.getElementById('restaurantsListContainer');
            if (!container) return;

            let filteredRestaurants = restaurants;
            
            // Filter by main category
            if (currentRestaurantCategory !== 'all') {
                filteredRestaurants = restaurants.filter(r => r.mainCategory === currentRestaurantCategory);
            }

            // Filter by search query
            const searchInput = document.getElementById('restaurantsSearchInput');
            if (searchInput && searchInput.value.trim()) {
                const query = searchInput.value.trim().toLowerCase();
                filteredRestaurants = filteredRestaurants.filter(r => 
                    r.name.toLowerCase().includes(query) || 
                    r.cuisine.toLowerCase().includes(query)
                );
            }

            const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
                const avgA = (a.foodRating + a.serviceRating) / 2;
                const avgB = (b.foodRating + b.serviceRating) / 2;
                return avgB - avgA;
            });

            container.innerHTML = '';

            sortedRestaurants.forEach(restaurant => {
                const avgRating = ((restaurant.foodRating + restaurant.serviceRating) / 2).toFixed(1);
                const stars = '★'.repeat(Math.round(avgRating));
                const priceSymbol = '€'.repeat(restaurant.price);
                
                const cuisineEmoji = {
                    'Croatian': '🇭🇷',
                    'Seafood': '🐟',
                    'Italian': '🍝',
                    'Mediterranean': '🌊',
                    'Pizza': '🍕',
                    'Steakhouse': '🥩',
                    'Asian': '🥢',
                    'Mexican': '🌮',
                    'Cafe': '☕',
                    'International': '🌍'
                }[restaurant.cuisine] || '🍽️';

                // Check if restaurant has a cover photo
                const hasCoverPhoto = restaurant.coverPhoto;

                const card = document.createElement('div');
                card.className = 'restaurant-card';
                card.onclick = () => viewRestaurantWithDishes(restaurant.id);
                card.innerHTML = `
                    <div class="restaurant-image-wrapper ${hasCoverPhoto ? 'has-photo' : ''}">
                        ${hasCoverPhoto 
                            ? `<img src="${restaurant.coverPhoto}" alt="${restaurant.name}" class="restaurant-cover-img">`
                            : imgPlaceholder()
                        }
                    </div>
                    <div class="restaurant-card-info">
                        <div class="restaurant-card-name">${restaurant.name}</div>
                        <div class="restaurant-card-cuisine">${restaurant.cuisine} • ${priceSymbol}</div>
                        <div class="restaurant-card-rating">
                            <span style="color: #ffd700;">${stars}</span>
                            <span style="font-weight: 700;">${avgRating}/5</span>
                        </div>
                        <div class="restaurant-card-footer">
                            <span style="font-size: 12px; color: #636e72;">Last visit: ${new Date(restaurant.visitDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function viewRestaurantWithDishes(id) {
            const restaurant = restaurants.find(r => r.id === id);
            if (!restaurant) return;
            
            currentRestaurantId = id;
            
            const avgRating = ((restaurant.foodRating + restaurant.serviceRating) / 2).toFixed(1);
            const priceSymbol = '€'.repeat(restaurant.price);
            
            // Get actual dishes added for this restaurant
            const restaurantDishes = restaurant.foodItems || [];
            // Get photos for this restaurant (food photos only, not cover)
            const restaurantPhotos = restaurant.photos || [];
            
            // Get cuisine emoji for fallback
            const cuisineEmoji = {
                'Croatian': '🇭🇷',
                'Seafood': '🐟',
                'Italian': '🍝',
                'Mediterranean': '🌊',
                'Pizza': '🍕',
                'Steakhouse': '🥩',
                'Asian': '🥢',
                'Mexican': '🌮',
                'Cafe': '☕',
                'International': '🌍'
            }[restaurant.cuisine] || '🍽️';

            // Set hero image
            const heroEl = document.getElementById('restaurantHero');
            if (restaurant.coverPhoto) {
                heroEl.innerHTML = `
                    <img src="${restaurant.coverPhoto}" alt="${restaurant.name}">
                    <div class="restaurant-detail-hero-overlay"></div>
                    <div class="restaurant-detail-hero-name">${restaurant.name}</div>
                    <div class="hero-photo-buttons">
                        <button class="hero-photo-btn" onclick="event.stopPropagation(); changeCoverPhotoCamera(${id})">📷</button>
                        <button class="hero-photo-btn gallery" onclick="event.stopPropagation(); changeCoverPhotoGallery(${id})">🖼️</button>
                    </div>
                    <input type="file" id="coverPhotoCameraInput-${id}" class="photo-upload-input" accept="image/*" capture="environment" onchange="handleCoverPhotoChange(event, ${id})">
                    <input type="file" id="coverPhotoGalleryInput-${id}" class="photo-upload-input" accept="image/*" onchange="handleCoverPhotoChange(event, ${id})">
                `;
            } else {
                heroEl.innerHTML = `
                    <div style="width:100%;height:100%;background:#f1f3f5;display:flex;align-items:center;justify-content:center;">
                        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.3;"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#9aa0a6" stroke-width="1.5"/><circle cx="8.5" cy="9.5" r="1.5" fill="#9aa0a6"/><path d="M3 16l4.5-5 3.5 4 2.5-2.5 4 5" stroke="#9aa0a6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div class="restaurant-detail-hero-overlay"></div>
                    <div class="restaurant-detail-hero-name">${restaurant.name}</div>
                    <div class="hero-photo-buttons">
                        <button class="hero-photo-btn add" onclick="event.stopPropagation(); changeCoverPhotoCamera(${id})">📷</button>
                        <button class="hero-photo-btn add" onclick="event.stopPropagation(); changeCoverPhotoGallery(${id})">🖼️</button>
                    </div>
                    <input type="file" id="coverPhotoCameraInput-${id}" class="photo-upload-input" accept="image/*" capture="environment" onchange="handleCoverPhotoChange(event, ${id})">
                    <input type="file" id="coverPhotoGalleryInput-${id}" class="photo-upload-input" accept="image/*" onchange="handleCoverPhotoChange(event, ${id})">
                `;
            }

            let dishesHtml = '';
            if (restaurantDishes.length > 0) {
                dishesHtml = `
                    <div class="restaurant-dishes-section">
                        <h4 class="restaurant-dishes-title">Added Dishes (${restaurantDishes.length})</h4>
                        <button onclick="openAddFoodModal(${id})" style="width:100%;padding:10px;margin-bottom:12px;background:linear-gradient(135deg,#ff6b6b,#ff8787);color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;">+ Add Dish</button>
                        ${restaurantDishes.map(dish => {
                            // Determine price category
                            let priceCategory = '';
                            if (dish.price) {
                                const priceNum = parseFloat(dish.price.replace(/[^0-9.,]/g, '').replace(',', '.'));
                                if (!isNaN(priceNum)) {
                                    if (priceNum <= 10) priceCategory = '(Budget)';
                                    else if (priceNum <= 20) priceCategory = '(Mid-range)';
                                    else if (priceNum <= 35) priceCategory = '(Expensive)';
                                    else priceCategory = '(Premium)';
                                }
                            }
                            const dishKey = 'r' + restaurant.id + '_d' + dish.id;
                            _dishDetailLookup[dishKey] = {
                                name: dish.name,
                                restaurant: restaurant.name,
                                restaurantId: restaurant.id,
                                foodItemId: dish.id,
                                category: dish.subcategory || dish.category || '',
                                mainCategory: dish.category || '',
                                emoji: getCategoryEmoji(dish.category || 'food'),
                                visits: dish.visits || null,
                                photo: dish.photo || null
                            };
                            return `
                            <div class="dish-card" onclick="viewDishDetail(_dishDetailLookup['${dishKey}'])" style="cursor:pointer;">
                                <div class="dish-image-wrapper">
                                    ${dish.photo
                                        ? `<img src="${dish.photo}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                                        : `<div class="dish-image-wrapper" style="background:#f1f3f5;">${imgPlaceholder()}</div>`
                                    }
                                </div>
                                <div class="dish-info">
                                    <div class="dish-name">${dish.name}</div>
                                    <div class="dish-meta">
                                        ${dish.category ? `<div class="dish-meta-item">${getCategoryEmoji(dish.category)} ${dish.category}</div>` : ''}
                                        ${dish.subcategory ? `<div class="dish-meta-item">› ${dish.subcategory}</div>` : ''}
                                    </div>
                                    <div class="dish-description">${(dish.visits && dish.visits.length) ? dish.visits[dish.visits.length-1].comment || 'Tap to see visit history' : dish.notes || 'Tap to see details'}</div>
                                    <div class="dish-footer">
                                        <div class="dish-price-info">
                                            <span class="dish-price-label">Price:</span>
                                            <span class="dish-price-value">${dish.price ? dish.price + (dish.price.includes('€') ? '' : ' €') : '-'}</span>
                                            ${priceCategory ? `<span class="dish-price-category">${priceCategory}</span>` : ''}
                                        </div>
                                        <div class="dish-rating">
                                            <span class="dish-rating-label">Visits:</span>
                                            <span>${(dish.visits && dish.visits.length) ? dish.visits.length + '×' : (dish.foodRating ? '⭐ ' + dish.foodRating + '/5' : '-')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                `;
            } else {
                dishesHtml = `
                    <div class="restaurant-dishes-section">
                        <h4 class="restaurant-dishes-title">Added Dishes</h4>
                        <button onclick="openAddFoodModal(${id})" style="width:100%;padding:10px;margin-bottom:12px;background:linear-gradient(135deg,#ff6b6b,#ff8787);color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;">+ Add Dish</button>
                        <p style="color: #999; font-size: 14px; text-align: center; padding: 8px 0;">No dishes added yet.</p>
                    </div>
                `;
            }

            // Photo gallery section
            let photosHtml = `
                <div class="restaurant-photos-section">
                    <div class="restaurant-photos-header">
                        <h4 class="restaurant-photos-title">📸 Food Photos (${restaurantPhotos.length})</h4>
                        <div class="photo-buttons">
                            <button class="add-photo-btn" onclick="triggerCameraCapture(${id})">
                                <span>📷</span> Camera
                            </button>
                            <button class="add-photo-btn gallery-btn" onclick="triggerGalleryUpload(${id})">
                                <span>🖼️</span> Gallery
                            </button>
                        </div>
                        <input type="file" id="cameraCapture-${id}" class="photo-upload-input" accept="image/*" capture="environment" onchange="handlePhotoCapture(event, ${id})">
                        <input type="file" id="galleryUpload-${id}" class="photo-upload-input" accept="image/*" onchange="handlePhotoCapture(event, ${id})">
                    </div>
                    <div class="photo-gallery">
                        ${restaurantPhotos.length > 0 ? 
                            restaurantPhotos.map((photo, index) => `
                                <div class="photo-item" onclick="openPhotoModalByIndex(${id}, ${index})">
                                    <div class="photo-item-image">
                                        <img src="${typeof photo === 'object' ? photo.url : photo}" alt="Food photo ${index + 1}">
                                    </div>
                                    <div class="photo-item-info">
                                        ${typeof photo === 'object' && photo.dishName ? `<div class="photo-item-name">${photo.dishName}</div>` : ''}
                                        <div class="photo-item-rating">
                                            <span class="stars">${'★'.repeat(typeof photo === 'object' ? photo.rating || 0 : 0)}${'☆'.repeat(5 - (typeof photo === 'object' ? photo.rating || 0 : 0))}</span>
                                            <span class="rating-text">${typeof photo === 'object' && photo.rating ? photo.rating + '/5' : 'Not rated'}</span>
                                        </div>
                                        ${typeof photo === 'object' && photo.price ? `<div class="photo-item-price">${photo.price}</div>` : ''}
                                        <div class="photo-item-date">${typeof photo === 'object' && photo.date ? new Date(photo.date).toLocaleDateString() : ''}</div>
                                    </div>
                                    <button class="photo-item-delete" onclick="event.stopPropagation(); deletePhoto(${id}, ${index})">×</button>
                                </div>
                            `).join('') 
                            : `<div class="photo-empty">
                                <div class="photo-empty-icon">📷</div>
                                <div>No photos yet</div>
                                <div style="margin-top: 8px; font-size: 12px;">Take a photo of your food or choose from gallery!</div>
                            </div>`
                        }
                    </div>
                </div>
            `;
            
            document.getElementById('restaurantDetails').innerHTML = `
                <div class="restaurant-info">
                    <div class="info-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                        <span class="info-label">📍 Adress</span>
                        <input type="text" id="addressInput-${id}" value="${restaurant.address || ''}" 
                            placeholder="Ange adress..." 
                            style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                            onchange="updateAddress(${id}, this.value)">
                        <div style="display: flex; width: 100%; gap: 8px; flex-wrap: wrap;">
                            <button onclick="geocodeRestaurant(${id})" 
                                id="geocodeBtn-${id}"
                                style="flex: 1; min-width: 80px; padding: 10px 12px; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;"
                                title="Hitta på kartan från adress">
                                🔍 Sök
                            </button>
                            <button onclick="editLocation(${id})" 
                                style="flex: 1; min-width: 100px; padding: 10px 12px; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                📍 Flytta pin
                            </button>
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cuisine</span>
                        <span class="info-value">${restaurant.cuisine}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Price Range</span>
                        <span class="info-value" style="color: #27ae60; font-weight: 700;">${priceSymbol}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Overall Rating</span>
                        <span class="info-value rating-stars">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5 - Math.round(avgRating))} ${avgRating}/5</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Food Quality</span>
                        <span class="info-value rating-stars">${'★'.repeat(restaurant.foodRating)}${'☆'.repeat(5 - restaurant.foodRating)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Service</span>
                        <span class="info-value rating-stars">${'★'.repeat(restaurant.serviceRating)}${'☆'.repeat(5 - restaurant.serviceRating)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Last Visit</span>
                        <span class="info-value">${new Date(restaurant.visitDate).toLocaleDateString()}</span>
                    </div>
                    <button onclick="openEditRestaurantModal(${id})" style="width:100%;margin-top:12px;padding:10px;background:#f1f3f5;color:#2d3436;border:none;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;">✏️ Edit Restaurant Info</button>
                </div>
                ${dishesHtml}
                ${photosHtml}
                ${restaurant.notes ? `
                    <div class="notes-section">
                        <h4>Notes</h4>
                        <p>${restaurant.notes}</p>
                    </div>
                ` : ''}

                <!-- MENU PHOTOS SECTION -->
                <div class="restaurant-photos-section" style="margin-top:16px;">
                    <div class="restaurant-photos-header">
                        <h4 class="restaurant-photos-title">📋 Menu Photos (${(restaurant.menuPhotos || []).length})</h4>
                        <div class="photo-buttons">
                            <button class="add-photo-btn" onclick="triggerMenuCamera(${id})">
                                <span>📷</span> Camera
                            </button>
                            <button class="add-photo-btn gallery-btn" onclick="triggerMenuGallery(${id})">
                                <span>🖼️</span> Gallery
                            </button>
                        </div>
                        <input type="file" id="menuCameraInput-${id}" class="photo-upload-input" accept="image/*" capture="environment" onchange="handleMenuPhotoCapture(event, ${id})">
                        <input type="file" id="menuGalleryInput-${id}" class="photo-upload-input" accept="image/*" onchange="handleMenuPhotoCapture(event, ${id})">
                    </div>
                    <div class="photo-gallery">
                        ${(restaurant.menuPhotos || []).length > 0
                            ? (restaurant.menuPhotos).map((photo, index) => `
                                <div class="photo-item" onclick="openMenuPhotoFullscreen('${photo}')">
                                    <div class="photo-item-image">
                                        <img src="${photo}" alt="Menu photo ${index + 1}">
                                    </div>
                                    <button class="photo-item-delete" onclick="event.stopPropagation(); deleteMenuPhoto(${id}, ${index})">×</button>
                                </div>
                            `).join('')
                            : `<div class="photo-empty">
                                <div class="photo-empty-icon">📋</div>
                                <div>No menu photos yet</div>
                                <div style="margin-top:8px;font-size:12px;">Photograph the menu so you remember what they serve!</div>
                            </div>`
                        }
                    </div>
                </div>

                <!-- RECEIPT PHOTOS SECTION -->
                <div style="margin-top:16px;padding:16px;background:#f0fff4;border-radius:14px;border:1px solid #bbf7d0;">
                    <h4 style="margin:0 0 10px;font-size:14px;font-weight:700;color:#166534;">🧾 Receipt (${(restaurant.receiptPhotos || []).length})</h4>
                    <div style="display:flex;gap:8px;margin-bottom:10px;">
                        <button class="add-photo-btn" onclick="triggerReceiptCamera(${id})" style="flex:1;">
                            <span>📷</span> Camera
                        </button>
                        <button class="add-photo-btn gallery-btn" onclick="triggerReceiptGallery(${id})" style="flex:1;">
                            <span>🖼️</span> Gallery
                        </button>
                        <input type="file" id="receiptCameraInput-${id}" class="photo-upload-input" accept="image/*" capture="environment" onchange="handleReceiptPhotoCapture(event, ${id})">
                        <input type="file" id="receiptGalleryInput-${id}" class="photo-upload-input" accept="image/*" onchange="handleReceiptPhotoCapture(event, ${id})">
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${(restaurant.receiptPhotos || []).length > 0
                            ? (restaurant.receiptPhotos).map((photo, index) => `
                                <div style="position:relative;width:80px;height:100px;border-radius:8px;overflow:hidden;border:1px solid #86efac;cursor:pointer;" onclick="openMenuPhotoFullscreen('${photo}')">
                                    <img src="${photo}" style="width:100%;height:100%;object-fit:cover;">
                                    <button onclick="event.stopPropagation(); deleteReceiptPhoto(${id}, ${index})" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;line-height:1;">×</button>
                                </div>
                            `).join('')
                            : `<div style="color:#4ade80;font-size:13px;padding:8px 0;">No receipt photos yet. Photograph your bill to track costs!</div>`
                        }
                    </div>
                </div>

                <button class="delete-btn" onclick="event.stopPropagation(); deleteRestaurant(${id})">Delete Restaurant</button>
            `;
            
            document.getElementById('viewModal').classList.add('open');
        }

        // Category and subcategory definitions
        const categorySubcategories = {
            'restaurant': [
                { id: 'all', label: '🍽️ All', emoji: '🍽️' },
                { id: 'seafood', label: '🐟 Seafood', emoji: '🐟' },
                { id: 'meat', label: '🥩 Meat', emoji: '🥩' },
                { id: 'pasta', label: '🍝 Pasta', emoji: '🍝' },
                { id: 'pizza', label: '🍕 Pizza', emoji: '🍕' },
                { id: 'salad', label: '🥗 Salad', emoji: '🥗' }
            ],
            'dessert': [
                { id: 'all', label: '🍰 All', emoji: '🍰' },
                { id: 'cake', label: '🎂 Cake', emoji: '🎂' },
                { id: 'pastry', label: '🥐 Pastry', emoji: '🥐' },
                { id: 'chocolate', label: '🍫 Chocolate', emoji: '🍫' },
                { id: 'fruit', label: '🍓 Fruit', emoji: '🍓' }
            ],
            'icecream': [
                { id: 'all', label: '🍦 All', emoji: '🍦' },
                { id: 'gelato', label: '🍨 Gelato', emoji: '🍨' },
                { id: 'sorbet', label: '🧊 Sorbet', emoji: '🧊' },
                { id: 'sundae', label: '🍧 Sundae', emoji: '🍧' },
                { id: 'cone', label: '🍦 Cone', emoji: '🍦' }
            ],
            'drinks': [
                { id: 'all', label: '🍹 All', emoji: '🍹' },
                { id: 'coffee', label: '☕ Coffee', emoji: '☕' },
                { id: 'cocktail', label: '🍸 Cocktails', emoji: '🍸' },
                { id: 'wine', label: '🍷 Wine', emoji: '🍷' },
                { id: 'beer', label: '🍺 Beer', emoji: '🍺' },
                { id: 'juice', label: '🧃 Juice', emoji: '🧃' }
            ]
        };

        let currentMainCategory = 'all';
        let currentSubcategory = 'all';

        function selectMainCategory(category) {
            currentMainCategory = category;
            currentSubcategory = 'all';

            // Update main category buttons
            const mainButtons = document.querySelectorAll('#mainCategoryFilters .dish-filter-btn');
            mainButtons.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Show/hide subcategories
            const subcategoryContainer = document.getElementById('subcategoryFilters');
            if (category === 'all') {
                subcategoryContainer.style.display = 'none';
            } else {
                subcategoryContainer.style.display = 'flex';
                populateSubcategories(category);
            }

            // Refresh dishes list
            populateTopDishes();
        }

        // Restaurant category filter
        let currentRestaurantCategory = 'all';
        
        function selectRestaurantCategory(category) {
            currentRestaurantCategory = category;

            // Update category buttons
            const buttons = document.querySelectorAll('#restaurantCategoryFilters .dish-filter-btn');
            buttons.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Refresh restaurants list
            populateRestaurantsList();
        }

        function populateSubcategories(category) {
            const container = document.getElementById('subcategoryFilters');
            const subcategories = categorySubcategories[category] || [];

            container.innerHTML = subcategories.map(sub => `
                <button class="subcategory-btn ${sub.id === 'all' ? 'active' : ''}" 
                        data-subcategory="${sub.id}"
                        onclick="selectSubcategory('${sub.id}')">
                    ${sub.label}
                </button>
            `).join('');
        }

        function selectSubcategory(subcategory) {
            currentSubcategory = subcategory;

            // Update subcategory buttons
            const subButtons = document.querySelectorAll('#subcategoryFilters .subcategory-btn');
            subButtons.forEach(btn => {
                if (btn.dataset.subcategory === subcategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Refresh dishes list
            populateTopDishes();
        }

        function filterRestaurantsList() {
            populateRestaurantsList();
        }

        function filterFoodList() {
            populateTopDishes();
        }

        function populateTopDishes() {
            const dishesList = document.getElementById('dishesList');
            if (!dishesList) return;
            
            // Collect all user-added food items from restaurants
            let allDishes = [];
            
            // Get photos from all restaurants
            restaurants.forEach(restaurant => {
                if (restaurant.photos && restaurant.photos.length > 0) {
                    restaurant.photos.forEach(photo => {
                        if (typeof photo === 'object' && photo.dishName) {
                            allDishes.push({
                                name: photo.dishName,
                                description: photo.caption || '',
                                restaurant: restaurant.name,
                                restaurantId: restaurant.id,
                                mainCategory: photo.category || 'restaurant',
                                category: photo.subcategory || 'all',
                                rating: photo.rating ? photo.rating * 2 : 0, // Convert 5-scale to 10-scale for display
                                price: photo.price || '',
                                emoji: getCategoryEmoji(photo.category),
                                imageUrl: photo.url,
                                date: photo.date,
                                isUserAdded: true
                            });
                        }
                    });
                }
                
                // Also include food items if any
                if (restaurant.foodItems && restaurant.foodItems.length > 0) {
                    restaurant.foodItems.forEach(item => {
                        allDishes.push({
                            name: item.name,
                            description: item.notes || '',
                            restaurant: restaurant.name,
                            restaurantId: restaurant.id,
                            foodItemId: item.id,
                            mainCategory: item.category || 'restaurant',
                            category: item.subcategory || 'all',
                            rating: item.foodRating ? item.foodRating * 2 : 0,
                            price: item.price || '',
                            emoji: getCategoryEmoji(item.category),
                            date: item.visitDate,
                            visits: item.visits || null,
                            photo: item.photo || null,
                            isUserAdded: true
                        });
                    });
                }
            });
            
            // No demo data - only show user's real dishes

            // Filter dishes based on current selections
            let filteredDishes = allDishes;
            
            // Filter by search query
            const searchInput = document.getElementById('foodSearchInput');
            if (searchInput && searchInput.value.trim()) {
                const query = searchInput.value.trim().toLowerCase();
                filteredDishes = filteredDishes.filter(dish => 
                    dish.name.toLowerCase().includes(query) || 
                    dish.restaurant.toLowerCase().includes(query) ||
                    (dish.description && dish.description.toLowerCase().includes(query))
                );
            }
            
            if (currentMainCategory !== 'all') {
                filteredDishes = filteredDishes.filter(dish => dish.mainCategory === currentMainCategory);
                
                if (currentSubcategory !== 'all') {
                    filteredDishes = filteredDishes.filter(dish => dish.category === currentSubcategory);
                }
            }

            // Sort by rating
            filteredDishes.sort((a, b) => b.rating - a.rating);

            dishesList.innerHTML = '';
            
            if (filteredDishes.length === 0) {
                dishesList.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #999;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📷</div>
                        <div style="font-size: 16px; margin-bottom: 8px;">No items yet</div>
                        <div style="font-size: 14px;">Add photos with ratings from your restaurant visits!</div>
                    </div>
                `;
                return;
            }
            
            try {
                filteredDishes.forEach((dish, index) => {
                    const card = document.createElement('div');
                    card.className = 'dish-card';
                    card.onclick = () => viewDishDetail(dish);
                    
                    // Use image if available, otherwise emoji
                    const imageContent = dish.imageUrl 
                        ? `<img src="${dish.imageUrl}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                        : imgPlaceholder();
                    
                    card.innerHTML = `
                        <div class="dish-image-wrapper">
                            ${imageContent}
                        </div>
                        <div class="dish-info">
                            <div class="dish-name">${dish.name}</div>
                            <div class="dish-description">${dish.description || 'No notes'}</div>
                            <div class="dish-meta">
                                <div class="dish-meta-item">📍 ${dish.restaurant}</div>
                                <div class="dish-meta-item">🍽️ ${dish.category || dish.mainCategory}</div>
                            </div>
                            <div class="dish-footer">
                                <div class="dish-price">${dish.price || '-'}</div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="dish-rating">
                                        <span class="dish-rating-emoji">😋</span>
                                        <span>${dish.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    dishesList.appendChild(card);
                });
            } catch (error) {
                console.error('Error populating dishes:', error);
            }
        }
        
        function imgPlaceholder() {
            return `<div class="img-placeholder"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#9aa0a6" stroke-width="1.5"/><circle cx="8.5" cy="9.5" r="1.5" fill="#9aa0a6"/><path d="M3 16l4.5-5 3.5 4 2.5-2.5 4 5" stroke="#9aa0a6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
        }

        function getCategoryEmoji(category) {
            const emojis = {
                'restaurant': '🍽️',
                'dessert': '🍰',
                'icecream': '🍨',
                'drinks': '🍹',
                'seafood': '🐟',
                'meat': '🥩',
                'pasta': '🍝',
                'pizza': '🍕',
                'coffee': '☕',
                'beer': '🍺',
                'wine': '🍷',
                'cocktail': '🍸'
            };
            return emojis[category] || '🍽️';
        }

        function starsHtml(val, max) {
            val = Math.max(0, Math.min(max, Math.round(val)));
            return '<span style="color:#ffd700">' + '★'.repeat(val) + '</span><span style="color:#ccc">' + '☆'.repeat(max - val) + '</span>';
        }

