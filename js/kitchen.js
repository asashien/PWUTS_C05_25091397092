/**
 * kitchen.js - Mock Up L10: Kitchen Display System (KDS) Logic
 * Handles interactive order status shifting, sound feedback, Kanban drag-and-drop,
 * and order rejection with refund trigger as per SRS Sequence Diagram B & Activity 5.b.
 */

const KitchenModule = {
  currentFilter: 'ALL',
  viewMode: 'grid', // 'grid' or 'kanban'
  eventsBound: false,

  // Web Audio API Synthesizer (No external mp3 needed, works 100% offline!)
  audioCtx: null,
  playBeep(type = 'advance') {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'new_order') {
        // High double-chime for new order alert
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'advance') {
        // Cheerful ascending confirmation tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'reject') {
        // Low double buzz for rejection
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(164.81, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.log('Audio synthesis notice:', e);
    }
  },

  init() {
    this.syncViewModeUI();
    this.render();
    this.bindEvents();
  },

  // Sync View Mode Toggle buttons with current viewMode state
  syncViewModeUI() {
    const btnGrid = document.getElementById('btnViewGrid');
    const btnKanban = document.getElementById('btnViewKanban');
    const gridContainer = document.getElementById('kdsGridView');
    const kanbanContainer = document.getElementById('kdsKanbanView');

    if (this.viewMode === 'kanban') {
      if (btnKanban) btnKanban.classList.add('active');
      if (btnGrid) btnGrid.classList.remove('active');
      if (gridContainer) gridContainer.style.display = 'none';
      if (kanbanContainer) kanbanContainer.style.display = 'grid';
    } else {
      this.viewMode = 'grid';
      if (btnGrid) btnGrid.classList.add('active');
      if (btnKanban) btnKanban.classList.remove('active');
      if (gridContainer) gridContainer.style.display = 'grid';
      if (kanbanContainer) kanbanContainer.style.display = 'none';
    }

    // Sync active filter pill button
    document.querySelectorAll('.kds-filter-pills .btn-filter-pill').forEach(btn => {
      if ((btn.dataset.status || 'ALL') === this.currentFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  bindEvents() {
    // 1. Delegated click handling for advance & reject action buttons (works everywhere!)
    if (!this.delegatedEventsBound) {
      document.addEventListener('click', (e) => {
        // Advance status button on card
        const advanceBtn = e.target.closest('.btn-kds-advance');
        if (advanceBtn && advanceBtn.dataset.subid && !advanceBtn.disabled) {
          e.preventDefault();
          e.stopPropagation();
          this.advanceStatus(advanceBtn.dataset.subid);
          return;
        }

        // Reject order button on card
        const rejectBtn = e.target.closest('.btn-kds-reject');
        if (rejectBtn && rejectBtn.dataset.subid) {
          e.preventDefault();
          e.stopPropagation();
          this.openRejectModal(rejectBtn.dataset.subid);
          return;
        }

        // Filter Pills Click
        const pillBtn = e.target.closest('.kds-filter-pills .btn-filter-pill');
        if (pillBtn) {
          e.preventDefault();
          document.querySelectorAll('.kds-filter-pills .btn-filter-pill').forEach(b => b.classList.remove('active'));
          pillBtn.classList.add('active');
          this.currentFilter = pillBtn.dataset.status || 'ALL';

          // If in Kanban mode and clicking a specific status, switch to Grid to view that subset
          if (this.viewMode === 'kanban' && this.currentFilter !== 'ALL') {
            this.switchView('grid');
          } else {
            this.render();
          }
          return;
        }

        // View Mode: Grid
        const gridBtn = e.target.closest('#btnViewGrid');
        if (gridBtn) {
          e.preventDefault();
          this.switchView('grid');
          return;
        }

        // View Mode: Kanban
        const kanbanBtn = e.target.closest('#btnViewKanban');
        if (kanbanBtn) {
          e.preventDefault();
          this.switchView('kanban');
          return;
        }

        // Simulate New Order
        const simBtn = e.target.closest('#btnSimulateOrder');
        if (simBtn) {
          e.preventDefault();
          this.simulateNewOrder();
          return;
        }

        // Refresh Orders
        const refBtn = e.target.closest('#btnRefreshOrders');
        if (refBtn) {
          e.preventDefault();
          this.render();
          App.showToast('Data Diperbarui', 'Antrean pesanan dapur telah dimuat ulang secara real-time.', 'info');
          return;
        }

        // Reset Demo Orders
        const resetBtn = e.target.closest('#btnResetOrders');
        if (resetBtn) {
          e.preventDefault();
          if (confirm('Pulihkan semua antrean pesanan dapur ke data demo awal UTS?')) {
            NyamStore.resetOrders();
            this.currentFilter = 'ALL';
            this.syncViewModeUI();
            this.render();
            App.showToast('Data Dipulihkan', 'Antrean pesanan dapur berhasil dikembalikan ke status awal demo UTS.', 'success');
          }
          return;
        }

        // Modal overlay outside click to close
        const modalOverlay = e.target.closest('.modal-overlay');
        if (modalOverlay && e.target === modalOverlay) {
          this.closeModal(modalOverlay.id);
        }
      });

      // Escape key to close modal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const activeModal = document.querySelector('.modal-overlay.active');
          if (activeModal) this.closeModal(activeModal.id);
        }
      });

      this.delegatedEventsBound = true;
    }
  },

  switchView(mode) {
    this.viewMode = mode;
    this.syncViewModeUI();
    if (mode === 'kanban') {
      this.renderKanban();
    } else {
      this.render();
    }
  },

  // Main status advance state machine
  advanceStatus(id_subpesanan) {
    const orders = NyamStore.getOrders();
    const order = orders.find(o => o.id_subpesanan === id_subpesanan);
    if (!order) return;

    let nextStatus = '';
    let toastTitle = '';
    let toastDesc = '';

    if (order.status === 'WAITING_ACCEPTANCE') {
      nextStatus = 'IN_PROCESS';
      toastTitle = 'Pesanan Diterima & Dimasak';
      toastDesc = `${order.id_pesanan} sekarang berstatus 'Sedang Dimasak'. Notifikasi dikirim ke pelanggan.`;
    } else if (order.status === 'IN_PROCESS') {
      nextStatus = 'READY';
      toastTitle = 'Pesanan Siap Diambil/Diantar';
      toastDesc = `${order.id_pesanan} matang & siap saji! Pelanggan di ${order.no_meja} menerima notifikasi.`;
    } else if (order.status === 'READY') {
      nextStatus = 'COMPLETED';
      toastTitle = 'Pesanan Selesai';
      toastDesc = `${order.id_pesanan} telah diserahkan ke pelanggan. Transaksi selesai.`;
    } else {
      return; // Already completed
    }

    order.status = nextStatus;
    NyamStore.saveOrders(orders);
    this.playBeep('advance');
    App.showToast(toastTitle, toastDesc, 'success');

    if (this.viewMode === 'kanban') {
      this.renderKanban();
    } else {
      this.render();
    }

    if (typeof App.updateSidebarBadges === 'function') {
      App.updateSidebarBadges();
    }

    // Also refresh dashboard if current view is dashboard
    if (App.currentRoute === 'dashboard' && typeof App.initDashboard === 'function') {
      App.initDashboard();
    }
  },

  // Rejection modal & flow
  openRejectModal(id_subpesanan) {
    const orders = NyamStore.getOrders();
    const order = orders.find(o => o.id_subpesanan === id_subpesanan);
    if (!order) return;

    const elOrd = document.getElementById('rejectOrderId');
    const elSub = document.getElementById('rejectSubId');
    const elCust = document.getElementById('rejectCustomerName');
    const elReason = document.getElementById('rejectReasonInput');
    const modal = document.getElementById('modalRejectOrder');

    if (elOrd) elOrd.innerText = order.id_pesanan;
    if (elSub) elSub.value = order.id_subpesanan;
    if (elCust) elCust.innerText = order.nama_pelanggan;
    if (elReason) elReason.value = 'Bahan baku menu telah habis / stan sedang over-capacity.';
    if (modal) modal.classList.add('active');
  },

  confirmReject() {
    const subIdEl = document.getElementById('rejectSubId');
    const reasonEl = document.getElementById('rejectReasonInput');
    const subId = subIdEl ? subIdEl.value : '';
    const reason = reasonEl ? reasonEl.value.trim() : '';

    if (!reason) {
      alert('Mohon masukkan alasan penolakan.');
      return;
    }

    const orders = NyamStore.getOrders();
    const order = orders.find(o => o.id_subpesanan === subId);
    if (order) {
      order.status = 'REJECTED';
      order.alasan_penolakan = reason;
      NyamStore.saveOrders(orders);
      this.playBeep('reject');

      const refundAmount = Number(order.subtotal || order.total_booth_revenue || 0).toLocaleString('id-ID');
      App.showToast(
        'Pesanan Ditolak & Refund Dipicu',
        `${order.id_pesanan} dibatalkan. Pengembalian dana Rp ${refundAmount} diproses ke ${order.nama_pelanggan}.`,
        'danger'
      );
      this.closeModal('modalRejectOrder');

      if (this.viewMode === 'kanban') {
        this.renderKanban();
      } else {
        this.render();
      }

      if (typeof App.updateSidebarBadges === 'function') {
        App.updateSidebarBadges();
      }
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // Simulate an incoming new order
  simulateNewOrder() {
    const orders = NyamStore.getOrders();
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ' WIB';
    const randNum = Math.floor(100 + Math.random() * 900);
    const tableNum = Math.floor(1 + Math.random() * 20);

    const sampleDishes = [
      { nama: "Ayam Geprek Sambal Bawang", qty: 1, harga: 28000, note: "Pedas mantap, garing" },
      { nama: "Ayam Geprek Sambal Matah", qty: 1, harga: 30000, note: "Sambal dipisah" },
      { nama: "Tahu & Tempe Bacem Goreng", qty: 1, harga: 12000, note: "Hangat legit" }
    ];
    const sampleDrinks = [
      { nama: "Es Teh Manis Jumbo", qty: 1, harga: 7000, note: "Sedikit es" },
      { nama: "Es Kopi Susu Gula Aren", qty: 1, harga: 15000, note: "Manis sedang" }
    ];

    // Pick 1 dish and 1 drink
    const dish1 = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
    const dish2 = sampleDrinks[Math.floor(Math.random() * sampleDrinks.length)];
    const items = [dish1, dish2];
    const totalRev = items.reduce((sum, item) => sum + (item.harga * item.qty), 0);

    const newOrder = {
      id_subpesanan: 'SUB-' + Date.now().toString().slice(-4),
      id_pesanan: `ORD-20261008-0${randNum}`,
      waktu: timeStr,
      tanggal: '2026-10-08',
      nama_pelanggan: ['Kristina Ina Helan', 'Budi Santoso', 'Siti Rahmawati', 'Rian Pratama', 'Ayu Lestari', 'Dimas Prasetyo'][Math.floor(Math.random() * 6)],
      no_meja: `Meja ${String(tableNum).padStart(2, '0')}, Area Food Court`,
      items: items,
      catatan_dapur: "Mohon didahulukan, tamu sedang menunggu di meja.",
      subtotal: totalRev,
      total_booth_revenue: totalRev,
      status: "WAITING_ACCEPTANCE",
      metode_bayar: "QRIS Dinamis"
    };

    orders.unshift(newOrder);
    NyamStore.saveOrders(orders);
    this.playBeep('new_order');
    App.showToast(
      '🔔 Pesanan Baru Masuk!',
      `Nomor ${newOrder.id_pesanan} dari ${newOrder.nama_pelanggan} (${newOrder.no_meja}) siap dikonfirmasi.`,
      'warning'
    );

    if (this.viewMode === 'kanban') {
      this.renderKanban();
    } else {
      this.render();
    }

    if (typeof App.updateSidebarBadges === 'function') {
      App.updateSidebarBadges();
    }
  },

  // Helper for badge HTML
  getStatusBadgeHTML(status) {
    switch (status) {
      case 'WAITING_ACCEPTANCE':
        return `<span class="badge badge-waiting">⏳ Menunggu Konfirmasi</span>`;
      case 'IN_PROCESS':
        return `<span class="badge badge-cooking">🍳 Sedang Dimasak</span>`;
      case 'READY':
        return `<span class="badge badge-ready">🔔 Siap Diambil</span>`;
      case 'COMPLETED':
        return `<span class="badge badge-completed">✅ Selesai</span>`;
      case 'REJECTED':
        return `<span class="badge badge-rejected">❌ Ditolak</span>`;
      default:
        return `<span class="badge">${status || 'UNKNOWN'}</span>`;
    }
  },

  // Render Grid View
  render() {
    try {
      const orders = NyamStore.getOrders();
      const gridContainer = document.getElementById('kdsGridView');
      if (!gridContainer) return;

      // Filter logic
      let filtered = orders;
      if (this.currentFilter !== 'ALL') {
        filtered = orders.filter(o => o.status === this.currentFilter);
      }

      if (filtered.length === 0) {
        gridContainer.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 3.5rem; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color); box-shadow: var(--shadow-sm);">
            <div style="font-size: 2.8rem; margin-bottom: 0.75rem;">🍳</div>
            <h3 style="color: var(--text-main); margin-bottom: 0.35rem; font-weight: 600;">Tidak Ada Pesanan pada Kategori Ini</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
              ${this.currentFilter !== 'ALL' ? 'Pilih filter "All Orders" untuk melihat seluruh antrean pesanan dapur.' : 'Antrean pesanan dapur sedang kosong.'}
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
              <button class="btn-primary" onclick="KitchenModule.simulateNewOrder()" style="font-size: 0.8rem; padding: 0.5rem 1.15rem;">
                <span>+ Simulasi Pesanan Masuk</span> 🔔
              </button>
              <button class="btn-secondary" onclick="NyamStore.resetOrders(); KitchenModule.currentFilter='ALL'; KitchenModule.syncViewModeUI(); KitchenModule.render(); App.showToast('Data Dipulihkan', 'Antrean pesanan dapur telah dikembalikan ke data bawaan demo UTS.', 'success');" style="font-size: 0.8rem; padding: 0.5rem 1.15rem;">
                <span>↺ Pulihkan Pesanan Bawaan</span>
              </button>
            </div>
          </div>
        `;
        return;
      }

      gridContainer.innerHTML = filtered.map(order => this.createCardHTML(order, false)).join('');

      if (this.viewMode === 'kanban') {
        this.renderKanban();
      }
    } catch (err) {
      console.error('KitchenModule.render error:', err);
    }
  },

  createCardHTML(order, isDraggable = false) {
    const safeOrder = {
      id_subpesanan: order.id_subpesanan || 'SUB-000',
      id_pesanan: order.id_pesanan || 'ORD-20261008-000',
      waktu: order.waktu || '09:00 WIB',
      nama_pelanggan: order.nama_pelanggan || 'Pelanggan Stan',
      no_meja: order.no_meja || 'Meja',
      items: Array.isArray(order.items) ? order.items : [],
      catatan_dapur: order.catatan_dapur || '',
      status: order.status || 'WAITING_ACCEPTANCE',
      subtotal: Number(order.subtotal || order.total_booth_revenue || 0) || 0,
      total_booth_revenue: Number(order.total_booth_revenue !== undefined ? order.total_booth_revenue : (order.subtotal || 0)) || 0
    };

    let statusClass = '';
    let actionBtnHTML = '';

    if (safeOrder.status === 'WAITING_ACCEPTANCE') {
      statusClass = 'status-waiting';
      actionBtnHTML = `
        <button class="btn-kds-advance btn-kds-accept" data-subid="${safeOrder.id_subpesanan}">
          <span>Terima & Masak</span> 🍳
        </button>
        <button class="btn-kds-reject" data-subid="${safeOrder.id_subpesanan}" title="Tolak Pesanan">
          Tolak
        </button>
      `;
    } else if (safeOrder.status === 'IN_PROCESS') {
      statusClass = 'status-cooking';
      actionBtnHTML = `
        <button class="btn-kds-advance btn-kds-cook" data-subid="${safeOrder.id_subpesanan}">
          <span>Siap Diambil / Diantar</span> 🔔
        </button>
      `;
    } else if (safeOrder.status === 'READY') {
      statusClass = 'status-ready';
      actionBtnHTML = `
        <button class="btn-kds-advance btn-kds-ready" data-subid="${safeOrder.id_subpesanan}">
          <span>Konfirmasi Selesai</span> ✅
        </button>
      `;
    } else if (safeOrder.status === 'COMPLETED') {
      statusClass = 'status-completed';
      actionBtnHTML = `
        <button class="btn-kds-advance btn-kds-completed" disabled>
          <span>✓ Transaksi Selesai</span>
        </button>
      `;
    } else if (safeOrder.status === 'REJECTED') {
      statusClass = 'status-rejected';
      actionBtnHTML = `
        <button class="btn-kds-advance" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);" disabled>
          <span>✗ Pesanan Dibatalkan (Refund)</span>
        </button>
      `;
    }

    return `
      <div class="kds-card ${statusClass}" id="card-${safeOrder.id_subpesanan}" ${isDraggable ? 'draggable="true"' : ''} data-subid="${safeOrder.id_subpesanan}">
        <div class="kds-card-header">
          <div class="kds-card-order-info">
            <span class="kds-order-number">${safeOrder.id_pesanan}</span>
            <span class="kds-order-time">⏰ ${safeOrder.waktu}</span>
          </div>
          ${this.getStatusBadgeHTML(safeOrder.status)}
        </div>

        <div class="kds-card-customer">
          <div class="customer-avatar-icon">👤</div>
          <div class="customer-meta">
            <span class="customer-name">${safeOrder.nama_pelanggan}</span>
            <span class="customer-table">${safeOrder.no_meja}</span>
          </div>
        </div>

        <div class="kds-card-body">
          <div class="kds-items-label">ORDER LIST:</div>
          <div class="kds-items-list">
            ${safeOrder.items.map(item => {
              const qty = Number(item.qty) || 1;
              const price = Number(item.harga) || 0;
              const itemTotal = qty * price;
              return `
                <div class="kds-item-row">
                  <div class="kds-item-main">
                    <span class="kds-item-name">${qty}x ${item.nama || 'Menu'}</span>
                    ${item.note ? `<span class="kds-item-note">💬 ${item.note}</span>` : ''}
                  </div>
                  <span class="kds-item-price">Rp ${itemTotal.toLocaleString('id-ID')}</span>
                </div>
              `;
            }).join('')}
          </div>

          ${safeOrder.catatan_dapur ? `
            <div class="kds-instructions-box">
              <span class="icon">📝</span>
              <span><strong>Catatan Dapur:</strong> ${safeOrder.catatan_dapur}</span>
            </div>
          ` : ''}
        </div>

        <div class="kds-card-footer">
          <div class="kds-revenue-row">
            <span>Total Pendapatan Stan:</span>
            <span class="kds-revenue-amount">Rp ${safeOrder.total_booth_revenue.toLocaleString('id-ID')}</span>
          </div>
          <div class="kds-actions-container">
            ${actionBtnHTML}
          </div>
        </div>
      </div>
    `;
  },

  // Render Kanban Columns for interactive drag and drop
  renderKanban() {
    try {
      const orders = NyamStore.getOrders();
      const columns = {
        'WAITING_ACCEPTANCE': document.getElementById('kanbanWaiting'),
        'IN_PROCESS': document.getElementById('kanbanCooking'),
        'READY': document.getElementById('kanbanReady'),
        'COMPLETED': document.getElementById('kanbanCompleted')
      };

      Object.keys(columns).forEach(status => {
        const col = columns[status];
        if (col) {
          const dropzone = col.querySelector('.kanban-dropzone');
          const countPill = col.querySelector('.kanban-count-pill');
          const statusOrders = orders.filter(o => o.status === status);
          if (countPill) countPill.innerText = statusOrders.length;
          if (dropzone) {
            dropzone.innerHTML = statusOrders.length === 0 
              ? `<div style="text-align: center; color: var(--text-dim); padding: 2rem 0; font-size: 0.8rem;">Tidak ada pesanan</div>`
              : statusOrders.map(o => this.createCardHTML(o, true)).join('');
          }
        }
      });

      this.bindKanbanDragAndDrop();
    } catch (err) {
      console.error('KitchenModule.renderKanban error:', err);
    }
  },

  bindKanbanDragAndDrop() {
    const cards = document.querySelectorAll('.kanban-dropzone .kds-card');
    const dropzones = document.querySelectorAll('.kanban-dropzone');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.subid);
        card.style.opacity = '0.5';
      });

      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });
    });

    dropzones.forEach(dropzone => {
      // Avoid attaching duplicate drag listeners to dropzones
      if (dropzone.dataset.listenersBound === 'true') return;
      dropzone.dataset.listenersBound = 'true';

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const subId = e.dataTransfer.getData('text/plain');
        const targetStatus = dropzone.dataset.targetStatus;

        if (subId && targetStatus) {
          const orders = NyamStore.getOrders();
          const order = orders.find(o => o.id_subpesanan === subId);
          if (order && order.status !== targetStatus) {
            order.status = targetStatus;
            NyamStore.saveOrders(orders);
            KitchenModule.playBeep('advance');

            let statusLabel = targetStatus;
            if (targetStatus === 'WAITING_ACCEPTANCE') statusLabel = 'Menunggu Konfirmasi';
            if (targetStatus === 'IN_PROCESS') statusLabel = 'Sedang Dimasak';
            if (targetStatus === 'READY') statusLabel = 'Siap Saji';
            if (targetStatus === 'COMPLETED') statusLabel = 'Selesai';

            App.showToast('Status Pesanan Diperbarui', `${order.id_pesanan} digeser ke status '${statusLabel}'`, 'success');
            KitchenModule.renderKanban();
            if (typeof App.updateSidebarBadges === 'function') {
              App.updateSidebarBadges();
            }
            if (App.currentRoute === 'dashboard' && typeof App.initDashboard === 'function') {
              App.initDashboard();
            }
          }
        }
      });
    });
  }
};
