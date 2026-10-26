/**
 * catalog.js - Mock Up L11: Formulir Manajemen Katalog & Stok
 * Handles Menu Catalog CRUD, Instant Stock Toggling,
 * File Reader Photo Upload Preview, and Strict Client-Side Form Validation (Item 2.c).
 */

const CatalogModule = {
  currentFilter: 'ALL',
  searchQuery: '',
  editingMenuId: null,
  uploadedImageBase64: null,

  init() {
    this.render();
    this.bindEvents();
    this.bindFormValidation();
  },

  bindEvents() {
    // Filter Tabs Click
    document.querySelectorAll('.btn-catalog-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-catalog-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter || 'ALL';
        this.render();
      });
    });

    // Search Input
    const searchInput = document.getElementById('catalogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Open Add Menu Modal
    const btnOpenAdd = document.getElementById('btnOpenAddMenu');
    if (btnOpenAdd) {
      btnOpenAdd.onclick = () => {
        this.openMenuModal(null);
      };
    }

    // Real-time Rupiah preview in form
    const priceInput = document.getElementById('menuPriceInput');
    const pricePreview = document.getElementById('menuPricePreview');
    if (priceInput && pricePreview) {
      priceInput.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val > 0) {
          pricePreview.innerText = `Preview: Rp ${val.toLocaleString('id-ID')}`;
          pricePreview.style.color = '#38bdf8';
        } else {
          pricePreview.innerText = 'Format: angka tanpa titik/koma';
          pricePreview.style.color = 'var(--text-dim)';
        }
      };
    }

    // Image Upload & Drag-and-drop
    this.bindImageUpload();
  },

  bindImageUpload() {
    const dropzone = document.getElementById('menuImageDropzone');
    const fileInput = document.getElementById('menuImageFile');
    const previewBox = document.getElementById('menuImagePreviewBox');
    const previewImg = document.getElementById('menuImagePreviewImg');
    const btnRemove = document.getElementById('btnRemovePhoto');

    if (!dropzone || !fileInput) return;

    dropzone.onclick = () => fileInput.click();

    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    };

    dropzone.ondragleave = () => {
      dropzone.classList.remove('dragover');
    };

    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleImageFile(e.dataTransfer.files[0]);
      }
    };

    fileInput.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleImageFile(e.target.files[0]);
      }
    };

    if (btnRemove) {
      btnRemove.onclick = (e) => {
        e.stopPropagation();
        this.uploadedImageBase64 = null;
        fileInput.value = '';
        if (previewBox) previewBox.classList.remove('active');
        if (dropzone) dropzone.style.display = 'block';
      };
    }
  },

  handleImageFile(file) {
    const errorEl = document.getElementById('errorMenuPhoto');
    const previewBox = document.getElementById('menuImagePreviewBox');
    const previewImg = document.getElementById('menuImagePreviewImg');
    const dropzone = document.getElementById('menuImageDropzone');

    // Validation: Type check
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.showFieldError('errorMenuPhoto', 'Format gambar harus JPG, PNG, atau WebP.');
      return;
    }

    // Validation: Max size 2MB (2 * 1024 * 1024)
    if (file.size > 2 * 1024 * 1024) {
      this.showFieldError('errorMenuPhoto', 'Ukuran foto terlalu besar (Maksimal 2MB).');
      return;
    }

    this.clearFieldError('errorMenuPhoto');

    // Read and preview via FileReader API
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageBase64 = e.target.result;
      if (previewImg) previewImg.src = this.uploadedImageBase64;
      if (previewBox) previewBox.classList.add('active');
      if (dropzone) dropzone.style.display = 'none';
    };
    reader.readAsDataURL(file);
  },

  // Client-Side Validation Engine (Item 2.c Requirement)
  bindFormValidation() {
    const form = document.getElementById('formMenu');
    if (!form) return;

    form.onsubmit = (e) => {
      e.preventDefault();
      if (this.validateMenuForm()) {
        this.submitMenuForm();
      }
    };
  },

  validateMenuForm() {
    let isValid = true;

    // Field: Nama Menu
    const nameInput = document.getElementById('menuNameInput');
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      this.showFieldError('errorMenuName', 'Nama menu wajib diisi.');
      nameInput.classList.add('is-invalid');
      isValid = false;
    } else if (nameVal.length < 3) {
      this.showFieldError('errorMenuName', 'Nama menu minimal 3 karakter.');
      nameInput.classList.add('is-invalid');
      isValid = false;
    } else {
      this.clearFieldError('errorMenuName');
      nameInput.classList.remove('is-invalid');
    }

    // Field: Kategori
    const catInput = document.getElementById('menuCategorySelect');
    if (!catInput.value) {
      this.showFieldError('errorMenuCategory', 'Silakan pilih kategori makanan/minuman.');
      catInput.classList.add('is-invalid');
      isValid = false;
    } else {
      this.clearFieldError('errorMenuCategory');
      catInput.classList.remove('is-invalid');
    }

    // Field: Harga
    const priceInput = document.getElementById('menuPriceInput');
    const priceVal = parseFloat(priceInput.value);
    if (isNaN(priceVal) || priceVal <= 0) {
      this.showFieldError('errorMenuPrice', 'Harga wajib berupa angka lebih dari 0.');
      priceInput.classList.add('is-invalid');
      isValid = false;
    } else if (priceVal < 1000) {
      this.showFieldError('errorMenuPrice', 'Harga minimal Rp 1.000.');
      priceInput.classList.add('is-invalid');
      isValid = false;
    } else {
      this.clearFieldError('errorMenuPrice');
      priceInput.classList.remove('is-invalid');
    }

    // Field: Stok
    const stockInput = document.getElementById('menuStockInput');
    const stockVal = parseInt(stockInput.value, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      this.showFieldError('errorMenuStock', 'Stok harus berupa bilangan bulat >= 0.');
      stockInput.classList.add('is-invalid');
      isValid = false;
    } else {
      this.clearFieldError('errorMenuStock');
      stockInput.classList.remove('is-invalid');
    }

    // Field: Deskripsi
    const descInput = document.getElementById('menuDescInput');
    const descVal = descInput.value.trim();
    if (!descVal) {
      this.showFieldError('errorMenuDesc', 'Deskripsi menu wajib diisi.');
      descInput.classList.add('is-invalid');
      isValid = false;
    } else if (descVal.length < 10) {
      this.showFieldError('errorMenuDesc', 'Deskripsi terlalu singkat (minimal 10 karakter).');
      descInput.classList.add('is-invalid');
      isValid = false;
    } else {
      this.clearFieldError('errorMenuDesc');
      descInput.classList.remove('is-invalid');
    }

    // Field: Foto Produk
    if (!this.uploadedImageBase64 && !this.editingMenuId) {
      this.showFieldError('errorMenuPhoto', 'Foto produk wajib diunggah.');
      isValid = false;
    } else {
      this.clearFieldError('errorMenuPhoto');
    }

    return isValid;
  },

  showFieldError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerText = message;
      el.classList.add('active');
    }
  },

  clearFieldError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerText = '';
      el.classList.remove('active');
    }
  },

  // Form Submit Simulation
  submitMenuForm() {
    const btnSubmit = document.getElementById('btnSubmitMenu');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<span>Menyimpan ke Server HTTP...</span> ⏳`;
    btnSubmit.disabled = true;

    setTimeout(() => {
      const name = document.getElementById('menuNameInput').value.trim();
      const catSelect = document.getElementById('menuCategorySelect');
      const catId = parseInt(catSelect.value, 10);
      const catName = catSelect.options[catSelect.selectedIndex].text;
      const price = parseFloat(document.getElementById('menuPriceInput').value);
      const stock = parseInt(document.getElementById('menuStockInput').value, 10);
      const desc = document.getElementById('menuDescInput').value.trim();
      const isAvailable = document.getElementById('menuAvailableToggle').checked;

      const menus = NyamStore.getMenus();

      if (this.editingMenuId) {
        // Update existing menu
        const menu = menus.find(m => m.id_menu === this.editingMenuId);
        if (menu) {
          menu.nama_menu = name;
          menu.id_kategori = catId;
          menu.nama_kategori = catName;
          menu.harga = price;
          menu.stok = stock;
          menu.deskripsi = desc;
          menu.is_tersedia = isAvailable;
          if (this.uploadedImageBase64) {
            menu.foto_menu = this.uploadedImageBase64;
          }
          App.showToast('Menu Berhasil Diperbarui', `Menu "${name}" telah disimpan ke katalog stan.`, 'success');
        }
      } else {
        // Add new menu
        const newId = menus.length > 0 ? Math.max(...menus.map(m => m.id_menu)) + 1 : 1;
        const newMenu = {
          id_menu: newId,
          nama_menu: name,
          id_kategori: catId,
          nama_kategori: catName,
          harga: price,
          stok: stock,
          is_tersedia: isAvailable,
          deskripsi: desc,
          foto_menu: this.uploadedImageBase64 || SAMPLE_IMAGES.ayamGeprek
        };
        menus.push(newMenu);
        App.showToast('Menu Baru Ditambahkan', `"${name}" berhasil dimasukkan ke basis data stan.`, 'success');
      }

      NyamStore.saveMenus(menus);
      btnSubmit.innerHTML = originalText;
      btnSubmit.disabled = false;
      this.closeModal('modalMenuForm');
      this.render();
      if (typeof App.updateSidebarBadges === 'function') {
        App.updateSidebarBadges();
      }
    }, 450); // realistic network delay simulation
  },

  // Modal open for Create or Edit
  openMenuModal(menuId = null) {
    this.editingMenuId = menuId;
    this.uploadedImageBase64 = null;

    const modal = document.getElementById('modalMenuForm');
    const titleEl = document.getElementById('modalMenuTitle');
    const form = document.getElementById('formMenu');
    const dropzone = document.getElementById('menuImageDropzone');
    const previewBox = document.getElementById('menuImagePreviewBox');
    const previewImg = document.getElementById('menuImagePreviewImg');
    const pricePreview = document.getElementById('menuPricePreview');

    // Reset error messages
    ['errorMenuName', 'errorMenuCategory', 'errorMenuPrice', 'errorMenuStock', 'errorMenuDesc', 'errorMenuPhoto'].forEach(id => {
      this.clearFieldError(id);
    });
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    if (menuId) {
      const menus = NyamStore.getMenus();
      const menu = menus.find(m => m.id_menu === menuId);
      if (!menu) return;

      titleEl.innerHTML = `✏️ Edit Menu: <strong>${menu.nama_menu}</strong>`;
      document.getElementById('menuNameInput').value = menu.nama_menu;
      document.getElementById('menuCategorySelect').value = menu.id_kategori;
      document.getElementById('menuPriceInput').value = menu.harga;
      document.getElementById('menuStockInput').value = menu.stok;
      document.getElementById('menuDescInput').value = menu.deskripsi;
      document.getElementById('menuAvailableToggle').checked = menu.is_tersedia;

      pricePreview.innerText = `Preview: Rp ${menu.harga.toLocaleString('id-ID')}`;
      pricePreview.style.color = '#38bdf8';

      if (menu.foto_menu) {
        previewImg.src = menu.foto_menu;
        previewBox.classList.add('active');
        dropzone.style.display = 'none';
      } else {
        previewBox.classList.remove('active');
        dropzone.style.display = 'block';
      }
    } else {
      titleEl.innerHTML = `🍱 Tambah Menu Baru ke Stan`;
      form.reset();
      document.getElementById('menuAvailableToggle').checked = true;
      pricePreview.innerText = 'Format: angka tanpa titik/koma';
      pricePreview.style.color = 'var(--text-dim)';
      previewBox.classList.remove('active');
      dropzone.style.display = 'block';
    }

    modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // Toggle Stock availability immediately (Tersedia <-> Habis)
  toggleStock(menuId) {
    const menus = NyamStore.getMenus();
    const menu = menus.find(m => m.id_menu === menuId);
    if (!menu) return;

    menu.is_tersedia = !menu.is_tersedia;
    NyamStore.saveMenus(menus);

    const statusLabel = menu.is_tersedia ? 'Tersedia' : 'Habis (Sold Out)';
    const toastType = menu.is_tersedia ? 'success' : 'warning';
    App.showToast('Ketersediaan Stok Diperbarui', `Status ${menu.nama_menu} diubah menjadi "${statusLabel}".`, toastType);

    this.render();
    if (typeof App.updateSidebarBadges === 'function') {
      App.updateSidebarBadges();
    }
  },

  // Delete Menu with confirmation
  confirmDelete(menuId) {
    const menus = NyamStore.getMenus();
    const menu = menus.find(m => m.id_menu === menuId);
    if (!menu) return;

    if (confirm(`Apakah Anda yakin ingin menghapus "${menu.nama_menu}" dari katalog stan?`)) {
      const updated = menus.filter(m => m.id_menu !== menuId);
      NyamStore.saveMenus(updated);
      App.showToast('Menu Dihapus', `Menu "${menu.nama_menu}" telah dihapus dari basis data.`, 'danger');
      this.render();
      if (typeof App.updateSidebarBadges === 'function') {
        App.updateSidebarBadges();
      }
    }
  },

  // Render Catalog Grid
  render() {
    const menus = NyamStore.getMenus();
    const gridContainer = document.getElementById('catalogGridContainer');
    if (!gridContainer) return;

    // Filter by stock
    let filtered = menus;
    if (this.currentFilter === 'AVAILABLE') {
      filtered = filtered.filter(m => m.is_tersedia);
    } else if (this.currentFilter === 'SOLDOUT') {
      filtered = filtered.filter(m => !m.is_tersedia);
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(m => 
        m.nama_menu.toLowerCase().includes(this.searchQuery) ||
        m.deskripsi.toLowerCase().includes(this.searchQuery) ||
        m.nama_kategori.toLowerCase().includes(this.searchQuery)
      );
    }

    // Update filter count numbers in tab buttons
    const countAll = menus.length;
    const countAvailable = menus.filter(m => m.is_tersedia).length;
    const countSoldOut = menus.filter(m => !m.is_tersedia).length;

    const pillAll = document.getElementById('filterCountAll');
    const pillAvail = document.getElementById('filterCountAvailable');
    const pillSold = document.getElementById('filterCountSoldout');
    if (pillAll) pillAll.innerText = `(${countAll})`;
    if (pillAvail) pillAvail.innerText = `(${countAvailable})`;
    if (pillSold) pillSold.innerText = `(${countSoldOut})`;

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3.5rem; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
          <h3 style="color: var(--text-main); margin-bottom: 0.35rem;">Tidak Ada Menu yang Sesuai</h3>
          <p style="font-size: 0.85rem;">Coba sesuaikan kata kunci pencarian atau filter status stok.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered.map(menu => this.createMenuCardHTML(menu)).join('');

    // Attach Action Listeners
    gridContainer.querySelectorAll('.btn-toggle-stock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.menuid, 10);
        this.toggleStock(id);
      });
    });

    gridContainer.querySelectorAll('.btn-edit-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.menuid, 10);
        this.openMenuModal(id);
      });
    });

    gridContainer.querySelectorAll('.btn-delete-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.menuid, 10);
        this.confirmDelete(id);
      });
    });
  },

  createMenuCardHTML(menu) {
    const isAvail = menu.is_tersedia;
    return `
      <div class="menu-card ${!isAvail ? 'is-sold-out' : ''}" id="menu-card-${menu.id_menu}">
        <div class="menu-image-container">
          <img src="${menu.foto_menu}" alt="${menu.nama_menu}" loading="lazy">
          <span class="category-overlay-badge">${menu.nama_kategori}</span>
          <span class="stock-overlay-badge ${isAvail ? 'in-stock' : 'out-of-stock'}">
            ${isAvail ? '🟢 Tersedia' : '🔴 Stok Habis'}
          </span>
        </div>

        <div class="menu-card-body">
          <h3 class="menu-card-title">${menu.nama_menu}</h3>
          <div class="menu-card-price">Rp ${menu.harga.toLocaleString('id-ID')}</div>
          <p class="menu-card-desc">${menu.deskripsi}</p>
          <div class="menu-stock-meta">
            <span>Stok fisik: <strong>${menu.stok} porsi</strong></span>
            <span>ID Menu: #${menu.id_menu}</span>
          </div>
        </div>

        <div class="menu-card-actions">
          <div class="stock-toggle-row">
            <span class="stock-toggle-label">Ketersediaan Stok:</span>
            <button class="btn-toggle-stock ${isAvail ? 'btn-mark-soldout' : 'btn-mark-available'}" data-menuid="${menu.id_menu}">
              ${isAvail ? 'Set Habis' : 'Set Tersedia'}
            </button>
          </div>
          <div class="menu-buttons-row">
            <button class="btn-edit-menu" data-menuid="${menu.id_menu}">
              ✏️ Edit Menu
            </button>
            <button class="btn-delete-menu" data-menuid="${menu.id_menu}" title="Hapus Menu">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
