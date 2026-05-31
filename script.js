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
    const qrisModalElement = document.getElementById('qrisModal'); // Modal Baru: QRIS
    
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
        
        // Variabel Timer
        let countdownInterval;
        const totalTime = 300; // 5 menit = 300 detik

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
                    orderForm.reset();
                    orderModal.show();
                }
            });
        });

        // B. Klik pada Tombol "Ready" di Pemilihan Mesin
        const btnReadys = document.querySelectorAll('.btn-ready');
        btnReadys.forEach(btn => {
            btn.addEventListener('click', function() {
                const machineName = this.parentElement.querySelector('.machine-title').innerText;
                currentServiceTitle = `Self Service (${machineName})`;
                document.getElementById('selectedServiceBadge').innerText = currentServiceTitle;
                
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
                    // Jika QRIS, buka Modal QR Code
                    paymentModal.hide();
                    paymentModalElement.addEventListener('hidden.bs.modal', function handler() {
                        startQrisTimer(); // Jalankan waktu
                        qrisModal.show();
                        paymentModalElement.removeEventListener('hidden.bs.modal', handler);
                    });
                } else if (selectedPaymentMethod === 'Gopay') {
                    // Jika Gopay, langsung arahkan ke website Gopay
                    
                    // Opsi 1: Pindah halaman langsung (Buka di tab yang sama)
                    window.location.href = 'https://gopay.co.id/';
                    
                    // Opsi 2: Buka di tab baru (Hapus tanda // di bawah ini jika ingin pakai opsi 2, dan beri // pada opsi 1)
                    // window.open('https://gopay.co.id/', '_blank');
                } else {
                    // Jika ada metode lain di masa depan
                    executeSuccessFlow();
                }
            });
        });

        // F. Fungsi Hitung Mundur (Timer) & Loading Bar QRIS
        function startQrisTimer() {
            clearInterval(countdownInterval);
            let timeLeft = totalTime;
            
            const timerText = document.getElementById('qrisTimerText');
            const progressBar = document.getElementById('qrisProgressBar');

            // Format dan render pertama kali
            updateUI(timeLeft);

            countdownInterval = setInterval(() => {
                timeLeft--;
                updateUI(timeLeft);

                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    // Waktu habis, otomatis kembali ke metode pembayaran
                    alert("Waktu pembayaran telah habis.");
                    cancelQrisPayment();
                }
            }, 1000); // 1000ms = 1 detik

            function updateUI(time) {
                // Konversi ke format MM:SS
                let minutes = Math.floor(time / 60);
                let seconds = time % 60;
                
                // Tambahkan '0' di depan jika angka di bawah 10
                minutes = minutes < 10 ? '0' + minutes : minutes;
                seconds = seconds < 10 ? '0' + seconds : seconds;
                
                timerText.innerText = `${minutes}:${seconds}`;

                // Menghitung persentase sisa untuk loading bar
                let percentage = (time / totalTime) * 100;
                progressBar.style.width = `${percentage}%`;
                
                // Ubah warna bar menjadi merah jika waktu tinggal < 1 menit
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

        // H. Fungsi Eksekusi ke Halaman "Berhasil" (Ringkasan)
        function executeSuccessFlow() {
            const nama = document.getElementById('inputNama').value;
            const hp = document.getElementById('inputHP').value;
            const alamat = document.getElementById('inputAlamat').value;

            document.getElementById('summaryService').innerText = `${currentServiceTitle} - via ${selectedPaymentMethod}`;
            document.getElementById('summaryNama').innerText = `: ${nama}`;
            document.getElementById('summaryHP').innerText = `: ${hp}`;
            document.getElementById('summaryAlamat').innerText = `: ${alamat}`;

            paymentModal.hide();
            if(qrisModalElement && qrisModalElement.classList.contains('show')) {
                clearInterval(countdownInterval);
                qrisModal.hide();
            }

            setTimeout(() => {
                summaryModal.show();
            }, 500);
        }

        // (Opsional) Tombol testing untuk mensimulasikan pembayaran berhasil via QRIS
        const btnSimulateSuccess = document.getElementById('btnSimulateSuccess');
        if(btnSimulateSuccess) {
            btnSimulateSuccess.addEventListener('click', executeSuccessFlow);
        }
    }
});