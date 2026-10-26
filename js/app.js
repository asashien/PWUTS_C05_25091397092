/**
 * app.js - Main Application Controller & Ajax Router
 * Fulfills UTS Pemrograman Web UNESA Requirements:
 * 2.a: Layout Utama, Responsive, Hyperlink Navigasi dengan Teknik Ajax
 * 2.b: Antarmuka Pesanan Dapur / Kitchen Display (KDS) Interaktif
 * 2.c: Form Manajemen Menu & Validasi sebelum Submit ke Server HTTP
 */

const App = {
  currentRoute: 'dashboard',

  init() {
    this.bindNavigation();
    this.bindMobileDrawer();
    this.bindStatusManager();
    this.updateSidebarBadges();
    this.initClock();
    this.updateBoothHeaderInfo();

    // Handle initial route from URL Hash or default to dashboard
    const initialRoute = window.location.hash.replace('#', '') || 'dashboard';
    this.navigateTo(initialRoute, false);

    // Browser back/forward navigation
    window.addEventListener('popstate', (e) => {
      const route = window.location.hash.replace('#', '') || 'dashboard';
      this.navigateTo(route, false);
    });

    // Hash change in URL bar or external click
    window.addEventListener('hashchange', (e) => {
      const route = window.location.hash.replace('#', '') || 'dashboard';
      if (route !== this.currentRoute) {
        this.navigateTo(route, false);
      }
    });
  },

  // Document-level delegated event listener for ALL Ajax navigation links
  bindNavigation() {
    document.addEventListener('click', (e) => {
      // Check if clicked element or its parent is an ajax link
      const link = e.target.closest('.ajax-nav-link, [data-route]');
      if (link) {
        e.preventDefault();
        const route = link.dataset.route || link.getAttribute('href')?.replace('#', '');
        if (route) {
          App.navigateTo(route, true);
        }
      }
    });
  },

  // Ajax Router: Loads views via fetch() with fallback to embedded templates
  navigateTo(route, updateHistory = true) {
    const validRoutes = ['dashboard', 'kitchen', 'catalog', 'reviews', 'profile'];
    if (!validRoutes.includes(route)) {
      route = 'dashboard';
    }

    this.currentRoute = route;

    // Update active nav links in sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.route === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (updateHistory) {
      window.history.pushState({ route }, '', `#${route}`);
    }

    // Close mobile drawer if opened
    this.closeMobileDrawer();

    // Show Ajax loader bar
    const loader = document.getElementById('ajaxLoader');
    if (loader) loader.style.display = 'block';

    const contentArea = document.getElementById('mainContentArea');

    // Attempt Ajax fetch first (works on HTTP/HTTPS/Localhost)
    fetch(`pages/${route}.html`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(html => {
        this.renderView(html, route);
      })
      .catch(err => {
        // Fallback for direct local file:// execution or network errors
        console.warn('Ajax fetch fallback engaged for route:', route, err);
        const templateEl = document.getElementById(`template-${route}`);
        if (templateEl) {
          this.renderView(templateEl.innerHTML, route);
        } else {
          contentArea.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
              <h3>Gagal memuat halaman ${route}</h3>
              <p>Periksa koneksi atau pastikan server lokal aktif.</p>
            </div>
          `;
        }
      })
      .finally(() => {
        if (loader) {
          setTimeout(() => { loader.style.display = 'none'; }, 200);
        }
      });
  },

  renderView(html, route) {
    const contentArea = document.getElementById('mainContentArea');
    contentArea.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Initialize page-specific scripts safely
    try {
      if (route === 'dashboard') {
        this.initDashboard();
      } else if (route === 'kitchen') {
        if (typeof KitchenModule !== 'undefined' && typeof KitchenModule.init === 'function') {
          KitchenModule.init();
        }
      } else if (route === 'catalog') {
        if (typeof CatalogModule !== 'undefined' && typeof CatalogModule.init === 'function') {
          CatalogModule.init();
        }
      } else if (route === 'reviews') {
        this.initReviews();
      } else if (route === 'profile') {
        this.initProfile();
      }
    } catch (err) {
      console.error(`Error initializing view for ${route}:`, err);
    }

    this.updateSidebarBadges();
  },

  // Dashboard Page Logic (Mock Up L9)
  initDashboard() {
    const orders = NyamStore.getOrders();
    const menus = NyamStore.getMenus();
    const booth = NyamStore.getBooth();

    // 1. Calculate Turnover Today
    const todayTurnover = orders
      .filter(o => o.status !== 'REJECTED')
      .reduce((sum, o) => sum + Number(o.total_booth_revenue !== undefined ? o.total_booth_revenue : (o.subtotal || 0)), 0);

    // 2. Count Waiting
    const countWaiting = orders.filter(o => o.status === 'WAITING_ACCEPTANCE').length;

    // 3. Count Cooking
    const countCooking = orders.filter(o => o.status === 'IN_PROCESS').length;

    // Update stats DOM
    const elTurnover = document.getElementById('statTurnoverValue');
    const elWaiting = document.getElementById('statWaitingValue');
    const elCooking = document.getElementById('statCookingValue');
    const elMenus = document.getElementById('statMenusValue');

    if (elTurnover) elTurnover.innerText = `Rp ${todayTurnover.toLocaleString('id-ID')}`;
    if (elWaiting) elWaiting.innerText = `${countWaiting} Pesanan`;
    if (elCooking) elCooking.innerText = `${countCooking} Pesanan`;
    if (elMenus) elMenus.innerText = `${menus.length} Menu Aktif`;

    // Render Status Alert Banner if not OPEN
    this.renderDashboardStatusBanner(booth);

    // Render Recent Kitchen Queue in Dashboard
    const queueContainer = document.getElementById('dashboardQueueList');
    if (queueContainer) {
      const activeQueue = orders.slice(0, 4); // show recent 4
      if (activeQueue.length === 0) {
        queueContainer.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 2rem;">Tidak ada pesanan aktif.</div>`;
      } else {
        queueContainer.innerHTML = activeQueue.map(o => `
          <div class="dashboard-order-card ${this.getStatusClass(o.status)}">
            <div class="order-card-meta">
              <div class="order-id-time">
                <span>${o.id_pesanan}</span>
                <span class="time">• ⏰ ${o.waktu}</span>
              </div>
              <div class="order-customer-tag">
                <span>👤 ${o.nama_pelanggan}</span>
              </div>
            </div>

            <div class="order-items-preview">
              ${o.items.map(it => `
                <div class="order-item-row">
                  <span class="qty-name">${it.qty}x ${it.nama}</span>
                  <span class="price">Rp ${(it.harga * it.qty).toLocaleString('id-ID')}</span>
                </div>
              `).join('')}
              ${o.catatan_dapur ? `
                <div class="order-instruction-pill">
                  <span>📝 Catatan: "${o.catatan_dapur}"</span>
                </div>
              ` : ''}
            </div>

            <div class="order-card-action-bar">
              <div class="order-total-tag">
                Total: <strong>Rp ${o.total_booth_revenue.toLocaleString('id-ID')}</strong>
              </div>
              <div>
                ${this.getDashboardActionBtn(o)}
              </div>
            </div>
          </div>
        `).join('');

        // Attach action handlers in dashboard
        queueContainer.querySelectorAll('.btn-dashboard-advance').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const subId = btn.dataset.subid;
            KitchenModule.advanceStatus(subId);
            this.initDashboard();
          });
        });
      }
    }

    // Render Booth Details
    const elBoothName = document.getElementById('dashBoothName');
    const elBoothDesc = document.getElementById('dashBoothDesc');
    const elBoothLoc = document.getElementById('dashBoothLocation');
    const elBoothHours = document.getElementById('dashBoothHours');
    const elBoothBank = document.getElementById('dashBoothBank');
    if (elBoothName) elBoothName.innerText = booth.nama_stan;
    if (elBoothDesc) elBoothDesc.innerText = booth.deskripsi;
    if (elBoothLoc) elBoothLoc.innerText = booth.nomor_lokasi;
    if (elBoothHours) elBoothHours.innerText = booth.jam_operasional;

    // Show primary disbursement account
    const utamaAcc = (booth.disbursement_accounts || []).find(a => a.is_utama) || (booth.disbursement_accounts || [])[0];
    if (elBoothBank && utamaAcc) {
      elBoothBank.innerText = `${utamaAcc.bank} • ${utamaAcc.no_rek}`;
    }
  },

  renderDashboardStatusBanner(booth) {
    const banner = document.getElementById('dashboardStatusBanner');
    if (!banner) return;

    const status = booth.status_operasional || (booth.is_open ? 'OPEN' : 'CLOSED');
    if (status === 'OPEN') {
      banner.style.display = 'none';
      banner.className = 'booth-status-banner';
    } else if (status === 'BUSY') {
      banner.style.display = 'flex';
      banner.className = 'booth-status-banner';
      banner.innerHTML = `
        <div class="banner-text">
          <span style="font-size: 1.15rem;">🟡</span>
          <div>
            <strong>Status Operasional: DAPUR SIBUK / ANTRIAN PADAT</strong>
            <div style="font-size: 0.74rem; color: #92400e; margin-top: 2px;">
              Pelanggan meja diinformasikan estimasi waktu penyiapan makanan bertambah +15 menit.
            </div>
          </div>
        </div>
        <button class="btn-secondary" onclick="App.openStatusModal()" style="font-size: 0.74rem; padding: 0.35rem 0.75rem;">Ubah Status</button>
      `;
    } else if (status === 'BREAK') {
      banner.style.display = 'flex';
      banner.className = 'booth-status-banner';
      banner.innerHTML = `
        <div class="banner-text">
          <span style="font-size: 1.15rem;">☕</span>
          <div>
            <strong>Status Operasional: ISTIRAHAT SEMENTARA (Restock / Sholat)</strong>
            <div style="font-size: 0.74rem; color: #92400e; margin-top: 2px;">
              Pesanan baru ditahan sementara hingga istirahat selesai.
            </div>
          </div>
        </div>
        <button class="btn-secondary" onclick="App.openStatusModal()" style="font-size: 0.74rem; padding: 0.35rem 0.75rem;">Buka Stan Sekarang</button>
      `;
    } else if (status === 'CLOSED') {
      banner.style.display = 'flex';
      banner.className = 'booth-status-banner banner-closed';
      banner.innerHTML = `
        <div class="banner-text">
          <span style="font-size: 1.15rem;">🔴</span>
          <div>
            <strong>Status Operasional: STAN TUTUP</strong>
            <div style="font-size: 0.74rem; color: #be123c; margin-top: 2px;">
              Stan sedang tidak menerima pesanan pelanggan di luar jam operasional.
            </div>
          </div>
        </div>
        <button class="btn-primary" onclick="App.setBoothStatus('OPEN', 'Stan dibuka kembali')" style="font-size: 0.74rem; padding: 0.35rem 0.85rem;">Buka Stan</button>
      `;
    }
  },

  getStatusClass(status) {
    switch (status) {
      case 'WAITING_ACCEPTANCE': return 'status-waiting';
      case 'IN_PROCESS': return 'status-cooking';
      case 'READY': return 'status-ready';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  },

  getDashboardActionBtn(order) {
    if (order.status === 'WAITING_ACCEPTANCE') {
      return `<button class="btn-action-small btn-kds-accept btn-dashboard-advance" data-subid="${order.id_subpesanan}">Terima Pesanan</button>`;
    } else if (order.status === 'IN_PROCESS') {
      return `<button class="btn-action-small btn-kds-cook btn-dashboard-advance" data-subid="${order.id_subpesanan}">Siap Diambil</button>`;
    } else if (order.status === 'READY') {
      return `<button class="btn-action-small btn-kds-ready btn-dashboard-advance" data-subid="${order.id_subpesanan}">Selesaikan</button>`;
    } else if (order.status === 'COMPLETED') {
      return `<span class="badge badge-completed">COMPLETED</span>`;
    }
    return '';
  },

  // Reviews Page Logic (Mock Up L12)
  initReviews() {
    const reviews = NyamStore.getReviews();
    const listEl = document.getElementById('reviewsFullList');
    if (listEl) {
      listEl.innerHTML = reviews.map(r => `
        <div class="card" style="margin-bottom: 1rem; padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="user-avatar">${r.initial}</div>
              <div>
                <strong style="color: var(--text-main); font-size: 0.9rem;">${r.nama_pelanggan}</strong>
                <div style="color: var(--text-muted); font-size: 0.72rem;">${r.tanggal}</div>
              </div>
            </div>
            <div style="color: #f59e0b; font-size: 1rem; font-weight: 700;">
              ${'★'.repeat(Math.floor(r.bintang))} ${r.bintang.toFixed(1)}
            </div>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; font-style: italic;">
            "${r.komentar}"
          </p>
          <div style="margin-top: 0.5rem; font-size: 0.74rem; color: var(--berry-dark);">
            Menu: <strong>${r.menu_dipesan}</strong>
          </div>
        </div>
      `).join('');
    }
  },

  // Profile Page Logic (Mock Up L13 + Payment & Status Configuration)
  initProfile() {
    const booth = NyamStore.getBooth();
    const form = document.getElementById('formBoothProfile');
    if (!form) return;

    // Fill form fields
    document.getElementById('profileBoothName').value = booth.nama_stan;
    document.getElementById('profileLocation').value = booth.nomor_lokasi;
    document.getElementById('profileOpenHour').value = booth.jam_buka;
    document.getElementById('profileCloseHour').value = booth.jam_tutup;
    document.getElementById('profileDescription').value = booth.deskripsi;

    // Fill Payment Methods Checkboxes
    const pm = booth.payment_methods || { qris: true, va: true, ewallet: true, cash: true };
    if (document.getElementById('pmQris')) document.getElementById('pmQris').checked = !!pm.qris;
    if (document.getElementById('pmVa')) document.getElementById('pmVa').checked = !!pm.va;
    if (document.getElementById('pmEwallet')) document.getElementById('pmEwallet').checked = !!pm.ewallet;
    if (document.getElementById('pmCash')) document.getElementById('pmCash').checked = !!pm.cash;

    // Render Disbursement Accounts List
    this.renderDisbursementAccounts();

    // Render Profile Status Card
    this.renderProfileStatusCard();

    // Save profile form listener
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      booth.nama_stan = document.getElementById('profileBoothName').value.trim();
      booth.nomor_lokasi = document.getElementById('profileLocation').value.trim();
      booth.jam_buka = document.getElementById('profileOpenHour').value.trim();
      booth.jam_tutup = document.getElementById('profileCloseHour').value.trim();
      booth.jam_operasional = `${booth.jam_buka} - ${booth.jam_tutup} WIB`;
      booth.deskripsi = document.getElementById('profileDescription').value.trim();

      // Update payment methods
      booth.payment_methods = {
        qris: document.getElementById('pmQris') ? document.getElementById('pmQris').checked : true,
        va: document.getElementById('pmVa') ? document.getElementById('pmVa').checked : true,
        ewallet: document.getElementById('pmEwallet') ? document.getElementById('pmEwallet').checked : true,
        cash: document.getElementById('pmCash') ? document.getElementById('pmCash').checked : true
      };

      NyamStore.saveBooth(booth);
      App.showToast('Profil Stan Disimpan', 'Informasi operasional dan metode pembayaran berhasil diperbarui.', 'success');
      App.updateBoothHeaderInfo();
    });
  },

  renderDisbursementAccounts() {
    const booth = NyamStore.getBooth();
    const listEl = document.getElementById('disbursementAccountsList');
    if (!listEl) return;

    const accounts = booth.disbursement_accounts || [];
    if (accounts.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 1rem; font-size: 0.8rem;">Belum ada rekening pencairan terdaftar.</div>`;
      return;
    }

    listEl.innerHTML = accounts.map(acc => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0.95rem; background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 0.55rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.25rem;">🏦</span>
          <div>
            <div style="font-size: 0.84rem; font-weight: 600; color: var(--text-main);">
              ${acc.bank} • <span style="letter-spacing: 0.5px;">${acc.no_rek}</span>
              ${acc.is_utama ? `<span style="font-size: 0.65rem; background: var(--gradient-primary); color: #fff; padding: 0.15rem 0.45rem; border-radius: var(--radius-full); margin-left: 0.4rem; font-weight: 600;">UTAMA</span>` : ''}
            </div>
            <div style="font-size: 0.74rem; color: var(--berry-dark);">Atas Nama: <strong>${acc.atas_nama}</strong></div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          ${!acc.is_utama ? `<button type="button" class="btn-secondary" onclick="App.setPrimaryAccount(${acc.id})" style="font-size: 0.72rem; padding: 0.3rem 0.65rem;">Set Utama</button>` : ''}
          <button type="button" class="btn-danger" onclick="App.deleteAccount(${acc.id})" style="font-size: 0.72rem; padding: 0.3rem 0.6rem;" title="Hapus Rekening">🗑️</button>
        </div>
      </div>
    `).join('');
  },

  renderProfileStatusCard() {
    const cardEl = document.getElementById('profileStatusCardContent');
    if (!cardEl) return;
    const booth = NyamStore.getBooth();
    const status = booth.status_operasional || (booth.is_open ? 'OPEN' : 'CLOSED');

    let badgeIcon = '🟢';
    let statusText = 'BUKA & AKTIF';
    let statusDesc = 'Stan dapat menerima pesanan baru langsung dari aplikasi QR pelanggan.';
    let bgStyle = 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(52, 211, 153, 0.12) 100%)';
    let textColor = '#047857';

    if (status === 'BUSY') {
      badgeIcon = '🟡';
      statusText = 'DAPUR SIBUK';
      statusDesc = 'Dapur padat antrean. Estimasi penyajian bertambah +15 menit.';
      bgStyle = 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.15) 100%)';
      textColor = '#b45309';
    } else if (status === 'BREAK') {
      badgeIcon = '☕';
      statusText = 'ISTIRAHAT SEMENTARA';
      statusDesc = 'Stan istirahat sejenak (restock/sholat). Pesanan baru ditahan.';
      bgStyle = 'linear-gradient(135deg, rgba(159, 73, 110, 0.1) 0%, rgba(225, 29, 72, 0.08) 100%)';
      textColor = 'var(--berry-dark)';
    } else if (status === 'CLOSED') {
      badgeIcon = '🔴';
      statusText = 'TUTUP OPERASIONAL';
      statusDesc = 'Stan ditutup untuk hari ini dan tidak menerima pesanan baru.';
      bgStyle = 'linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(244, 63, 94, 0.12) 100%)';
      textColor = 'var(--rose-primary)';
    }

    cardEl.innerHTML = `
      <div style="background: ${bgStyle}; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.4rem; text-align: center; margin-bottom: 1.15rem;">
        <div style="font-size: 2rem; margin-bottom: 0.35rem;">${badgeIcon}</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: ${textColor}; margin-bottom: 0.25rem;">
          Status: ${statusText}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45;">
          ${statusDesc}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.45rem;">
        <span style="font-size: 0.72rem; font-weight: 600; color: var(--berry-dark); text-transform: uppercase;">Pilih Status Cepat:</span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem;">
          <button type="button" class="btn-secondary" onclick="App.setBoothStatus('OPEN', 'Stan dibuka normal')" style="font-size: 0.74rem; justify-content: flex-start;">🟢 Buka Normal</button>
          <button type="button" class="btn-secondary" onclick="App.setBoothStatus('BUSY', 'Status diubah ke Dapur Padat')" style="font-size: 0.74rem; justify-content: flex-start;">🟡 Dapur Padat</button>
          <button type="button" class="btn-secondary" onclick="App.setBoothStatus('BREAK', 'Stan istirahat sementara')" style="font-size: 0.74rem; justify-content: flex-start;">☕ Istirahat</button>
          <button type="button" class="btn-secondary" onclick="App.setBoothStatus('CLOSED', 'Stan ditutup operasional')" style="font-size: 0.74rem; justify-content: flex-start; color: var(--rose-primary);">🔴 Tutup Stan</button>
        </div>
      </div>
    `;
  },

  // Add Disbursement Account
  openAddAccountModal() {
    document.getElementById('modalAddAccount').classList.add('active');
  },

  saveNewAccount() {
    const bank = document.getElementById('newAccountBank').value.trim();
    const noRek = document.getElementById('newAccountNo').value.trim();
    const atasNama = document.getElementById('newAccountName').value.trim();
    const isUtama = document.getElementById('newAccountIsUtama').checked;

    if (!bank || !noRek || !atasNama) {
      alert('Mohon lengkapi semua kolom rekening.');
      return;
    }

    const booth = NyamStore.getBooth();
    if (!booth.disbursement_accounts) booth.disbursement_accounts = [];

    if (isUtama) {
      booth.disbursement_accounts.forEach(a => a.is_utama = false);
    }

    const newAcc = {
      id: Date.now(),
      bank,
      no_rek: noRek,
      atas_nama: atasNama,
      is_utama: isUtama || booth.disbursement_accounts.length === 0
    };

    booth.disbursement_accounts.push(newAcc);
    NyamStore.saveBooth(booth);
    this.closeModal('modalAddAccount');
    this.showToast('Rekening Ditambahkan', `${bank} (${noRek}) berhasil didaftarkan untuk pencairan dana.`, 'success');
    this.renderDisbursementAccounts();
  },

  setPrimaryAccount(accId) {
    const booth = NyamStore.getBooth();
    if (!booth.disbursement_accounts) return;

    booth.disbursement_accounts.forEach(a => {
      a.is_utama = (a.id === accId);
    });

    NyamStore.saveBooth(booth);
    this.showToast('Rekening Utama Diperbarui', 'Pencairan hasil penjualan akan otomatis dialihkan ke rekening ini.', 'info');
    this.renderDisbursementAccounts();
    this.initDashboard();
  },

  deleteAccount(accId) {
    const booth = NyamStore.getBooth();
    if (!booth.disbursement_accounts) return;

    if (booth.disbursement_accounts.length <= 1) {
      alert('Minimal harus ada 1 rekening pencairan dana terdaftar.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus rekening pencairan ini?')) {
      booth.disbursement_accounts = booth.disbursement_accounts.filter(a => a.id !== accId);
      // Ensure there's still an utama
      if (!booth.disbursement_accounts.some(a => a.is_utama)) {
        booth.disbursement_accounts[0].is_utama = true;
      }
      NyamStore.saveBooth(booth);
      this.showToast('Rekening Dihapus', 'Rekening pencairan dana telah dihapus.', 'danger');
      this.renderDisbursementAccounts();
      this.initDashboard();
    }
  },

  // Variative Operational Status Modal
  bindStatusManager() {
    const pill = document.getElementById('headerStatusPill');
    const btnToggle = document.getElementById('btnToggleBoothStatus');

    if (pill) {
      pill.addEventListener('click', () => this.openStatusModal());
    }
    if (btnToggle) {
      btnToggle.addEventListener('click', () => this.openStatusModal());
    }

    // Logout confirmation button
    const btnLogout = document.getElementById('btnHeaderLogout');
    const btnSideLogout = document.getElementById('btnSidebarLogout');
    [btnLogout, btnSideLogout].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (confirm('Apakah Anda yakin ingin keluar dari Panel Pemilik Stan NyamCenter?')) {
            this.showToast('Logout Berhasil', 'Sesi pemilik stan diakhiri.', 'info');
          }
        });
      }
    });
  },

  openStatusModal() {
    const modal = document.getElementById('modalBoothStatus');
    if (modal) modal.classList.add('active');
  },

  setBoothStatus(statusKey, message) {
    const booth = NyamStore.getBooth();
    booth.status_operasional = statusKey;
    booth.is_open = (statusKey === 'OPEN' || statusKey === 'BUSY');
    booth.status = booth.is_open ? 'AKTIF' : 'TUTUP';

    NyamStore.saveBooth(booth);
    this.updateBoothHeaderInfo();
    this.closeModal('modalBoothStatus');
    this.showToast('Status Stan Berubah', message || `Status stan diperbarui menjadi ${statusKey}.`, statusKey === 'OPEN' ? 'success' : 'warning');

    if (this.currentRoute === 'dashboard') {
      this.initDashboard();
    } else if (this.currentRoute === 'profile') {
      this.renderProfileStatusCard();
    }
  },

  updateBoothHeaderInfo() {
    const booth = NyamStore.getBooth();
    const pill = document.getElementById('headerStatusPill');
    const btnToggle = document.getElementById('btnToggleBoothStatus');
    const hoursPill = document.getElementById('headerOperatingHours');

    const status = booth.status_operasional || (booth.is_open ? 'OPEN' : 'CLOSED');

    if (pill && btnToggle) {
      pill.className = 'status-pill-toggle';
      if (status === 'OPEN') {
        pill.classList.add('status-open');
        pill.innerHTML = `<span class="indicator-dot"></span> STAN BUKA`;
        btnToggle.innerText = 'Ubah Status ▾';
      } else if (status === 'BUSY') {
        pill.classList.add('status-busy');
        pill.innerHTML = `<span class="indicator-dot"></span> DAPUR PADAT`;
        btnToggle.innerText = 'Ubah Status ▾';
      } else if (status === 'BREAK') {
        pill.classList.add('status-break');
        pill.innerHTML = `<span class="indicator-dot"></span> ISTIRAHAT`;
        btnToggle.innerText = 'Ubah Status ▾';
      } else if (status === 'CLOSED') {
        pill.classList.add('status-closed');
        pill.innerHTML = `<span class="indicator-dot"></span> STAN TUTUP`;
        btnToggle.innerText = 'Buka Stan';
      }
    }

    if (hoursPill) {
      hoursPill.innerHTML = `⏰ ${booth.jam_operasional}`;
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // Sidebar badge for active kitchen orders
  updateSidebarBadges() {
    const orders = NyamStore.getOrders();
    const pendingCount = orders.filter(o => o.status === 'WAITING_ACCEPTANCE').length;
    const badge = document.getElementById('badgeKitchenOrders');
    if (badge) {
      if (pendingCount > 0) {
        badge.innerText = `${pendingCount} New`;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  },

  // Responsive Mobile Navigation Drawer
  bindMobileDrawer() {
    const btnToggle = document.getElementById('btnMobileToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (btnToggle && sidebar && backdrop) {
      btnToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        this.closeMobileDrawer();
      });
    }
  },

  closeMobileDrawer() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  },

  // Live Digital Clock
  initClock() {
    const clockEl = document.getElementById('headerLiveClock');
    if (!clockEl) return;
    const update = () => {
      const now = new Date();
      clockEl.innerText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    };
    update();
    setInterval(update, 1000);
  },

  // Toast Notification Engine
  showToast(title, desc, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '⛔';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  }
};

// Auto start application on DOM Ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}
