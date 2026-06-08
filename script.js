document.addEventListener('DOMContentLoaded', () => {

    function showError(inputEl, msg) {
        let err = inputEl.parentElement.querySelector('.cd-error-msg');
        if (!err) {
            err = document.createElement('div');
            err.className = 'cd-error-msg';
            err.style.cssText = 'color:#dc3545;font-size:0.82rem;margin-top:4px;';
            inputEl.parentElement.appendChild(err);
        }
        err.textContent = msg;
        inputEl.style.borderColor = '#dc3545';
    }

    function clearError(inputEl) {
        const err = inputEl.parentElement.querySelector('.cd-error-msg');
        if (err) err.textContent = '';
        inputEl.style.borderColor = '';
    }

    function validateForm() {
        let valid = true;
        const nama   = document.getElementById('inputNama');
        const hp     = document.getElementById('inputHP');
        const alamat = document.getElementById('inputAlamat');

        if (!nama.value.trim()) {
            showError(nama, 'Nama tidak boleh kosong'); valid = false;
        } else if (nama.value.trim().length < 2) {
            showError(nama, 'Nama minimal 2 karakter'); valid = false;
        } else { clearError(nama); }

        if (!hp.value.trim()) {
            showError(hp, 'Nomor tidak boleh kosong'); valid = false;
        } else if (hp.value.trim().length < 8) {
            showError(hp, 'Nomor terlalu pendek, minimal 8 digit setelah +62'); valid = false;
        } else { clearError(hp); }

        if (!alamat.value.trim()) {
            showError(alamat, 'Alamat tidak boleh kosong'); valid = false;
        } else { clearError(alamat); }

        return valid;
    }

    const inputNama = document.getElementById('inputNama');
    if (inputNama) {
        inputNama.addEventListener('keypress', function(e) {
            if (!/[a-zA-ZÀ-ÿ\s]/.test(String.fromCharCode(e.which))) e.preventDefault();
        });
        inputNama.addEventListener('paste', function(e) {
            e.preventDefault();
            const clean = (e.clipboardData || window.clipboardData).getData('text').replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
            document.execCommand('insertText', false, clean);
        });
        inputNama.addEventListener('blur', function() {
            if (!this.value.trim()) showError(this, 'Nama tidak boleh kosong');
            else clearError(this);
        });
        inputNama.addEventListener('input', function() {
            if (this.value.trim()) clearError(this);
            updateSubmitBtn();
        });
    }

    const inputHP = document.getElementById('inputHP');
    if (inputHP) {
        // Buat wrapper prefix +62
        const hpParent = inputHP.parentElement;
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;align-items:stretch;';
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
            'display:flex',
            'align-items:center',
            'white-space:nowrap'
        ].join(';');
        hpParent.insertBefore(wrapper, inputHP);
        wrapper.appendChild(prefix);
        wrapper.appendChild(inputHP);
        inputHP.style.borderRadius = '0 0.375rem 0.375rem 0';
        inputHP.setAttribute('maxlength', '13');
        inputHP.placeholder = '8123456789';

        inputHP.addEventListener('keypress', function(e) {
            if (!/[0-9]/.test(String.fromCharCode(e.which))) e.preventDefault();
        });
        inputHP.addEventListener('paste', function(e) {
            e.preventDefault();
            const clean = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            document.execCommand('insertText', false, clean);
        });
        inputHP.addEventListener('input', function() {
            // Hapus awalan 0 karena sudah ada +62
            if (this.value.startsWith('0')) this.value = this.value.substring(1);
            if (this.value.trim()) clearError(this);
            updateSubmitBtn();
        });
        inputHP.addEventListener('blur', function() {
            if (!this.value.trim()) showError(this, 'Nomor tidak boleh kosong');
            else if (this.value.length < 8) showError(this, 'Nomor terlalu pendek, minimal 8 digit setelah +62');
            else clearError(this);
        });
    }

    const inputAlamat = document.getElementById('inputAlamat');
    if (inputAlamat) {
        inputAlamat.setAttribute('maxlength', '200');
        const counter = document.createElement('div');
        counter.style.cssText = 'font-size:0.78rem;color:#6c757d;text-align:right;margin-top:2px;';
        counter.textContent = '0 / 200 karakter';
        inputAlamat.parentElement.appendChild(counter);

        inputAlamat.addEventListener('input', function() {
            const len = this.value.length;
            counter.textContent = `${len} / 200 karakter`;
            counter.style.color = len > 180 ? '#dc3545' : '#6c757d';
            if (this.value.trim()) clearError(this);
            updateSubmitBtn();
        });
        inputAlamat.addEventListener('blur', function() {
            if (!this.value.trim()) showError(this, 'Alamat tidak boleh kosong');
            else clearError(this);
        });
    }

    const submitBtn = document.querySelector('#orderForm button[type="submit"]');

    function updateSubmitBtn() {
        if (!submitBtn) return;
        const namaOk   = inputNama  && inputNama.value.trim().length >= 2;
        const hpOk     = inputHP    && inputHP.value.trim().length >= 8;
        const alamatOk = inputAlamat && inputAlamat.value.trim().length >= 3;
        const allOk = namaOk && hpOk && alamatOk;
        submitBtn.disabled  = !allOk;
        submitBtn.style.opacity = allOk ? '1' : '0.55';
        submitBtn.style.cursor  = allOk ? 'pointer' : 'not-allowed';
    }

    // Initial state — nonaktifkan tombol submit
    if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.55'; submitBtn.style.cursor = 'not-allowed'; }

    // Reset tombol & counter saat modal dibuka ulang
    document.getElementById('orderModal')?.addEventListener('show.bs.modal', function() {
        updateSubmitBtn();
        if (inputAlamat) {
            const counter = inputAlamat.parentElement.querySelector('div[style*="text-align:right"]');
            if (counter) counter.textContent = '0 / 200 karakter';
        }
    });

    const sections = document.querySelectorAll('section, footer');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 200)) {
                if (section.hasAttribute('id')) current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.includes(`#${current}`) && current !== '') link.classList.add('active');
        });
    });

    const orderModal       = new bootstrap.Modal(document.getElementById('orderModal'));
    const summaryModal     = new bootstrap.Modal(document.getElementById('summaryModal'));
    const paymentModal     = new bootstrap.Modal(document.getElementById('paymentModal'));
    const selfServiceModal = document.getElementById('selfServiceModal') ? new bootstrap.Modal(document.getElementById('selfServiceModal')) : null;
    const qrisModal        = document.getElementById('qrisModal')        ? new bootstrap.Modal(document.getElementById('qrisModal'))        : null;

    const orderForm = document.getElementById('orderForm');
    let currentServiceTitle  = '';
    let selectedPaymentMethod = '';
    
    // URL GOOGLE APPS SCRIPT
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_fyb9g26nXUKqpSr0tXsRzOOUfB7uUPLxw16cGBFmhdAoWdVtsO1LqtigxYOzuQGRrg/exec';

    document.querySelectorAll('.pricing-card').forEach(card => {
        card.addEventListener('click', function() {
            const type     = this.querySelector('.pricing-type').innerText.trim().toLowerCase();
            const typeName = this.querySelector('.pricing-type').innerText;
            const duration = this.querySelector('.pricing-number').innerText;
            const unit     = this.querySelector('.pricing-unit').innerText;

            if (type === 'self service' && selfServiceModal) {
                selfServiceModal.show();
            } else {
                currentServiceTitle = `${typeName} ${duration} ${unit}`;
                document.getElementById('selectedServiceBadge').innerText = currentServiceTitle;
                orderForm.reset();
                updateSubmitBtn(); 
                orderModal.show();
            }
        });
    });

    const LOCK_TTL_MS = 5 * 60 * 1000; // 5 menit

    function lockMachine(id)   { try { localStorage.setItem('ml_' + id, Date.now().toString()); } catch(e) {} }
    function unlockMachine(id) { try { localStorage.removeItem('ml_' + id); } catch(e) {} }
    function isMachineLocked(id) {
        try {
            const ts = localStorage.getItem('ml_' + id);
            if (!ts) return false;
            if (Date.now() - parseInt(ts) > LOCK_TTL_MS) { localStorage.removeItem('ml_' + id); return false; }
            return true;
        } catch(e) { return false; }
    }

    function showMachineTaken(card) {
        const old = card.querySelector('.cd-taken');
        if (old) old.remove();
        const ov = document.createElement('div');
        ov.className = 'cd-taken';
        ov.style.cssText = 'position:absolute;inset:0;background:rgba(220,53,69,0.88);border-radius:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;';
        ov.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" style="margin-bottom:8px">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
            </svg>
            <span style="color:white;font-weight:700;font-size:0.9rem;text-align:center;padding:0 8px">Mesin tidak<br>tersedia lagi</span>`;
        card.style.position = 'relative';
        card.appendChild(ov);
        const btn = card.querySelector('.btn-ready');
        if (btn) { btn.disabled = true; btn.textContent = 'Not Ready'; btn.classList.replace('btn-ready','btn-not-ready'); }
    }

    function attachReadyButtons() {
        document.querySelectorAll('.btn-ready').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.btn-ready').forEach(btn => {
            btn.addEventListener('click', function() {
                const card      = this.closest('.machine-card');
                const machineId = card?.dataset.machineId || this.closest('[data-machine-id]')?.dataset.machineId || this.parentElement.querySelector('.machine-title')?.innerText || 'unknown';

                if (card && !card.dataset.machineId) card.dataset.machineId = machineId;

                if (isMachineLocked(machineId)) {
                    showMachineTaken(card);
                    return;
                }

                lockMachine(machineId);
                window._activeMachineId = machineId;
                window._paymentSuccess  = false;

                currentServiceTitle = `Self Service (${card?.querySelector('.machine-title')?.innerText || machineId})`;
                document.getElementById('selectedServiceBadge').innerText = currentServiceTitle;
                orderForm.reset();
                updateSubmitBtn();

                if (selfServiceModal) selfServiceModal.hide();
                setTimeout(() => orderModal.show(), 500);
            });
        });
    }

    document.getElementById('selfServiceModal')?.addEventListener('shown.bs.modal', attachReadyButtons);
    attachReadyButtons();

    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!validateForm()) return;

        orderModal.hide();

        if (currentServiceTitle.toLowerCase().includes('self service')) {
            const match = currentServiceTitle.match(/\((.*?)\)/);
            document.getElementById('paymentMachineName').innerText = match ? match[1] : currentServiceTitle;
            document.getElementById('paymentMachineIcon').style.display = 'flex';
            setTimeout(() => paymentModal.show(), 500);
        } else {
            selectedPaymentMethod = 'Bayar Nanti (Setelah Ditimbang)';
            executeSuccessFlow();
        }
    });

    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedPaymentMethod = this.getAttribute('data-method');
            if (selectedPaymentMethod === 'QRIS' && qrisModal) {
                paymentModal.hide();
                setTimeout(() => qrisModal.show(), 500);
            } else if (selectedPaymentMethod === 'Gopay') {
                window.location.href = 'https://gopay.co.id/';
            } else {
                executeSuccessFlow();
            }
        });
    });

    /* ══════════════════════════════════════
       MENGIRIM PESANAN BARU KE GOOGLE SHEETS
    ══════════════════════════════════════ */
    async function executeSuccessFlow() {
        window._paymentSuccess = true;

        const nama   = document.getElementById('inputNama').value;
        const hp     = '+62' + document.getElementById('inputHP').value;
        const alamat = document.getElementById('inputAlamat').value;
        const layananLengkap = `${currentServiceTitle} - via ${selectedPaymentMethod}`;

        document.getElementById('summaryService').innerText = layananLengkap;
        document.getElementById('summaryNama').innerText    = `: ${nama}`;
        document.getElementById('summaryHP').innerText      = `: ${hp}`;
        document.getElementById('summaryAlamat').innerText  = `: ${alamat}`;

        [paymentModal, qrisModal, orderModal].forEach(m => m && m.hide());

        // PENTING: Menambahkan action "newOrder" agar terbaca oleh Kode.gs
        const formKirim = new URLSearchParams();
        formKirim.append('action', 'newOrder'); // <--- INI KUNCI UTAMANYA
        formKirim.append('layanan', layananLengkap);
        formKirim.append('nama', nama);
        formKirim.append('hp', hp);
        formKirim.append('alamat', alamat);

        try {
            await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: formKirim });
            console.log('Pesanan masuk ke sistem!');
        } catch(err) {
            console.error('Gagal kirim:', err);
        }

        setTimeout(() => summaryModal.show(), 500);
        orderForm.reset();
        updateSubmitBtn();

        if (window._activeMachineId) unlockMachine(window._activeMachineId);
    }

    document.getElementById('btnSimulateSuccess')?.addEventListener('click', executeSuccessFlow);

    document.getElementById('btnCancelQris')?.addEventListener('click', () => {
        window._paymentSuccess = false;
        if (window._activeMachineId) unlockMachine(window._activeMachineId);
        if (qrisModal) qrisModal.hide();
        setTimeout(() => paymentModal.show(), 500);
    });

    document.getElementById('paymentModal')?.addEventListener('hidden.bs.modal', function() {
        if (!window._paymentSuccess && window._activeMachineId) {
            unlockMachine(window._activeMachineId);
        }
    });

    /* ══════════════════════════════════════
       LOGIN LOCKOUT SYSTEM
    ══════════════════════════════════════ */
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MS   = 15 * 60 * 1000;
    const STORAGE_KEY  = 'papicilo_login_attempts';

    function getAttemptData()   { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : { count: 0, lockedAt: null }; } catch(e) { return { count:0, lockedAt:null }; } }
    function saveAttemptData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch(e) {} }
    function resetAttempts()    { try { localStorage.removeItem(STORAGE_KEY); } catch(e) {} }
    function isLockedOut()      { const d = getAttemptData(); if (!d.lockedAt) return false; if (Date.now() - d.lockedAt >= LOCKOUT_MS) { resetAttempts(); return false; } return true; }
    function getRemainingLockMs(){ const d = getAttemptData(); return d.lockedAt ? Math.max(0, LOCKOUT_MS - (Date.now() - d.lockedAt)) : 0; }

    function showLoginError(msg) { const e = document.getElementById('adminLoginError'); if (e) { e.textContent = msg; e.style.display = 'block'; } }
    function clearLoginError()   { const e = document.getElementById('adminLoginError'); if (e) e.style.display = 'none'; }

    function startLockoutCountdown() {
        const interval = setInterval(() => {
            const rem = getRemainingLockMs();
            if (rem <= 0) {
                clearInterval(interval);
                clearLoginError();
                document.getElementById('adminLoginForm')?.querySelectorAll('input,button').forEach(el => el.disabled = false);
                return;
            }
            const m = Math.floor(rem / 60000);
            const s = Math.floor((rem % 60000) / 1000);
            showLoginError(`Akun terkunci. Coba lagi dalam ${m}:${s.toString().padStart(2,'0')} menit.`);
        }, 1000);
    }

    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        if (isLockedOut()) {
            adminLoginForm.querySelectorAll('input,button').forEach(el => el.disabled = true);
            showLoginError('Akun terkunci. Silakan tunggu.');
            startLockoutCountdown();
        }
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (isLockedOut()) { showLoginError('Akun terkunci. Silakan tunggu.'); return; }

            const username = document.getElementById('adminUsername')?.value.trim();
            const password = document.getElementById('adminPassword')?.value.trim();

            const loginSuccess = (username === 'admin' && password === 'papicilo123');

            if (loginSuccess) {
                resetAttempts(); clearLoginError();
                alert('Login berhasil!');
            } else {
                const data = getAttemptData();
                data.count += 1;
                if (data.count >= MAX_ATTEMPTS) {
                    data.lockedAt = Date.now();
                    saveAttemptData(data);
                    adminLoginForm.querySelectorAll('input,button').forEach(el => el.disabled = true);
                    showLoginError('Akun terkunci selama 15 menit karena terlalu banyak percobaan gagal.');
                    startLockoutCountdown();
                } else {
                    saveAttemptData(data);
                    showLoginError(`Username atau password salah. ${MAX_ATTEMPTS - data.count} percobaan tersisa.`);
                }
            }
        });
    }

}); // end DOMContentLoaded
