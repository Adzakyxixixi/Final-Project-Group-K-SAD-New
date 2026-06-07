document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Logika Navbar Active saat Scroll (ScrollSpy) ---
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

    // --- 2. Logika Interaksi Modal ---
    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    const summaryModal = new bootstrap.Modal(document.getElementById('summaryModal'));
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    const selfServiceModal = document.getElementById('selfServiceModal') ? new bootstrap.Modal(document.getElementById('selfServiceModal')) : null;
    const qrisModal = document.getElementById('qrisModal') ? new bootstrap.Modal(document.getElementById('qrisModal')) : null;

    const orderForm = document.getElementById('orderForm');
    let currentServiceTitle = '';
    let selectedPaymentMethod = '';
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_fyb9g26nXUKqpSr0tXsRzOOUfB7uUPLxw16cGBFmhdAoWdVtsO1LqtigxYOzuQGRrg/exec';

    // A. Klik Kartu Layanan
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.addEventListener('click', function() {
            const type = this.querySelector('.pricing-type').innerText.trim().toLowerCase();
            const typeName = this.querySelector('.pricing-type').innerText;
            const duration = this.querySelector('.pricing-number').innerText;
            const unit = this.querySelector('.pricing-unit').innerText;
            
            if (type === 'self service' && selfServiceModal) {
                selfServiceModal.show();
            } else {
                currentServiceTitle = `${typeName} ${duration} ${unit}`;
                document.getElementById('selectedServiceBadge').innerText = currentServiceTitle;
                orderForm.reset();
                orderModal.show();
            }
        });
    });

    // B. Klik "Ready" (Self Service)
    document.querySelectorAll('.btn-ready').forEach(btn => {
        btn.addEventListener('click', function() {
            currentServiceTitle = `Self Service (${this.parentElement.querySelector('.machine-title').innerText})`;
            document.getElementById('selectedServiceBadge').innerText = currentServiceTitle;
            selfServiceModal.hide();
            setTimeout(() => orderModal.show(), 500);
        });
    });

    // C. Submit Form
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        orderModal.hide();
        
        // Logika Percabangan: Jika Self Service -> Bayar. Jika Kiloan -> Bayar Nanti.
        if (currentServiceTitle.toLowerCase().includes('self service')) {
            document.getElementById('paymentMachineName').innerText = currentServiceTitle.match(/\((.*?)\)/)[1];
            document.getElementById('paymentMachineIcon').style.display = 'flex';
            setTimeout(() => paymentModal.show(), 500);
        } else {
            selectedPaymentMethod = 'Bayar Nanti (Setelah Ditimbang)';
            executeSuccessFlow(); // Langsung kirim tanpa modal bayar
        }
    });

    // E. Pilih Metode Bayar (QRIS/Gopay)
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

    // H. Fungsi Kirim Data
    async function executeSuccessFlow() {
        const nama = document.getElementById('inputNama').value;
        const hp = document.getElementById('inputHP').value;
        const alamat = document.getElementById('inputAlamat').value;
        const layananLengkap = `${currentServiceTitle} - via ${selectedPaymentMethod}`;

        // Update Summary Modal
        document.getElementById('summaryService').innerText = layananLengkap;
        document.getElementById('summaryNama').innerText = `: ${nama}`;
        document.getElementById('summaryHP').innerText = `: ${hp}`;
        document.getElementById('summaryAlamat').innerText = `: ${alamat}`;

        // Tutup semua modal aktif
        [paymentModal, qrisModal, orderModal].forEach(m => m && m.hide());

        // Kirim Data
        const formKirim = new URLSearchParams();
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
    }

    // Tombol simulasi bayar QRIS
    document.getElementById('btnSimulateSuccess')?.addEventListener('click', executeSuccessFlow);
    
    // Tombol cancel QRIS
    document.getElementById('btnCancelQris')?.addEventListener('click', () => {
        qrisModal.hide();
        setTimeout(() => paymentModal.show(), 500);
    });
});
