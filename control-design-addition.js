/* ============================================================
   PAPICILO LAUNDRY — CONTROL DESIGN ADDITIONS
   Tambahkan kode ini ke script.js yang sudah ada.
   Semua fungsi baru tidak menimpa logika yang sudah ada.
   ============================================================ */


/* ============================================================
   BAGIAN 1 — FORM PEMESANAN
   Control: Nama, HP, Alamat, Completeness Check
   ============================================================ */

(function initFormControls() {

  /* ---- Utility: tampilkan / sembunyikan pesan error ---- */
  function showError(inputEl, msg) {
    let err = inputEl.parentElement.querySelector('.cd-error-msg');
    if (!err) {
      err = document.createElement('div');
      err.className = 'cd-error-msg';
      err.style.cssText = 'color:#dc3545;font-size:0.82rem;margin-top:4px;';
      inputEl.parentElement.appendChild(err);
    }
    err.textContent = msg;
    inputEl.classList.add('is-invalid');
    inputEl.style.borderColor = '#dc3545';
  }

  function clearError(inputEl) {
    const err = inputEl.parentElement.querySelector('.cd-error-msg');
    if (err) err.textContent = '';
    inputEl.classList.remove('is-invalid');
    inputEl.style.borderColor = '';
  }

  /* ---- NAMA LENGKAP: hanya huruf dan spasi ---- */
  const inputNama = document.getElementById('inputNama');
  if (inputNama) {

    // Tolak karakter bukan huruf & spasi saat mengetik
    inputNama.addEventListener('keypress', function (e) {
      const char = String.fromCharCode(e.which);
      if (!/[a-zA-ZÀ-ÿ\s]/.test(char)) {
        e.preventDefault();
      }
    });

    // Cegah paste angka / karakter spesial
    inputNama.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const clean = pasted.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
      document.execCommand('insertText', false, clean);
    });

    // Validasi saat blur (pindah field)
    inputNama.addEventListener('blur', function () {
      if (!this.value.trim()) {
        showError(this, 'Nama tidak boleh kosong');
      } else {
        clearError(this);
      }
    });

    inputNama.addEventListener('input', function () {
      if (this.value.trim()) clearError(this);
    });
  }


  /* ---- NOMOR WHATSAPP/HP ---- */
  const inputHP = document.getElementById('inputHP');
  if (inputHP) {

    // Prefix +62 yang terkunci — tampilkan placeholder dinamis
    inputHP.placeholder = 'Contoh: 8123456789';

    // Buat wrapper dengan prefix visual
    const hpWrapper = document.createElement('div');
    hpWrapper.style.cssText = 'display:flex;align-items:center;gap:0;';
    const prefix = document.createElement('span');
    prefix.textContent = '+62';
    prefix.style.cssText = [
      'background:#e9ecef',
      'border:1px solid #ced4da',
      'border-right:none',
      'padding:0.375rem 0.65rem',
      'border-radius:0.375rem 0 0 0.375rem',
      'font-size:1rem',
      'color:#495057',
      'white-space:nowrap',
      'height:calc(1.5em + 0.75rem + 2px)',
      'display:flex',
      'align-items:center'
    ].join(';');

    inputHP.parentNode.insertBefore(hpWrapper, inputHP);
    hpWrapper.appendChild(prefix);
    hpWrapper.appendChild(inputHP);
    inputHP.style.borderRadius = '0 0.375rem 0.375rem 0';

    // Hanya numerik
    inputHP.addEventListener('keypress', function (e) {
      if (!/[0-9]/.test(String.fromCharCode(e.which))) {
        e.preventDefault();
      }
    });

    // Cegah paste non-numerik
    inputHP.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const clean = pasted.replace(/\D/g, '');
      document.execCommand('insertText', false, clean);
    });

    // Pastikan tidak diawali 0 (karena sudah ada +62)
    inputHP.addEventListener('input', function () {
      if (this.value.startsWith('0')) {
        this.value = this.value.substring(1);
      }
      if (this.value.trim()) clearError(this);
    });

    // Maksimal 13 digit setelah +62 (total 15 digit)
    inputHP.setAttribute('maxlength', '13');

    inputHP.addEventListener('blur', function () {
      if (!this.value.trim()) {
        showError(this, 'Nomor tidak boleh kosong');
      } else if (this.value.length < 8) {
        showError(this, 'Nomor terlalu pendek, minimal 8 digit setelah +62');
      } else {
        clearError(this);
      }
    });
  }


  /* ---- ALAMAT: maksimal 200 karakter + counter ---- */
  const inputAlamat = document.getElementById('inputAlamat');
  if (inputAlamat) {
    inputAlamat.setAttribute('maxlength', '200');

    // Counter karakter
    const counter = document.createElement('div');
    counter.style.cssText = 'font-size:0.78rem;color:#6c757d;text-align:right;margin-top:2px;';
    counter.textContent = '0 / 200 karakter';
    inputAlamat.parentElement.appendChild(counter);

    inputAlamat.addEventListener('input', function () {
      const len = this.value.length;
      counter.textContent = `${len} / 200 karakter`;
      counter.style.color = len > 180 ? '#dc3545' : '#6c757d';
      if (this.value.trim()) clearError(this);
    });

    inputAlamat.addEventListener('blur', function () {
      if (!this.value.trim()) {
        showError(this, 'Alamat tidak boleh kosong');
      } else {
        clearError(this);
      }
    });
  }


  /* ---- COMPLETENESS CHECK — tombol submit non-aktif jika belum valid ---- */
  const orderForm = document.getElementById('orderForm');
  const submitBtn = orderForm ? orderForm.querySelector('button[type="submit"]') : null;

  function checkFormCompleteness() {
    if (!submitBtn) return;
    const namaOk  = inputNama  && inputNama.value.trim().length >= 2;
    const hpOk    = inputHP    && inputHP.value.trim().length >= 8;
    const alamatOk = inputAlamat && inputAlamat.value.trim().length >= 5;

    const allOk = namaOk && hpOk && alamatOk;
    submitBtn.disabled = !allOk;
    submitBtn.style.opacity = allOk ? '1' : '0.55';
    submitBtn.style.cursor  = allOk ? 'pointer' : 'not-allowed';
  }

  // Jalankan check setiap ada perubahan di form
  if (orderForm) {
    orderForm.addEventListener('input', checkFormCompleteness);
    // Initial state — tombol non-aktif
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.55';
      submitBtn.style.cursor  = 'not-allowed';
    }
  }


  /* ---- KONFIRMASI SEBELUM SUBMIT (Summary Modal) ----
     Asumsi: summaryModal, summaryNama, summaryHP,
     summaryAlamat, summaryService sudah ada di HTML.
     Tambahkan HP dengan prefix +62 di summary.        ---- */
  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validasi final sebelum buka summary
      let valid = true;
      if (!inputNama.value.trim()) { showError(inputNama, 'Nama tidak boleh kosong'); valid = false; }
      if (!inputHP.value.trim())   { showError(inputHP,   'Nomor tidak boleh kosong'); valid = false; }
      if (!inputAlamat.value.trim()){ showError(inputAlamat,'Alamat tidak boleh kosong'); valid = false; }
      if (!valid) return;

      // Isi summary dengan prefix +62
      const summaryHP = document.getElementById('summaryHP');
      if (summaryHP) summaryHP.textContent = '+62' + inputHP.value.trim();

      const summaryNama = document.getElementById('summaryNama');
      if (summaryNama) summaryNama.textContent = inputNama.value.trim();

      const summaryAlamat = document.getElementById('summaryAlamat');
      if (summaryAlamat) summaryAlamat.textContent = inputAlamat.value.trim();

      // Tutup orderModal, buka summaryModal
      const orderModal   = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
      const summaryModal = new bootstrap.Modal(document.getElementById('summaryModal'));
      if (orderModal) orderModal.hide();
      setTimeout(() => summaryModal.show(), 400);
    });
  }

})(); // end initFormControls


