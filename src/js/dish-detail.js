        function viewDishDetail(dish) {
            try {
                const modal = document.getElementById('dishDetailModal');
                const imageHeader = document.getElementById('dishDetailImage');
                const body = document.getElementById('dishDetailBody');

                if (!modal || !imageHeader || !body) return;

                // Build visits array from legacy or new format
                const visits = dish.visits && dish.visits.length
                    ? dish.visits
                    : [{
                        date: dish.visitDate || '',
                        year: dish.visitDate ? new Date(dish.visitDate).getFullYear() : '',
                        cost: dish.price || '',
                        tasteRating: dish.foodRating || 0,
                        serviceRating: dish.serviceRating || 0,
                        waitTime: '',
                        comment: dish.notes || '',
                        photo: dish.photo || null
                    }];

                // Cover photo: item.photo (direct), or first visit with a photo
                const coverPhoto = dish.photo || visits.find(v => v.photo)?.photo || null;
                if (coverPhoto) {
                    imageHeader.innerHTML = `<img src="${coverPhoto}" style="width:100%;height:100%;object-fit:cover;" alt="Food photo">
                        ${dish.foodItemId ? `<div style="position:absolute;bottom:10px;right:10px;display:flex;gap:6px;">
                            <button onclick="triggerDishPhotoCamera(${dish.restaurantId},${dish.foodItemId})" style="background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:36px;height:36px;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);">📷</button>
                            <button onclick="triggerDishPhotoGallery(${dish.restaurantId},${dish.foodItemId})" style="background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:36px;height:36px;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);">🖼️</button>
                        </div>` : ''}`;
                } else {
                    imageHeader.innerHTML = `<span style="font-size:100px;">${dish.emoji || '🍽️'}</span>
                        ${dish.foodItemId ? `<div style="position:absolute;bottom:10px;right:10px;display:flex;gap:6px;">
                            <button onclick="triggerDishPhotoCamera(${dish.restaurantId},${dish.foodItemId})" style="background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:36px;height:36px;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);">📷</button>
                            <button onclick="triggerDishPhotoGallery(${dish.restaurantId},${dish.foodItemId})" style="background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:36px;height:36px;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);">🖼️</button>
                        </div>` : ''}`;
                }

                // Averages
                const tasteAvg = visits.filter(v => v.tasteRating > 0).reduce((s, v, _, a) => s + v.tasteRating / a.length, 0);
                const svcAvg = visits.filter(v => v.serviceRating > 0).reduce((s, v, _, a) => s + v.serviceRating / a.length, 0);

                // Visit log HTML
                // visits reversed for display, but we need the real index for editing
                const reversedVisits = visits.slice().reverse();
                const visitsHtml = reversedVisits.map((v, displayIdx) => {
                    const realIdx = visits.length - 1 - displayIdx;
                    return `
                    <div style="background:#f8f9fa;border-radius:12px;padding:12px 14px;margin-bottom:10px;border-left:3px solid #ff6b6b;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="font-weight:700;font-size:13px;color:#2d3436;">📅 ${v.date ? new Date(v.date).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : 'Unknown date'}</span>
                            <div style="display:flex;gap:6px;align-items:center;">
                                ${v.cost ? `<span style="background:#e8f5e9;color:#27ae60;font-weight:700;font-size:12px;padding:2px 8px;border-radius:20px;">💰 ${v.cost}</span>` : ''}
                                ${dish.restaurantId && dish.foodItemId ? `<button onclick="editVisit(${dish.restaurantId},${dish.foodItemId},${realIdx})" style="background:none;border:none;font-size:14px;cursor:pointer;padding:2px 4px;" title="Edit visit">✏️</button>` : ''}
                            </div>
                        </div>
                        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:6px;font-size:12px;">
                            ${v.tasteRating ? `<span>😋 Taste: ${starsHtml(v.tasteRating, 5)}</span>` : ''}
                            ${v.serviceRating ? `<span>🤝 Service: ${starsHtml(v.serviceRating, 5)}</span>` : ''}
                            ${v.waitTime ? `<span>🕐 Wait: <strong>${v.waitTime === 'Fast' ? '⚡ Fast' : v.waitTime === 'Slow' ? '🐢 Slow' : '👌 OK'}</strong></span>` : ''}
                        </div>
                        ${v.comment ? `<div style="font-size:12px;color:#636e72;font-style:italic;">&ldquo;${v.comment}&rdquo;</div>` : ''}
                        ${v.photo ? `<img src="${v.photo}" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:8px;">` : ''}
                    </div>
                `}).join('');

                body.innerHTML = `
                    <h2 class="dish-detail-title">${dish.name} ${dish.foodItemId ? `<button onclick="editFoodItemName(${dish.restaurantId},${dish.foodItemId})" style="background:none;border:none;font-size:16px;cursor:pointer;vertical-align:middle;" title="Edit dish name">✏️</button>` : ''}</h2>
                    <div class="dish-detail-restaurant">📍 ${dish.restaurant || ''}</div>

                    <div class="dish-info-grid" style="margin:14px 0;">
                        <div class="dish-info-row">
                            <span class="dish-info-label">Category</span>
                            <span class="dish-info-value">${dish.category || ''}</span>
                        </div>
                        <div class="dish-info-row">
                            <span class="dish-info-label">Visits</span>
                            <span class="dish-info-value" style="font-weight:700;">🔁 ${visits.length}×</span>
                        </div>
                        ${tasteAvg > 0 ? `
                        <div class="dish-info-row">
                            <span class="dish-info-label">Avg Taste</span>
                            <span class="dish-info-value">${starsHtml(tasteAvg, 5)} <span style="color:#888;font-size:11px;">${tasteAvg.toFixed(1)}</span></span>
                        </div>` : ''}
                        ${svcAvg > 0 ? `
                        <div class="dish-info-row">
                            <span class="dish-info-label">Avg Service</span>
                            <span class="dish-info-value">${starsHtml(svcAvg, 5)} <span style="color:#888;font-size:11px;">${svcAvg.toFixed(1)}</span></span>
                        </div>` : ''}
                    </div>

                    ${dish.foodItemId ? `
                    <button onclick="openAddVisitForm()" style="width:100%;padding:11px;margin-bottom:16px;background:linear-gradient(135deg,#ff6b6b,#ff8787);color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;">
                        + Add New Visit
                    </button>
                    <div id="addVisitForm" style="display:none;background:#fff8f8;border:1.5px solid #ff6b6b;border-radius:14px;padding:14px;margin-bottom:16px;">
                        <div style="font-weight:700;font-size:13px;margin-bottom:10px;color:#e55039;">🗓️ New Visit</div>
                        <div style="margin-bottom:8px;">
                            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Date</label>
                            <input type="date" id="visitNewDate" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:13px;">
                        </div>
                        <div style="margin-bottom:8px;">
                            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">😋 Taste</label>
                            <div id="visitTasteStars" style="font-size:24px;cursor:pointer;">
                                <span onclick="setVisitStar('taste',1)" id="vts1">☆</span>
                                <span onclick="setVisitStar('taste',2)" id="vts2">☆</span>
                                <span onclick="setVisitStar('taste',3)" id="vts3">☆</span>
                                <span onclick="setVisitStar('taste',4)" id="vts4">☆</span>
                                <span onclick="setVisitStar('taste',5)" id="vts5">☆</span>
                            </div>
                            <input type="hidden" id="visitTasteRating" value="0">
                        </div>
                        <div style="margin-bottom:8px;">
                            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">🤝 Service</label>
                            <div id="visitServiceStars" style="font-size:24px;cursor:pointer;">
                                <span onclick="setVisitStar('service',1)" id="vss1">☆</span>
                                <span onclick="setVisitStar('service',2)" id="vss2">☆</span>
                                <span onclick="setVisitStar('service',3)" id="vss3">☆</span>
                                <span onclick="setVisitStar('service',4)" id="vss4">☆</span>
                                <span onclick="setVisitStar('service',5)" id="vss5">☆</span>
                            </div>
                            <input type="hidden" id="visitServiceRating" value="0">
                        </div>
                        <div style="margin-bottom:8px;">
                            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">🕐 Wait time</label>
                            <select id="visitWaitTime" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:13px;">
                                <option value="">Not rated</option>
                                <option value="Fast">⚡ Fast</option>
                                <option value="OK">👌 OK</option>
                                <option value="Slow">🐢 Slow</option>
                            </select>
                        </div>
                        <div style="margin-bottom:8px;">
                            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">💰 Cost</label>
                            <input type="text" id="visitCost" placeholder="e.g., €15" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:13px;box-sizing:border-box;">
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">📝 Comment</label>
                            <textarea id="visitComment" placeholder="How was it this time?" rows="2" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:13px;resize:vertical;box-sizing:border-box;"></textarea>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button onclick="saveNewVisit(${dish.restaurantId}, ${dish.foodItemId})" style="flex:1;padding:10px;background:#ff6b6b;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">Save Visit</button>
                            <button onclick="document.getElementById('addVisitForm').style.display='none'" style="padding:10px 16px;background:#eee;color:#555;border:none;border-radius:10px;font-size:13px;cursor:pointer;">Cancel</button>
                        </div>
                    </div>` : ''}

                    <div style="margin-top:4px;">
                        <div style="font-weight:700;font-size:13px;color:#2d3436;margin-bottom:8px;">📋 Visit History</div>
                        ${visitsHtml || '<div style="color:#aaa;font-size:13px;">No visits recorded yet.</div>'}
                    </div>
                `;

                modal.style.display = 'block';
            } catch (error) {
                console.error('Error displaying dish detail:', error);
            }
        }

        function closeDishDetail() {
            document.getElementById('dishDetailModal').style.display = 'none';
        }

        function editFoodItemName(restaurantId, foodItemId) {
            const restaurant = restaurants.find(r => r.id === restaurantId);
            const item = restaurant && restaurant.foodItems && restaurant.foodItems.find(f => f.id === foodItemId);
            if (!item) return;

            function getSubsForCat(catId) {
                const defs = (filterSubcategories[catId] || []).filter(s => s.id !== 'all');
                const cust = (JSON.parse(localStorage.getItem('customSubcategories')) || []).filter(s => s.parentId === catId || s.categoryId === catId);
                const custIds = new Set(cust.map(s => s.id));
                return [...defs.filter(s => !custIds.has(s.id)).map(s => ({ id: s.id, label: s.label })),
                        ...cust.map(s => ({ id: s.id, label: (s.emoji||'') + ' ' + (s.name||s.label) }))];
            }

            const catOptions = getAllCategories().map(c =>
                `<option value="${c.id}" ${(item.category||'')===c.id?'selected':''}>${c.emoji} ${c.name}</option>`).join('');
            const subOptions = `<option value="">No subcategory</option>` +
                getSubsForCat(item.category||'').map(s =>
                    `<option value="${s.id}" ${(item.subcategory||'')===s.id?'selected':''}>${s.label}</option>`).join('');

            const old = document.getElementById('_editDishOverlay');
            if (old) old.remove();

            const overlay = document.createElement('div');
            overlay.id = '_editDishOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:70000;display:flex;align-items:flex-end;justify-content:center;';
            overlay.innerHTML = `
                <div style="background:white;border-radius:24px 24px 0 0;padding:20px;width:100%;max-width:540px;max-height:85vh;overflow-y:auto;">
                    <div style="font-weight:700;font-size:16px;margin-bottom:16px;">✏️ Edit Dish</div>
                    <div style="margin-bottom:12px;">
                        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Dish Name</label>
                        <input type="text" id="ei_name" value="${item.name||''}" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;font-size:14px;box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Category</label>
                        <select id="ei_category" onchange="refreshEditItemSubs(${restaurantId},${foodItemId})" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;font-size:14px;height:44px;box-sizing:border-box;">
                            <option value="">Choose category...</option>${catOptions}
                        </select>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Subcategory</label>
                        <select id="ei_subcategory" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;font-size:14px;height:44px;box-sizing:border-box;">
                            ${subOptions}
                        </select>
                    </div>
                    <div style="display:flex;gap:8px;padding-bottom:env(safe-area-inset-bottom);">
                        <button onclick="saveEditFoodItem(${restaurantId},${foodItemId})" style="flex:1;padding:12px;background:#ff6b6b;color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;">Save</button>
                        <button onclick="document.getElementById('_editDishOverlay').remove()" style="padding:12px 20px;background:#eee;color:#555;border:none;border-radius:10px;cursor:pointer;">Cancel</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        }

        function refreshEditItemSubs(restaurantId, foodItemId) {
            const catId = document.getElementById('ei_category').value;
            const subSel = document.getElementById('ei_subcategory');
            const defaults = (filterSubcategories[catId] || []).filter(s => s.id !== 'all');
            const custom = (JSON.parse(localStorage.getItem('customSubcategories')) || [])
                .filter(s => s.parentId === catId || s.categoryId === catId);
            const customIds = new Set(custom.map(s => s.id));
            const allSubs = [
                ...defaults.filter(s => !customIds.has(s.id)).map(s => ({ id: s.id, label: s.label })),
                ...custom.map(s => ({ id: s.id, label: (s.emoji||'') + ' ' + (s.name||s.label) }))
            ];
            subSel.innerHTML = `<option value="">No subcategory</option>` +
                allSubs.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        }

        function saveEditFoodItem(restaurantId, foodItemId) {
            const overlayEl = document.getElementById('_editDishOverlay');
            const restaurant = restaurants.find(r => r.id === restaurantId);
            const item = restaurant && restaurant.foodItems && restaurant.foodItems.find(f => f.id === foodItemId);
            if (!item) return;
            const newName = document.getElementById('ei_name').value.trim();
            if (!newName) { alert('Please enter a name'); return; }
            item.name = newName;
            item.category = document.getElementById('ei_category').value || item.category;
            item.subcategory = document.getElementById('ei_subcategory').value;
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            saveRestaurantToFirestore(restaurant);
            if (overlayEl) overlayEl.remove();
            closeDishDetail();
            setTimeout(() => viewDishDetail({ name: item.name, restaurant: restaurant.name, restaurantId, foodItemId: item.id, category: item.subcategory || item.category || '', mainCategory: item.category || '', emoji: getCategoryEmoji(item.category || 'food'), visits: item.visits || null }), 100);
        }

        function editVisit(restaurantId, foodItemId, visitIndex) {
            const restaurant = restaurants.find(r => r.id === restaurantId);
            const item = restaurant && restaurant.foodItems && restaurant.foodItems.find(f => f.id === foodItemId);
            if (!item || !item.visits || !item.visits[visitIndex]) return;
            const v = item.visits[visitIndex];

            // Build edit overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:70000;display:flex;align-items:flex-end;justify-content:center;';
            overlay.innerHTML = `
                <div style="background:white;border-radius:24px 24px 0 0;padding:20px;width:100%;max-width:540px;max-height:85vh;overflow-y:auto;">
                    <div style="font-weight:700;font-size:16px;margin-bottom:16px;">✏️ Edit Visit</div>
                    <div style="margin-bottom:8px;"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Date</label>
                        <input type="date" id="ev_date" value="${v.date || ''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:13px;"></div>
                    <div style="margin-bottom:8px;"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">😋 Taste</label>
                        <div style="font-size:24px;cursor:pointer;">
                            ${[1,2,3,4,5].map(n => `<span onclick="evStar('taste',${n})" id="ev_ts${n}">${n <= (v.tasteRating||0) ? '★' : '☆'}</span>`).join('')}
                        </div>
                        <input type="hidden" id="ev_taste" value="${v.tasteRating||0}"></div>
                    <div style="margin-bottom:8px;"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">🤝 Service</label>
                        <div style="font-size:24px;cursor:pointer;">
                            ${[1,2,3,4,5].map(n => `<span onclick="evStar('service',${n})" id="ev_ss${n}">${n <= (v.serviceRating||0) ? '★' : '☆'}</span>`).join('')}
                        </div>
                        <input type="hidden" id="ev_service" value="${v.serviceRating||0}"></div>
                    <div style="margin-bottom:8px;"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">🕐 Wait time</label>
                        <select id="ev_wait" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:13px;">
                            <option value="" ${!v.waitTime?'selected':''}>Not rated</option>
                            <option value="Fast" ${v.waitTime==='Fast'?'selected':''}>⚡ Fast</option>
                            <option value="OK" ${v.waitTime==='OK'?'selected':''}>👌 OK</option>
                            <option value="Slow" ${v.waitTime==='Slow'?'selected':''}>🐢 Slow</option>
                        </select></div>
                    <div style="margin-bottom:8px;"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">💰 Cost</label>
                        <input type="text" id="ev_cost" value="${v.cost||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:13px;box-sizing:border-box;"></div>
                    <div style="margin-bottom:16px;"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">📝 Comment</label>
                        <textarea id="ev_comment" rows="2" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:13px;resize:vertical;box-sizing:border-box;">${v.comment||''}</textarea></div>
                    <div style="display:flex;gap:8px;padding-bottom:env(safe-area-inset-bottom);">
                        <button onclick="saveEditVisit(${restaurantId},${foodItemId},${visitIndex},this.closest('div[style*=inset]'))" style="flex:1;padding:12px;background:#ff6b6b;color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;">Save</button>
                        <button onclick="this.closest('div[style*=inset]').remove()" style="padding:12px 20px;background:#eee;color:#555;border:none;border-radius:10px;cursor:pointer;">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        }

        function evStar(type, val) {
            const pre = type === 'taste' ? 'ev_ts' : 'ev_ss';
            const hid = type === 'taste' ? 'ev_taste' : 'ev_service';
            document.getElementById(hid).value = val;
            for (let i = 1; i <= 5; i++) {
                const el = document.getElementById(pre + i);
                if (el) el.textContent = i <= val ? '★' : '☆';
            }
        }

        function saveEditVisit(restaurantId, foodItemId, visitIndex, overlayEl) {
            const restaurant = restaurants.find(r => r.id === restaurantId);
            const item = restaurant && restaurant.foodItems && restaurant.foodItems.find(f => f.id === foodItemId);
            if (!item || !item.visits || !item.visits[visitIndex]) return;
            const v = item.visits[visitIndex];
            v.date = document.getElementById('ev_date').value || v.date;
            v.year = v.date ? new Date(v.date).getFullYear() : v.year;
            v.tasteRating = parseInt(document.getElementById('ev_taste').value) || 0;
            v.serviceRating = parseInt(document.getElementById('ev_service').value) || 0;
            v.waitTime = document.getElementById('ev_wait').value;
            v.cost = document.getElementById('ev_cost').value;
            v.comment = document.getElementById('ev_comment').value;
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            saveRestaurantToFirestore(restaurant);
            if (overlayEl) overlayEl.remove();
            closeDishDetail();
            setTimeout(() => viewDishDetail({ name: item.name, restaurant: restaurant.name, restaurantId, foodItemId: item.id, category: item.subcategory || item.category || '', mainCategory: item.category || '', emoji: getCategoryEmoji(item.category || 'food'), visits: item.visits }), 100);
        }

        // ---- Dish cover photo change ----
        let _dishPhotoTarget = null; // { restaurantId, foodItemId }

        function triggerDishPhotoCamera(restaurantId, foodItemId) {
            _dishPhotoTarget = { restaurantId, foodItemId };
            if (isNativeApp()) {
                takeNativePhoto(b64 => saveDishPhoto(b64));
            } else {
                let inp = document.getElementById('_dishPhotoCameraInput');
                if (!inp) {
                    inp = document.createElement('input');
                    inp.type = 'file'; inp.id = '_dishPhotoCameraInput';
                    inp.accept = 'image/*'; inp.setAttribute('capture', 'environment');
                    inp.style.display = 'none';
                    inp.onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => compressImage(ev.target.result, 800, 0.8, saveDishPhoto); r.readAsDataURL(f); e.target.value = ''; };
                    document.body.appendChild(inp);
                }
                inp.click();
            }
        }

        function triggerDishPhotoGallery(restaurantId, foodItemId) {
            _dishPhotoTarget = { restaurantId, foodItemId };
            if (isNativeApp()) {
                pickNativePhoto(b64 => saveDishPhoto(b64));
            } else {
                let inp = document.getElementById('_dishPhotoGalleryInput');
                if (!inp) {
                    inp = document.createElement('input');
                    inp.type = 'file'; inp.id = '_dishPhotoGalleryInput';
                    inp.accept = 'image/*'; inp.style.display = 'none';
                    inp.onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => compressImage(ev.target.result, 800, 0.8, saveDishPhoto); r.readAsDataURL(f); e.target.value = ''; };
                    document.body.appendChild(inp);
                }
                inp.click();
            }
        }

        async function saveDishPhoto(base64) {
            if (!_dishPhotoTarget) return;
            const { restaurantId, foodItemId } = _dishPhotoTarget;
            const restaurant = restaurants.find(r => r.id === restaurantId);
            const item = restaurant && restaurant.foodItems && restaurant.foodItems.find(f => f.id === foodItemId);
            if (!item) return;
            const url = await uploadPhoto(base64, storagePhotoPath(restaurantId, `food/${foodItemId}`, 'cover.jpg'));
            item.photo = url;
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            saveRestaurantToFirestore(restaurant);
            _dishPhotoTarget = null;
            closeDishDetail();
            setTimeout(() => viewDishDetail({ name: item.name, restaurant: restaurant.name, restaurantId, foodItemId: item.id, category: item.subcategory || item.category || '', mainCategory: item.category || '', emoji: getCategoryEmoji(item.category || 'food'), visits: item.visits || null, photo: item.photo }), 100);
        }

        function openAddVisitForm() {
            const form = document.getElementById('addVisitForm');
            if (!form) return;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            // Set today's date
            const d = document.getElementById('visitNewDate');
            if (d && !d.value) d.valueAsDate = new Date();
        }

        function setVisitStar(type, val) {
            const prefix = type === 'taste' ? 'vts' : 'vss';
            const hiddenId = type === 'taste' ? 'visitTasteRating' : 'visitServiceRating';
            document.getElementById(hiddenId).value = val;
            for (let i = 1; i <= 5; i++) {
                const el = document.getElementById(prefix + i);
                if (el) el.textContent = i <= val ? '★' : '☆';
            }
        }

        function saveNewVisit(restaurantId, foodItemId) {
            const date = document.getElementById('visitNewDate').value;
            if (!date) { alert('Please select a date'); return; }
            const tasteRating = parseInt(document.getElementById('visitTasteRating').value) || 0;
            if (!tasteRating) { alert('Please rate the taste'); return; }

            const visitEntry = {
                date: date,
                year: new Date(date).getFullYear(),
                cost: document.getElementById('visitCost').value,
                tasteRating: tasteRating,
                serviceRating: parseInt(document.getElementById('visitServiceRating').value) || 0,
                waitTime: document.getElementById('visitWaitTime').value,
                comment: document.getElementById('visitComment').value,
                photo: null
            };

            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (!restaurant) { alert('Restaurant not found'); return; }
            const foodItem = restaurant.foodItems && restaurant.foodItems.find(f => f.id === foodItemId);
            if (!foodItem) { alert('Food item not found'); return; }

            if (!foodItem.visits) {
                foodItem.visits = [{
                    date: foodItem.visitDate || '',
                    year: foodItem.visitDate ? new Date(foodItem.visitDate).getFullYear() : '',
                    cost: foodItem.price || '',
                    tasteRating: foodItem.foodRating || 0,
                    serviceRating: foodItem.serviceRating || 0,
                    waitTime: '',
                    comment: foodItem.notes || '',
                    photo: foodItem.photo || null
                }];
            }
            foodItem.visits.push(visitEntry);
            // Update legacy fields with latest visit
            foodItem.visitDate = date;
            foodItem.price = visitEntry.cost || foodItem.price;
            foodItem.foodRating = tasteRating;
            foodItem.serviceRating = visitEntry.serviceRating || foodItem.serviceRating;

            localStorage.setItem('restaurants', JSON.stringify(restaurants));

            // Re-open detail with updated data
            closeDishDetail();
            setTimeout(() => {
                const updatedDish = {
                    name: foodItem.name,
                    restaurant: restaurant.name,
                    restaurantId: restaurant.id,
                    foodItemId: foodItem.id,
                    mainCategory: foodItem.category,
                    category: foodItem.subcategory || foodItem.category,
                    emoji: getCategoryEmoji(foodItem.category),
                    visits: foodItem.visits
                };
                viewDishDetail(updatedDish);
            }, 100);
        }

