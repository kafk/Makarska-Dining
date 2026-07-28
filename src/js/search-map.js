        function populateMenuReviews() {
            const menuReviewCards = document.getElementById('menuReviewCards');
            
            // Sample menu items from visited restaurants
            const menuItems = [
                {
                    name: "Grilled Sea Bass",
                    restaurant: "Ivo",
                    rating: 5,
                    price: "€24.99",
                    image: "🐟",
                    notes: "Perfectly cooked, fresh from the Adriatic"
                },
                {
                    name: "Black Risotto",
                    restaurant: "Ante",
                    rating: 5,
                    price: "€18.50",
                    image: "🍚",
                    notes: "Rich squid ink flavor, al dente"
                },
                {
                    name: "Margherita Pizza",
                    restaurant: "Pizzeria Mamma Mia",
                    rating: 4,
                    price: "€9.99",
                    image: "🍕",
                    notes: "Simple but delicious wood-fired"
                },
                {
                    name: "Pašticada",
                    restaurant: "Konoba Kalalarga",
                    rating: 3,
                    price: "€22.00",
                    image: "🍖",
                    notes: "Traditional Croatian beef stew"
                },
                {
                    name: "Lobster Thermidor",
                    restaurant: "Ribar",
                    rating: 5,
                    price: "€45.00",
                    image: "🦞",
                    notes: "Outstanding! Worth every kuna"
                },
                {
                    name: "Tuna Tartare",
                    restaurant: "Bistro Marinero",
                    rating: 5,
                    price: "€16.50",
                    image: "🍣",
                    notes: "Fresh, creative presentation"
                }
            ];

            menuReviewCards.innerHTML = '';
            
            menuItems.forEach(item => {
                const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
                
                const card = document.createElement('div');
                card.className = 'review-card';
                card.innerHTML = `
                    <div class="review-card-image" style="display: flex; align-items: center; justify-content: center; font-size: 60px;">
                        ${item.image}
                    </div>
                    <div class="review-card-content">
                        <div class="review-card-title">${item.name}</div>
                        <div class="review-card-subtitle">at ${item.restaurant}</div>
                        <div class="review-card-footer">
                            <span class="review-card-rating">${stars}</span>
                            <span class="review-card-price">${item.price}</span>
                        </div>
                    </div>
                `;
                
                menuReviewCards.appendChild(card);
            });
        }

        function populateSidebar() {
            // Update restaurant count
            document.getElementById('restaurantCount').textContent = restaurants.length;

            // Populate restaurants list
            const restaurantList = document.getElementById('restaurantList');
            restaurantList.innerHTML = '';
            
            const sortedRestaurants = [...restaurants].sort((a, b) => a.name.localeCompare(b.name));
            
            sortedRestaurants.forEach(restaurant => {
                const avgRating = ((restaurant.foodRating + restaurant.serviceRating) / 2).toFixed(1);
                const priceSymbol = '€'.repeat(restaurant.price);
                const stars = '★'.repeat(Math.round(avgRating));
                
                const li = document.createElement('li');
                li.className = 'sidebar-item';
                li.onclick = () => {
                    viewRestaurant(restaurant.id);
                    toggleSidebar();
                    map.setView([restaurant.lat, restaurant.lng], 16);
                };
                
                li.innerHTML = `
                    <div class="sidebar-item-name">${restaurant.name}</div>
                    <div class="sidebar-item-meta">
                        <span class="cuisine-badge" style="border-color: ${cuisineColors[restaurant.cuisine]}20; color: ${cuisineColors[restaurant.cuisine]};">${restaurant.cuisine}</span>
                        <span style="color: #27ae60; font-weight: 700;">${priceSymbol}</span>
                        <span style="color: #ffd700;">${stars}</span>
                        <span>${avgRating}</span>
                    </div>
                `;
                
                restaurantList.appendChild(li);
            });

            // Populate cuisines list
            const cuisineList = document.getElementById('cuisineList');
            cuisineList.innerHTML = '';
            
            const cuisineCounts = {};
            restaurants.forEach(restaurant => {
                cuisineCounts[restaurant.cuisine] = (cuisineCounts[restaurant.cuisine] || 0) + 1;
            });

            Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1]).forEach(([cuisine, count]) => {
                const li = document.createElement('li');
                li.className = 'sidebar-item';
                li.onclick = () => {
                    document.getElementById('filterSelect').value = 'cuisine';
                    currentFilter = 'cuisine';
                    loadMarkers();
                    toggleSidebar();
                    
                    // Filter search to show only this cuisine
                    document.getElementById('searchInput').value = cuisine;
                    const searchEvent = new Event('input', { bubbles: true });
                    document.getElementById('searchInput').dispatchEvent(searchEvent);
                };
                
                li.innerHTML = `
                    <div class="sidebar-item-name" style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <span style="width: 12px; height: 12px; background: ${cuisineColors[cuisine]}; border-radius: 50%; display: inline-block;"></span>
                            ${cuisine}
                        </span>
                        <span style="background: ${cuisineColors[cuisine]}20; color: ${cuisineColors[cuisine]}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;">${count}</span>
                    </div>
                `;
                
                cuisineList.appendChild(li);
            });
        }

        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('star')) {
                const ratingType = e.target.dataset.rating;
                const value = e.target.dataset.value;
                const stars = document.querySelectorAll(`[data-rating="${ratingType}"]`);
                
                stars.forEach((star, index) => {
                    if (index < value) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });
                
                document.getElementById(`${ratingType}Rating`).value = value;
            }
        });

        // Geocode using Google Maps API (GOOGLE_API_KEY is defined in js/config.js)
        async function geocodeAddress(address, restaurantName) {
            if (!address) return null;
            
            const searchQuery = `${address}, Makarska, Croatia`;
            
            try {
                // Try Google Geocoding API
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`
                );
                const data = await response.json();
                
                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    console.log(`Geocoded "${restaurantName}": ${location.lat}, ${location.lng}`);
                    return {
                        lat: location.lat,
                        lng: location.lng
                    };
                } else {
                    console.error(`Geocoding failed for ${restaurantName}: ${data.status}`);
                }
            } catch (error) {
                console.error(`Geocoding failed for ${restaurantName}:`, error);
                console.log('Tips: Kör filen lokalt i din webbläsare för att geocoding ska fungera.');
            }
            return null;
        }

        function loadMarkers() {
            // Remove existing cluster group
            if (markerClusterGroup) {
                map.removeLayer(markerClusterGroup);
            }
            markers = [];
            
            // Create new cluster group
            markerClusterGroup = L.markerClusterGroup({
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: function(cluster) {
                    const count = cluster.getChildCount();
                    let size = 40;
                    if (count >= 10) size = 50;
                    if (count >= 50) size = 60;
                    
                    return L.divIcon({
                        html: `<div style="width: ${size}px; height: ${size}px; background: #2d3436; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid white;">${count}</div>`,
                        className: 'custom-cluster-icon',
                        iconSize: [size, size],
                        iconAnchor: [size/2, size/2]
                    });
                }
            });

            restaurants.forEach(restaurant => {
                const mainCat = restaurant.mainCategory || 'restaurant';
                const icon = mainCategoryIcons[mainCat] || '🍴';
                const iconBg = mainCategoryColors[mainCat] || '#ff6b6b';
                const svg = mainCategorySvg[mainCat] || mainCategorySvg['restaurant'];
                const shortName = restaurant.name.length > 12 ? restaurant.name.substring(0, 11) + '…' : restaurant.name;

                let iconHtml;
                let iconSize;
                let iconAnchor;

                if (currentPinStyle === 'circle-dot') {
                    // Circle + Dot style
                    iconHtml = `<div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 50px; height: 50px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.2); border: 3px solid white;">
                            ${svg}
                        </div>
                        <div style="width: 10px; height: 10px; background: ${iconBg}; border-radius: 50%; margin-top: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
                    </div>`;
                    iconSize = [56, 70];
                    iconAnchor = [28, 66];
                } else {
                    // Float Card style (default)
                    iconHtml = `<div style="display: flex; align-items: center; background: white; border-radius: 20px; padding: 6px 12px 6px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); gap: 8px; white-space: nowrap;">
                        <div style="width: 32px; height: 32px; background: ${iconBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">${icon}</div>
                        <span style="font-size: 12px; font-weight: 700; color: #2d3436;">${shortName}</span>
                    </div>`;
                    iconSize = [140, 44];
                    iconAnchor = [20, 22];
                }

                const emojiIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-emoji-icon',
                    iconSize: iconSize,
                    iconAnchor: iconAnchor
                });

                const marker = L.marker([restaurant.lat, restaurant.lng], { icon: emojiIcon });
                marker.restaurantId = restaurant.id;
                marker.on('click', function() {
                    viewRestaurantWithDishes(restaurant.id);
                });

                markers.push(marker);
                markerClusterGroup.addLayer(marker);
            });
            
            map.addLayer(markerClusterGroup);
        }

        const searchInput = document.getElementById('searchInput');
        const searchDropdown = document.getElementById('searchDropdown');
        let activeDropdownIndex = -1;
        
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            // Filter markers on map
            markers.forEach((marker, index) => {
                const restaurant = restaurants[index];
                if (restaurant.name.toLowerCase().includes(searchTerm) || 
                    restaurant.notes.toLowerCase().includes(searchTerm) ||
                    restaurant.cuisine.toLowerCase().includes(searchTerm)) {
                    marker.setOpacity(1);
                } else {
                    marker.setOpacity(0.3);
                }
            });
            
            // Show dropdown with suggestions
            if (searchTerm.length >= 1) {
                showSearchSuggestions(searchTerm);
            } else {
                hideSearchDropdown();
            }
        });
        
        searchInput.addEventListener('keydown', function(e) {
            const items = searchDropdown.querySelectorAll('.search-dropdown-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeDropdownIndex = Math.min(activeDropdownIndex + 1, items.length - 1);
                updateActiveDropdownItem(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeDropdownIndex = Math.max(activeDropdownIndex - 1, 0);
                updateActiveDropdownItem(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeDropdownIndex >= 0 && items[activeDropdownIndex]) {
                    items[activeDropdownIndex].click();
                }
            } else if (e.key === 'Escape') {
                hideSearchDropdown();
                searchInput.blur();
            }
        });
        
        searchInput.addEventListener('focus', function() {
            const searchTerm = this.value.toLowerCase().trim();
            if (searchTerm.length >= 1) {
                showSearchSuggestions(searchTerm);
            }
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.header-search')) {
                hideSearchDropdown();
            }
        });
        
        function showSearchSuggestions(searchTerm) {
            const q = searchTerm.toLowerCase();

            // Restaurants — name, cuisine, category, notes
            const matchingRestaurants = restaurants.filter(r =>
                r.name.toLowerCase().includes(q) ||
                (r.cuisine || '').toLowerCase().includes(q) ||
                (r.mainCategory || '').toLowerCase().includes(q) ||
                (r.notes || '').toLowerCase().includes(q)
            ).slice(0, 5);

            // Cuisines
            const allCuisines = [...new Set(restaurants.map(r => r.cuisine))];
            const matchingCuisines = allCuisines.filter(c => c.toLowerCase().includes(q)).slice(0, 2);

            // Food items — name, category, subcategory, notes/comments
            let matchingDishes = [];
            restaurants.forEach(r => {
                // From foodItems array
                if (r.foodItems) {
                    r.foodItems.forEach(item => {
                        if (item.name.toLowerCase().includes(q) ||
                            (item.category || '').toLowerCase().includes(q) ||
                            (item.subcategory || '').toLowerCase().includes(q) ||
                            (item.notes || '').toLowerCase().includes(q) ||
                            (item.visits || []).some(v => (v.comment || '').toLowerCase().includes(q))
                        ) {
                            matchingDishes.push({
                                dishName: item.name,
                                url: item.photo || null,
                                rating: item.foodRating || 0,
                                category: item.category,
                                subcategory: item.subcategory,
                                restaurantName: r.name,
                                restaurantId: r.id,
                                foodItemId: item.id
                            });
                        }
                    });
                }
                // From photos array
                if (r.photos) {
                    r.photos.forEach(photo => {
                        if (typeof photo === 'object' && photo.dishName &&
                            (photo.dishName.toLowerCase().includes(q) ||
                             (photo.category || '').toLowerCase().includes(q) ||
                             (photo.subcategory || '').toLowerCase().includes(q) ||
                             (photo.caption || '').toLowerCase().includes(q))
                        ) {
                            matchingDishes.push({ ...photo, restaurantName: r.name, restaurantId: r.id });
                        }
                    });
                }
            });
            matchingDishes = matchingDishes.slice(0, 4);

            if (matchingRestaurants.length === 0 && matchingCuisines.length === 0 && matchingDishes.length === 0) {
                hideSearchDropdown();
                return;
            }

            let html = '';

            // Restaurants section
            if (matchingRestaurants.length > 0) {
                html += '<div class="search-dropdown-section">Restaurants</div>';
                matchingRestaurants.forEach(r => {
                    const imageContent = r.coverPhoto ? `<img src="${r.coverPhoto}" alt="${r.name}">` : getCuisineEmoji(r.cuisine);
                    html += `
                        <div class="search-dropdown-item" onclick="selectSearchRestaurant(${r.id})">
                            <div class="search-dropdown-item-icon">${imageContent}</div>
                            <div class="search-dropdown-item-info">
                                <div class="search-dropdown-item-name">${highlightMatch(r.name, q)}</div>
                                <div class="search-dropdown-item-meta">
                                    <span>${r.cuisine}</span>
                                    <span>⭐ ${((r.foodRating + r.serviceRating) / 2).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>`;
                });
            }

            // Cuisines section
            if (matchingCuisines.length > 0) {
                html += '<div class="search-dropdown-section">Cuisines</div>';
                matchingCuisines.forEach(c => {
                    const count = restaurants.filter(r => r.cuisine === c).length;
                    html += `
                        <div class="search-dropdown-item" onclick="selectSearchCuisine('${c}')">
                            <div class="search-dropdown-item-icon">${getCuisineEmoji(c)}</div>
                            <div class="search-dropdown-item-info">
                                <div class="search-dropdown-item-name">${highlightMatch(c, q)}</div>
                                <div class="search-dropdown-item-meta"><span>${count} restaurant${count !== 1 ? 's' : ''}</span></div>
                            </div>
                        </div>`;
                });
            }

            // Food items section
            if (matchingDishes.length > 0) {
                html += '<div class="search-dropdown-section">Food Items</div>';
                matchingDishes.forEach(d => {
                    const icon = d.url ? `<img src="${d.url}" alt="${d.dishName}">` : `<span style="font-size:20px;">${getCategoryEmoji(d.category)}</span>`;
                    const meta = [d.category, d.subcategory, d.restaurantName].filter(Boolean).join(' · ');
                    html += `
                        <div class="search-dropdown-item" onclick="selectSearchDish(${d.restaurantId})">
                            <div class="search-dropdown-item-icon">${icon}</div>
                            <div class="search-dropdown-item-info">
                                <div class="search-dropdown-item-name">${highlightMatch(d.dishName, q)}</div>
                                <div class="search-dropdown-item-meta"><span>${meta}</span></div>
                            </div>
                        </div>`;
                });
            }

            searchDropdown.innerHTML = html;
            searchDropdown.classList.add('show');
            activeDropdownIndex = -1;
        }
        
        function hideSearchDropdown() {
            searchDropdown.classList.remove('show');
            activeDropdownIndex = -1;
        }
        
        function updateActiveDropdownItem(items) {
            items.forEach((item, i) => {
                item.classList.toggle('active', i === activeDropdownIndex);
            });
            if (items[activeDropdownIndex]) {
                items[activeDropdownIndex].scrollIntoView({ block: 'nearest' });
            }
        }
        
        function highlightMatch(text, searchTerm) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<strong style="color: #ff6b6b;">$1</strong>');
        }
        
        function getCuisineEmoji(cuisine) {
            const emojis = {
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
            };
            return emojis[cuisine] || '🍽️';
        }
        
        function selectSearchRestaurant(id) {
            hideSearchDropdown();
            searchInput.value = '';
            // Reset marker opacity
            markers.forEach(m => m.setOpacity(1));
            // Find and open the restaurant
            const restaurant = restaurants.find(r => r.id === id);
            if (restaurant) {
                const markerIndex = restaurants.indexOf(restaurant);
                if (markers[markerIndex]) {
                    map.setView([restaurant.lat, restaurant.lng], 17);
                    markers[markerIndex].openPopup();
                }
            }
        }
        
        function selectSearchCuisine(cuisine) {
            hideSearchDropdown();
            searchInput.value = cuisine;
            // Filter markers
            markers.forEach((marker, index) => {
                const restaurant = restaurants[index];
                marker.setOpacity(restaurant.cuisine === cuisine ? 1 : 0.3);
            });
        }
        
        function selectSearchDish(restaurantId) {
            hideSearchDropdown();
            searchInput.value = '';
            markers.forEach(m => m.setOpacity(1));
            viewRestaurantWithDishes(restaurantId);
        }