/* ============================================================
   BAGIAN 2 — STATUS MESIN: RACE CONDITION HANDLER
   Skenario: dua pengguna klik mesin yang sama hampir bersamaan.
   Di sini disimulasikan dengan localStorage sebagai shared state
   sederhana. Pada implementasi nyata, gunakan WebSocket / REST API.
   ============================================================ */

(function initMachineRaceControl() {

  // Simulasi shared lock antar tab/window menggunakan localStorage
  // Key: 'machine_lock_{machineId}', Value: timestamp lock
  const LOCK_TTL_MS = 5 * 60 * 1000; // 5 menit (sesuai session timeout)

  function lockMachine(machineId) {
    try {
      localStorage.setItem('machine_lock_' + machineId, Date.now().toString());
    } catch(e) { /* localStorage tidak tersedia */ }
  }

  function unlockMachine(machineId) {
    try {
      localStorage.removeItem('machine_lock_' + machineId);
    } catch(e) {}
  }

  function isMachineLocked(machineId) {
    try {
      const ts = localStorage.getItem('machine_lock_' + machineId);
      if (!ts) return false;
      // Lock expired?
      if (Date.now() - parseInt(ts) > LOCK_TTL_MS) {
        localStorage.removeItem('machine_lock_' + machineId);
        return false;
      }
      return true;
    } catch(e) { return false; }
  }

  // Tambahkan data-machine-id ke setiap card mesin
  // (Jika belum ada di HTML, script ini akan attach otomatis)
  function attachMachineIds() {
    const cards = document.querySelectorAll('.machine-card');
    cards.forEach(function(card, idx) {
      if (!card.dataset.machineId) {
        card.dataset.machineId = 'machine_' + (idx + 1);
      }
    });
  }

  // Tampilkan overlay "Mesin tidak tersedia lagi" pada card
  function showMachineTakenOverlay(card) {
    // Hapus overlay lama jika ada
    const existing = card.querySelector('.cd-taken-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'cd-taken-overlay';
    overlay.style.cssText = [
      'position:absolute',
      'inset:0',
      'background:rgba(220,53,69,0.88)',
      'border-radius:inherit',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'z-index:10',
      'animation:cdFadeIn 0.3s ease'
    ].join(';');
    overlay.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white" style="margin-bottom:8px">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
                 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 
                 17 12 13.41 8.41 17 7 15.59 10.59 12 7 
                 8.41 8.41 7 12 10.59 15.59 7 17 8.41 
                 13.41 12 17 15.59z"/>
      </svg>
      <span style="color:white;font-weight:700;font-size:0.9rem;text-align:center;padding:0 8px">
        Mesin tidak<br>tersedia lagi
      </span>`;
    card.style.position = 'relative';
    card.appendChild(overlay);

    // Disable tombol ready di dalam card ini
    const btn = card.querySelector('.btn-ready');
    if (btn) { btn.disabled = true; btn.classList.remove('btn-ready'); btn.classList.add('btn-not-ready'); btn.textContent = 'Not Ready'; }
  }

  // Intercept klik tombol Ready
  function handleReadyClick(e) {
    const btn  = e.currentTarget;
    const card = btn.closest('.machine-card');
    if (!card) return;

    const machineId = card.dataset.machineId || 'machine_unknown';

    // Cek apakah mesin sudah dikunci pengguna lain
    if (isMachineLocked(machineId)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showMachineTakenOverlay(card);
      return;
    }

    // Kunci mesin untuk pengguna ini
    lockMachine(machineId);

    // Simpan machineId aktif untuk digunakan saat pembayaran selesai/batal
    window._activeMachineId = machineId;
  }

  // Attach event setelah modal self-service muncul
  const selfServiceModal = document.getElementById('selfServiceModal');
  if (selfServiceModal) {
    selfServiceModal.addEventListener('shown.bs.modal', function () {
      attachMachineIds();

      const readyBtns = selfServiceModal.querySelectorAll('.btn-ready');
      readyBtns.forEach(function(btn) {
        // Hapus listener lama supaya tidak double-bind
        btn.removeEventListener('click', handleReadyClick);
        btn.addEventListener('click', handleReadyClick);
      });
    });
  }

  // Unlock mesin jika pengguna batal (menutup payment modal)
  const paymentModal = document.getElementById('paymentModal');
  if (paymentModal) {
    paymentModal.addEventListener('hidden.bs.modal', function () {
      // Hanya unlock jika pembayaran BELUM sukses
      if (!window._paymentSuccess && window._activeMachineId) {
        unlockMachine(window._activeMachineId);
      }
    });
  }

  // Unlock juga jika batal dari QRIS modal
  const btnCancelQris = document.getElementById('btnCancelQris');
  if (btnCancelQris) {
    btnCancelQris.addEventListener('click', function () {
      window._paymentSuccess = false;
      if (window._activeMachineId) unlockMachine(window._activeMachineId);
    });
  }

  // Tandai sukses saat simulasi bayar berhasil
  const btnSimSuccess = document.getElementById('btnSimulateSuccess');
  if (btnSimSuccess) {
    btnSimSuccess.addEventListener('click', function () {
      window._paymentSuccess = true;
      // Mesin tetap terkunci selama sesi berjalan (TTL 5 menit)
      // Akan auto-unlock setelah TTL habis
    });
  }

  // Inject animasi CSS sekali
  if (!document.getElementById('cd-race-style')) {
    const style = document.createElement('style');
    style.id = 'cd-race-style';
    style.textContent = `
      @keyframes cdFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to   { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

})(); // end initMachineRaceControl


/* ============================================================
   BAGIAN 3 — LOGIN ADMIN: LOCKOUT CONTROL
   Asumsi: ada halaman/modal login admin terpisah.
   Pasang di elemen dengan id yang sesuai di bawah.
   Jika belum ada modal login, buat dulu di HTML dengan
   id="adminLoginForm", "adminUsername", "adminPassword",
   "adminLoginError".
   ============================================================ */

(function initLoginLockout() {

  const MAX_ATTEMPTS  = 5;
  const LOCKOUT_MS    = 15 * 60 * 1000; // 15 menit
  const STORAGE_KEY   = 'papicilo_login_attempts';

  function getAttemptData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { count: 0, lockedAt: null };
    } catch(e) { return { count: 0, lockedAt: null }; }
  }

  function saveAttemptData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
  }

  function resetAttempts() {
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  }

  function isLockedOut() {
    const data = getAttemptData();
    if (!data.lockedAt) return false;
    const elapsed = Date.now() - data.lockedAt;
    if (elapsed >= LOCKOUT_MS) {
      resetAttempts();
      return false;
    }
    return true;
  }

  function getRemainingLockMs() {
    const data = getAttemptData();
    if (!data.lockedAt) return 0;
    return Math.max(0, LOCKOUT_MS - (Date.now() - data.lockedAt));
  }

  function showLoginError(msg) {
    const errEl = document.getElementById('adminLoginError');
    if (errEl) {
      errEl.textContent  = msg;
      errEl.style.display = 'block';
    }
  }

  function clearLoginError() {
    const errEl = document.getElementById('adminLoginError');
    if (errEl) errEl.style.display = 'none';
  }

  // Countdown display selama lockout
  function startLockoutCountdown() {
    const errEl = document.getElementById('adminLoginError');
    if (!errEl) return;

    const interval = setInterval(function () {
      const remaining = getRemainingLockMs();
      if (remaining <= 0) {
        clearInterval(interval);
        clearLoginError();
        const form = document.getElementById('adminLoginForm');
        if (form) {
          form.querySelectorAll('input, button').forEach(el => el.disabled = false);
        }
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      errEl.textContent = `Akun terkunci. Coba lagi dalam ${mins}:${secs.toString().padStart(2,'0')} menit.`;
    }, 1000);
  }

  const adminLoginForm = document.getElementById('adminLoginForm');
  if (!adminLoginForm) return; // Keluar jika form login belum ada di HTML

  // Cek lockout saat halaman dimuat
  if (isLockedOut()) {
    adminLoginForm.querySelectorAll('input, button').forEach(el => el.disabled = true);
    showLoginError('Akun terkunci. Silakan tunggu.');
    startLockoutCountdown();
  }

  adminLoginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Cek lockout sebelum proses
    if (isLockedOut()) {
      showLoginError('Akun terkunci. Silakan tunggu.');
      return;
    }

    const username = document.getElementById('adminUsername')?.value.trim();
    const password = document.getElementById('adminPassword')?.value.trim();

    // ---- Simulasi validasi (ganti dengan fetch API di implementasi nyata) ----
    const VALID_USER = 'admin';   // ganti dengan cek ke server
    const VALID_PASS = 'papicilo123'; // ganti dengan cek ke server
    const loginSuccess = (username === VALID_USER && password === VALID_PASS);
    // --------------------------------------------------------------------------

    if (loginSuccess) {
      resetAttempts();
      clearLoginError();
      // Redirect ke dashboard admin
      // window.location.href = '/admin/dashboard';
      alert('Login berhasil!'); // placeholder
    } else {
      const data = getAttemptData();
      data.count += 1;

      if (data.count >= MAX_ATTEMPTS) {
        data.lockedAt = Date.now();
        saveAttemptData(data);
        adminLoginForm.querySelectorAll('input, button').forEach(el => el.disabled = true);
        showLoginError('Akun terkunci selama 15 menit karena terlalu banyak percobaan gagal.');
        startLockoutCountdown();
      } else {
        saveAttemptData(data);
        const remaining = MAX_ATTEMPTS - data.count;
        // Pesan tidak membedakan username salah vs password salah (sesuai control design)
        showLoginError(`Username atau password salah. ${remaining} percobaan tersisa sebelum akun terkunci.`);
      }
    }
  });

  // Inject style error login jika belum ada
  if (!document.getElementById('cd-login-style')) {
    const style = document.createElement('style');
    style.id = 'cd-login-style';
    style.textContent = `
      #adminLoginError {
        display: none;
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 6px;
        padding: 10px 14px;
        font-size: 0.875rem;
        color: #856404;
        margin-top: 12px;
      }
    `;
    document.head.appendChild(style);
  }

})(); // end initLoginLockout
