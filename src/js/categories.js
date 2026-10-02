        let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
        let customSubcategories = JSON.parse(localStorage.getItem('customSubcategories')) || [];
        let customPriceRanges = JSON.parse(localStorage.getItem('customPriceRanges')) || [];

        // Default categories for reference
        const defaultCategories = [
            { id: 'restaurant', name: 'Restaurant', emoji: '🍴' },
            { id: 'dessert', name: 'Dessert', emoji: '🍰' },
            { id: 'icecream', name: 'Ice Cream', emoji: '🍦' },
            { id: 'drinks', name: 'Drinks', emoji: '🍹' }
        ];

        function getAllCategories() {
            return [...defaultCategories, ...customCategories];
        }

        // ===== Custom categories Firestore sync (shared across the dining group) =====
        async function saveCategoriesToFirestore() {
            if (typeof db === 'undefined') return false;
            try {
                await db.collection('userdata').doc('sharedCategories').set({
                    customCategories: customCategories || [],
                    customSubcategories: customSubcategories || [],
                    customPriceRanges: customPriceRanges || []
                });
                return true;
            } catch (e) {
                console.warn('Could not save categories to Firestore:', e.message);
                return false;
            }
        }

        function applyCustomSubcategoriesToFilters() {
            if (typeof filterSubcategories === 'undefined') return;
            customSubcategories.forEach(s => {
                const cid = s.categoryId || s.parentId;
                if (!cid) return;
                if (!filterSubcategories[cid]) filterSubcategories[cid] = [{ id: 'all', label: '🍽️ All' }];
                if (!filterSubcategories[cid].some(x => x.id === s.id)) {
                    filterSubcategories[cid].push({ id: s.id, label: s.label || `${s.emoji} ${s.name}` });
                }
            });
        }

        async function initCategoriesFirestoreSync() {
            if (typeof db === 'undefined') return;
            try {
                const doc = await db.collection('userdata').doc('sharedCategories').get();
                if (doc.exists) {
                    const data = doc.data();
                    if (Array.isArray(data.customCategories)) {
                        customCategories = data.customCategories;
                        localStorage.setItem('customCategories', JSON.stringify(customCategories));
                    }
                    if (Array.isArray(data.customSubcategories)) {
                        customSubcategories = data.customSubcategories;
                        localStorage.setItem('customSubcategories', JSON.stringify(customSubcategories));
                    }
                    if (Array.isArray(data.customPriceRanges)) {
                        customPriceRanges = data.customPriceRanges;
                        localStorage.setItem('customPriceRanges', JSON.stringify(customPriceRanges));
                    }
                    applyCustomSubcategoriesToFilters();
                    if (typeof populateCategoryFilters === 'function') populateCategoryFilters();
                    if (typeof populateSettingsLists === 'function') populateSettingsLists();
                } else if (customCategories.length || customSubcategories.length || customPriceRanges.length) {
                    // First run on cloud: push whatever this device already has.
                    await saveCategoriesToFirestore();
                }
            } catch (e) {
                console.warn('Categories Firestore sync failed:', e.message);
            }
        }

        // Manual "Sync" button: merge cloud + local (no data loss) and save both ways.
        async function syncCategoriesNow(btn) {
            if (typeof db === 'undefined') { alert('Not connected.'); return; }
            const label = btn ? btn.textContent : null;
            if (btn) { btn.textContent = '⏳ Syncing…'; btn.disabled = true; }
            try {
                const doc = await db.collection('userdata').doc('sharedCategories').get();
                const remote = doc.exists ? doc.data() : {};

                const mergeById = (local, incoming, keyFn) => {
                    const map = new Map();
                    (local || []).concat(incoming || []).forEach(item => map.set(keyFn(item), item));
                    return [...map.values()];
                };

                customCategories = mergeById(customCategories, remote.customCategories, c => c.id);
                customSubcategories = mergeById(customSubcategories, remote.customSubcategories,
                    s => (s.categoryId || s.parentId || '') + '::' + s.id);
                customPriceRanges = mergeById(customPriceRanges, remote.customPriceRanges,
                    p => JSON.stringify([p.categoryId, p.subcategoryId, p.level, p.label]));

                localStorage.setItem('customCategories', JSON.stringify(customCategories));
                localStorage.setItem('customSubcategories', JSON.stringify(customSubcategories));
                localStorage.setItem('customPriceRanges', JSON.stringify(customPriceRanges));

                await saveCategoriesToFirestore();
                applyCustomSubcategoriesToFilters();
                if (typeof populateCategoryFilters === 'function') populateCategoryFilters();
                if (typeof populateSettingsLists === 'function') populateSettingsLists();
                populateCategoriesList();

                if (btn) { btn.textContent = '✅ Synced'; setTimeout(() => { btn.textContent = label; btn.disabled = false; }, 1500); }
            } catch (e) {
                console.warn('Manual category sync failed:', e.message);
                alert('Sync failed: ' + e.message);
                if (btn) { btn.textContent = label; btn.disabled = false; }
            }
        }

        function populateSettingsLists() {
            populateCategoriesList();
            populateSubcategoriesList();
            populatePriceRangesList();
            populateCategoryFilters();
        }

        function populateCategoryFilters() {
            const cats = getAllCategories();

            const allBtn = (onclick, cls) =>
                `<button class="${cls} active" data-category="all" onclick="${onclick}('all')">🍽️ All</button>`;
            const catBtn = (cat, onclick, cls) =>
                `<button class="${cls}" data-category="${cat.id}" onclick="${onclick}('${cat.id}')">${cat.emoji} ${cat.name}</button>`;

            const filterMain = document.getElementById('filterMainCategories');
            if (filterMain) {
                filterMain.innerHTML = allBtn('selectFilterMainCategory', 'filter-category-btn')
                    + cats.map(c => catBtn(c, 'selectFilterMainCategory', 'filter-category-btn')).join('');
            }

            const restaurantFilters = document.getElementById('restaurantCategoryFilters');
            if (restaurantFilters) {
                restaurantFilters.innerHTML = allBtn('selectRestaurantCategory', 'dish-filter-btn')
                    + cats.map(c => catBtn(c, 'selectRestaurantCategory', 'dish-filter-btn')).join('');
            }

            const mainFilters = document.getElementById('mainCategoryFilters');
            if (mainFilters) {
                mainFilters.innerHTML = allBtn('selectMainCategory', 'dish-filter-btn')
                    + cats.map(c => catBtn(c, 'selectMainCategory', 'dish-filter-btn')).join('');
            }
        }

        function populateCategoriesList() {
            const container = document.getElementById('categoriesList');
            if (!container) return;
            
            const allCategories = getAllCategories();
            
            if (allCategories.length === 0) {
                container.innerHTML = '<div class="settings-empty">No categories added</div>';
                return;
            }
            
            container.innerHTML = allCategories.map((cat, index) => {
                const isDefault = defaultCategories.some(d => d.id === cat.id);
                return `
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <span class="settings-item-emoji">${cat.emoji}</span>
                            <div>
                                <div class="settings-item-name">${cat.name}</div>
                                <div class="settings-item-meta">${isDefault ? 'Default' : 'Custom'}</div>
                            </div>
                        </div>
                        <div class="settings-item-actions">
                            <button class="settings-item-btn delete" onclick="deleteCategory('${cat.id}', ${isDefault})">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function populateSubcategoriesList() {
            const container = document.getElementById('subcategoriesList');
            
            // Get all subcategories from filterSubcategories and custom
            // Custom subs override defaults with the same ID
            const customSubIds = new Set(customSubcategories.map(s => s.id + '|' + (s.categoryId || s.parentId)));
            let allSubs = [];
            Object.keys(filterSubcategories).forEach(catId => {
                filterSubcategories[catId].forEach(sub => {
                    if (sub.id !== 'all' && !customSubIds.has(sub.id + '|' + catId)) {
                        allSubs.push({ ...sub, categoryId: catId, isDefault: true });
                    }
                });
            });
            customSubcategories.forEach(sub => {
                allSubs.push({ ...sub, isDefault: false });
            });
            
            if (allSubs.length === 0) {
                container.innerHTML = '<div class="settings-empty">No subcategories added</div>';
                return;
            }
            
            container.innerHTML = allSubs.map(sub => {
                const category = getAllCategories().find(c => c.id === sub.categoryId);
                return `
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <span class="settings-item-emoji">${sub.label.split(' ')[0]}</span>
                            <div>
                                <div class="settings-item-name">${sub.label.split(' ').slice(1).join(' ') || sub.id}</div>
                                <div class="settings-item-meta">${category ? category.name : sub.categoryId} • ${sub.isDefault ? 'Default' : 'Custom'}</div>
                            </div>
                        </div>
                        <div class="settings-item-actions">
                            <button class="settings-item-btn delete" onclick="deleteSubcategory('${sub.id}', '${sub.categoryId}', ${sub.isDefault})">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function populatePriceRangesList() {
            const container = document.getElementById('priceRangesList');
            
            if (customPriceRanges.length === 0) {
                container.innerHTML = '<div class="settings-empty">No custom price ranges added. Using defaults.</div>';
                return;
            }
            
            container.innerHTML = customPriceRanges.map((pr, index) => {
                const targetName = pr.subcategoryId || pr.categoryId;
                return `
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <span class="settings-item-emoji">${pr.label}</span>
                            <div>
                                <div class="settings-item-name">${pr.desc}</div>
                                <div class="settings-item-meta">Level ${pr.level} • ${targetName}</div>
                            </div>
                        </div>
                        <div class="settings-item-actions">
                            <button class="settings-item-btn delete" onclick="deletePriceRange(${index})">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Modal functions
        function selectEmoji(inputId, emoji) {
            document.getElementById(inputId).value = emoji;
            
            // Highlight selected emoji
            const picker = document.getElementById(inputId + 'Picker') || 
                           document.getElementById(inputId.replace('Emoji', '') + 'EmojiPicker');
            if (picker) {
                picker.querySelectorAll('span').forEach(span => {
                    span.classList.remove('selected');
                    if (span.textContent === emoji) {
                        span.classList.add('selected');
                    }
                });
            }
        }

        function openAddCategoryModal() {
            document.getElementById('addCategoryModal').style.display = 'block';
            document.getElementById('categoryForm').reset();
            // Clear emoji selection
            document.querySelectorAll('#categoryEmojiPicker span').forEach(s => s.classList.remove('selected'));
        }

        function closeAddCategoryModal() {
            document.getElementById('addCategoryModal').style.display = 'none';
        }

        function openAddSubcategoryModal() {
            document.getElementById('addSubcategoryModal').style.display = 'block';
            document.getElementById('subcategoryForm').reset();
            // Clear emoji selection
            document.querySelectorAll('#subcategoryEmojiPicker span').forEach(s => s.classList.remove('selected'));
            
            // Populate parent category dropdown
            const select = document.getElementById('parentCategory');
            select.innerHTML = '<option value="">Select category...</option>' + 
                getAllCategories().map(cat => `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`).join('');
        }

        function closeAddSubcategoryModal() {
            document.getElementById('addSubcategoryModal').style.display = 'none';
        }

        function openAddPriceRangeModal() {
            document.getElementById('addPriceRangeModal').style.display = 'block';
            document.getElementById('priceRangeForm').reset();
            document.getElementById('priceRangeCategoryGroup').style.display = 'none';
            document.getElementById('priceRangeSubcategoryGroup').style.display = 'none';
            
            // Populate category dropdown
            const catSelect = document.getElementById('priceRangeCategory');
            catSelect.innerHTML = '<option value="">Select category...</option>' + 
                getAllCategories().map(cat => `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`).join('');
        }

        function closeAddPriceRangeModal() {
            document.getElementById('addPriceRangeModal').style.display = 'none';
        }

        function updatePriceRangeTargetOptions() {
            const target = document.getElementById('priceRangeTarget').value;
            document.getElementById('priceRangeCategoryGroup').style.display = target ? 'block' : 'none';
            document.getElementById('priceRangeSubcategoryGroup').style.display = target === 'subcategory' ? 'block' : 'none';
            
            if (target === 'subcategory') {
                // Populate subcategory dropdown when category changes
                document.getElementById('priceRangeCategory').onchange = function() {
                    const catId = this.value;
                    const subSelect = document.getElementById('priceRangeSubcategory');
                    const subs = filterSubcategories[catId] || [];
                    const customSubs = customSubcategories.filter(s => s.categoryId === catId);
                    const allSubs = [...subs.filter(s => s.id !== 'all'), ...customSubs];
                    
                    subSelect.innerHTML = '<option value="">Select subcategory...</option>' + 
                        allSubs.map(sub => `<option value="${sub.id}">${sub.label}</option>`).join('');
                };
            }
        }

        // Save functions
        function saveCategory() {
            const name = document.getElementById('categoryName').value.trim();
            const emoji = document.getElementById('categoryEmoji').value.trim();
            
            if (!name || !emoji) {
                alert('Please fill in all fields');
                return;
            }
            
            const id = name.toLowerCase().replace(/\s+/g, '-');
            
            // Check if already exists
            if (getAllCategories().some(c => c.id === id)) {
                alert('Category already exists');
                return;
            }
            
            customCategories.push({ id, name, emoji });
            localStorage.setItem('customCategories', JSON.stringify(customCategories));
            saveCategoriesToFirestore();
            
            closeAddCategoryModal();
            populateCategoriesList();
            populateCategoryFilters();
        }

        function saveSubcategory() {
            const categoryId = document.getElementById('parentCategory').value;
            const name = document.getElementById('subcategoryName').value.trim();
            const emoji = document.getElementById('subcategoryEmoji').value.trim();
            
            if (!categoryId || !name || !emoji) {
                alert('Please fill in all fields');
                return;
            }
            
            const id = name.toLowerCase().replace(/\s+/g, '-');
            const group = document.getElementById('subcategoryGroup').value.trim();
            
            customSubcategories.push({ 
                id, 
                name,
                emoji,
                label: `${emoji} ${name}`,
                categoryId,
                parentId: categoryId,
                group: group || ''
            });
            localStorage.setItem('customSubcategories', JSON.stringify(customSubcategories));
            
            // Add to filterSubcategories for immediate use
            if (!filterSubcategories[categoryId]) {
                filterSubcategories[categoryId] = [{ id: 'all', label: '🍽️ All' }];
            }
            filterSubcategories[categoryId].push({ id, label: `${emoji} ${name}` });
            saveCategoriesToFirestore();
            
            closeAddSubcategoryModal();
            populateSubcategoriesList();
        }

        function savePriceRange(e) {
            e.preventDefault();
            
            const target = document.getElementById('priceRangeTarget').value;
            const categoryId = document.getElementById('priceRangeCategory').value;
            const subcategoryId = target === 'subcategory' ? document.getElementById('priceRangeSubcategory').value : null;
            const level = parseInt(document.getElementById('priceRangeLevel').value);
            const label = document.getElementById('priceRangeLabel').value.trim();
            const desc = document.getElementById('priceRangeDesc').value.trim();
            
            if (!categoryId || !label || !desc) {
                alert('Please fill in all fields');
                return;
            }
            
            customPriceRanges.push({
                categoryId,
                subcategoryId,
                level,
                label,
                desc
            });
            localStorage.setItem('customPriceRanges', JSON.stringify(customPriceRanges));
            saveCategoriesToFirestore();
            
            closeAddPriceRangeModal();
            populateSettingsLists();
        }

        // Delete functions
        function deleteCategory(id, isDefault) {
            if (!confirm('Delete this category?')) return;
            
            if (isDefault) {
                // Remove from defaultCategories array
                const idx = defaultCategories.findIndex(c => c.id === id);
                if (idx !== -1) {
                    defaultCategories.splice(idx, 1);
                }
            } else {
                customCategories = customCategories.filter(c => c.id !== id);
                localStorage.setItem('customCategories', JSON.stringify(customCategories));
                saveCategoriesToFirestore();
            }
            populateCategoriesList();
        }

        function deleteSubcategory(id, categoryId, isDefault) {
            if (!confirm('Delete this subcategory?')) return;
            
            if (isDefault) {
                // Remove from filterSubcategories
                if (filterSubcategories[categoryId]) {
                    filterSubcategories[categoryId] = filterSubcategories[categoryId].filter(s => s.id !== id);
                }
            } else {
                customSubcategories = customSubcategories.filter(s => !(s.id === id && s.categoryId === categoryId));
                localStorage.setItem('customSubcategories', JSON.stringify(customSubcategories));
                saveCategoriesToFirestore();
                
                // Remove from filterSubcategories
                if (filterSubcategories[categoryId]) {
                    filterSubcategories[categoryId] = filterSubcategories[categoryId].filter(s => s.id !== id);
                }
            }
            
            populateSubcategoriesList();
        }

        function deletePriceRange(index) {
            if (!confirm('Delete this price range?')) return;
            
            customPriceRanges.splice(index, 1);
            localStorage.setItem('customPriceRanges', JSON.stringify(customPriceRanges));
            saveCategoriesToFirestore();
            populateSettingsLists();
        }

        window.addEventListener('load', function() {
            // Migration: Remove cover photos from photos array (one-time cleanup)
            let needsSave = false;
            restaurants.forEach(restaurant => {
                if (restaurant.coverPhoto && restaurant.photos && restaurant.photos.length > 0) {
                    // Filter out any photo that matches the cover photo
                    const originalLength = restaurant.photos.length;
                    restaurant.photos = restaurant.photos.filter(photo => {
                        const photoUrl = typeof photo === 'object' ? photo.url : photo;
                        return photoUrl !== restaurant.coverPhoto;
                    });
                    if (restaurant.photos.length !== originalLength) {
                        needsSave = true;
                    }
                }
            });
            if (needsSave) {
                localStorage.setItem('restaurants', JSON.stringify(restaurants));
            }
            
            setTimeout(initMap, 100);
            // Populate category filters from saved categories
            populateCategoryFilters();
            // Show floating add button on home page by default
            const floatingAddBtn = document.getElementById('floatingAddBtn');
            if (floatingAddBtn) floatingAddBtn.classList.add('show');
        });

        // ==================== AUTH & GROUPS FUNCTIONS ====================
        
        // Default group with all restaurant data
