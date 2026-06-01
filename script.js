document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Logika Navbar Active saat Scroll (ScrollSpy) ---
    const sections = document.querySelectorAll('section, footer');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 200)) {
                if (section.hasAttribute('id')) {
                    current = section.getAttribute('id');
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.includes(`#${current}`) && current !== '') {
                link.classList.add('active');
            }
        });
    });

    // --- 2. Interaksi efek klik pada gambar galeri ---
    const images = document.querySelectorAll('.gallery-item');
    images.forEach(img => {
        img.addEventListener('click', () => {
            img.style.transform = 'scale(0.95)';
            setTimeout(() => { img.style.transform = ''; }, 150);
        });
    });

    // --- 3. Logika Interaksi Semua Modal (Alur Pemesanan Lengkap) ---
    const orderModalElement = document.getElementById('orderModal');
    const summaryModalElement = document.getElementById('summaryModal');
    const selfServiceModalElement = document.getElementById('selfServiceModal'); 
    const paymentModalElement = document.getElementById('paymentModal'); 
    const qrisModalElement = document.getElementById('qrisModal'); 
    
    if(orderModalElement && summaryModalElement && paymentModalElement) {
        const orderModal = new bootstrap.Modal(orderModalElement);
        const summaryModal = new bootstrap.Modal(summaryModalElement);
        const paymentModal = new bootstrap.Modal(paymentModalElement);
        
        let selfServiceModal = null;
        if(selfServiceModalElement) selfServiceModal = new bootstrap.Modal(selfServiceModalElement);

        let qrisModal = null;
        if(qrisModalElement) qrisModal = new bootstrap.Modal(qrisModalElement);

        const orderForm = document.getElementById('orderForm');
        let currentServiceTitle = '';
        let selectedPaymentMethod = '';
        
        let countdownInterval;
        const totalTime = 300; 

        // === ELEMEN FORM & ALAMAT ===
        const alamatContainer = document.getElementById('alamatContainer');
        const inputAlamat = document.getElementById('inputAlamat');
        const summaryAlamatContainer = document.getElementById('summaryAlamatContainer');
        const inputHP = document.getElementById('inputHP'); 

        // === VALIDASI REAL-TIME INPUT HP (HANYA ANGKA) ===
        if (inputHP) {
            inputHP.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }

        // A. Klik pada Kartu Layanan (Halaman Utama)
        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach(card => {
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
                    
                    if (alamatContainer) alamatContainer.style.display = 'block';
                    if (inputAlamat) inputAlamat.setAttribute('required', 'required');

                    orderForm.reset();
                    orderModal.show();
                }
            });
        });

        // B. Klik pada Tombol "Ready" di Pemilihan Mesin (Self Service)
        const btnReadys = document.querySelectorAll('.btn-ready');
        btnReadys.forEach(btn => {
            btn.addEventListener('click', function() {
                const machineName = this.parentElement.querySelector('.machine-title').innerText;
                currentServiceTitle = `Self Service (${machineName})`;
                document.getElementById('selectedServiceBadge').innerText = currentServiceTitle;
                
                if (alamatContainer) alamatContainer.style.display = 'none';
                if (inputAlamat) inputAlamat.removeAttribute('required');

                selfServiceModal.hide();
                selfServiceModalElement.addEventListener('hidden.bs.modal', function handler() {
                    orderForm.reset();
                    orderModal.show();
                    selfServiceModalElement.removeEventListener('hidden.bs.modal', handler);
                });
            });
        });

        // C. Form Biodata Di-submit -> Lanjut ke Pembayaran
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const paymentMachineName = document.getElementById('paymentMachineName');
            const paymentMachineIcon = document.getElementById('paymentMachineIcon');
            
            if (currentServiceTitle.includes('Self Service')) {
                const machineMatch = currentServiceTitle.match(/\((.*?)\)/);
                paymentMachineName.innerText = machineMatch ? machineMatch[1] : currentServiceTitle;
                paymentMachineIcon.style.display = 'flex'; 
            } else {
                paymentMachineName.innerText = currentServiceTitle;
                paymentMachineIcon.style.display = 'none'; 
            }

            orderModal.hide();
            orderModalElement.addEventListener('hidden.bs.modal', function handler() {
                paymentModal.show();
                orderModalElement.removeEventListener('hidden.bs.modal', handler);
            });
        });

        // D. Tombol Kembali di Halaman Pembayaran
        document.getElementById('btnBackToForm').addEventListener('click', function() {
            paymentModal.hide();
            paymentModalElement.addEventListener('hidden.bs.modal', function handler() {
                orderModal.show();
                paymentModalElement.removeEventListener('hidden.bs.modal', handler);
            });
        });

        // E. Pilih Metode Pembayaran
        const paymentBtns = document.querySelectorAll('.payment-method-btn');
        paymentBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                selectedPaymentMethod = this.getAttribute('data-method');
                
                if (selectedPaymentMethod === 'QRIS' && qrisModal) {
                    paymentModal.hide();
                    paymentModalElement.addEventListener('hidden.bs.modal', function handler() {
                        startQrisTimer(); 
                        qrisModal.show();
                        paymentModalElement.removeEventListener('hidden.bs.modal', handler);
                    });
                } else if (selectedPaymentMethod === 'Gopay') {
                    window.location.href = 'https://gopay.co.id/';
                } else {
                    executeSuccessFlow();
                }
            });
        });

        // F. Fungsi Hitung Mundur (Timer) QRIS
        function startQrisTimer() {
            clearInterval(countdownInterval);
            let timeLeft = totalTime;
            
            const timerText = document.getElementById('qrisTimerText');
            const progressBar = document.getElementById('qrisProgressBar');

            updateUI(timeLeft);

            countdownInterval = setInterval(() => {
                timeLeft--;
                updateUI(timeLeft);

                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    alert("Waktu pembayaran telah habis.");
                    cancelQrisPayment();
                }
            }, 1000); 

            function updateUI(time) {
                let minutes = Math.floor(time / 60);
                let seconds = time % 60;
                
                minutes = minutes < 10 ? '0' + minutes : minutes;
                seconds = seconds < 10 ? '0' + seconds : seconds;
                
                timerText.innerText = `${minutes}:${seconds}`;

                let percentage = (time / totalTime) * 100;
                progressBar.style.width = `${percentage}%`;
                
                if (time < 60) {
                    progressBar.style.backgroundColor = "#F87171"; 
                } else {
                    progressBar.style.backgroundColor = "#4ADE80";
                }
            }
        }

        // G. Tombol Batalkan Pembayaran (Keluar dari QRIS)
        function cancelQrisPayment() {
            clearInterval(countdownInterval);
            qrisModal.hide();
            qrisModalElement.addEventListener('hidden.bs.modal', function handler() {
                paymentModal.show();
                qrisModalElement.removeEventListener('hidden.bs.modal', handler);
            });
        }
        
        const btnCancelQris = document.getElementById('btnCancelQris');
        if (btnCancelQris) {
            btnCancelQris.addEventListener('click', cancelQrisPayment);
        }

        // H. INTEGRASI API: Fungsi Eksekusi ke Halaman "Berhasil" & Kirim ke Spreadsheet
        function executeSuccessFlow() {
            // 1. Ambil Data
            const nama = document.getElementById('inputNama').value;
            const hp = document.getElementById('inputHP').value;
            const alamat = document.getElementById('inputAlamat').value;
            const layananLengkap = `${currentServiceTitle} - via ${selectedPaymentMethod}`;

            // 2. URL GOOGLE APPS SCRIPT
            const scriptURL = 'https://script.google.com/macros/s/AKfycbwQNKsCjkbn_t6db8EaJfq3e8BNt7KQSvGSMzHhiP8mSPCgXIbnAbmJhdTD0Ev6ec-AYg/exec';
            
            // Ubah teks tombol menjadi loading
            const btnSimulateSuccess = document.getElementById('btnSimulateSuccess');
            let originalBtnText = "";
            if(btnSimulateSuccess) {
                originalBtnText = btnSimulateSuccess.innerHTML;
                btnSimulateSuccess.innerHTML = '(Memproses Data...)';
                btnSimulateSuccess.disabled = true;
            }

            // 3. Gunakan URLSearchParams agar mudah dibaca oleh Apps Script
            const formKirim = new URLSearchParams();
            formKirim.append('nama', nama || 'Tanpa Nama');
            formKirim.append('hp', hp || 'Tanpa Nomor');
            formKirim.append('alamat', alamat || 'Di Tempat (Self Service)');
            formKirim.append('layanan', layananLengkap);

            // 4. Proses Pengiriman Data (Fetch)
            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                body: formKirim // Mengirim data sebagai Form URL Encoded
            })
            .then(response => {
                // 5. Jika Berhasil, tampilkan ringkasan
                document.getElementById('summaryService').innerText = layananLengkap;
                document.getElementById('summaryNama').innerText = `: ${nama}`;
                document.getElementById('summaryHP').innerText = `: ${hp}`;

                if (currentServiceTitle.includes('Self Service')) {
                    if (summaryAlamatContainer) summaryAlamatContainer.style.display = 'none';
                } else {
                    if (summaryAlamatContainer) summaryAlamatContainer.style.display = 'flex'; 
                    document.getElementById('summaryAlamat').innerText = `: ${alamat}`;
                }

                // Tutup modal sebelumnya (Payment / QRIS)
                paymentModal.hide();
                if(qrisModalElement && qrisModalElement.classList.contains('show')) {
                    clearInterval(countdownInterval);
                    qrisModal.hide();
                }

                // Munculkan Modal Sukses
                setTimeout(() => {
                    summaryModal.show();
                }, 500);
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert('Gagal mengirim pesanan ke server. Silakan hubungi admin.');
            })
            .finally(() => {
                // Kembalikan tombol seperti semula & kosongkan form
                if(btnSimulateSuccess) {
                    btnSimulateSuccess.innerHTML = originalBtnText;
                    btnSimulateSuccess.disabled = false;
                }
                orderForm.reset();
            });
        }

        // Tombol testing untuk mensimulasikan pembayaran berhasil
        const btnSimulateSuccess = document.getElementById('btnSimulateSuccess');
        if(btnSimulateSuccess) {
            btnSimulateSuccess.addEventListener('click', executeSuccessFlow);
        }
    }
});
