document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Logika untuk Scrollspy (Ubah menu aktif otomatis saat discroll)
    const sections = document.querySelectorAll("div[id], section[id]");
    const navLinks = document.querySelectorAll(".nav-links li a");

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3 // Memicu perubahan jika 30% area section terlihat di layar
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let currentId = entry.target.getAttribute('id');
                
                // Hapus semua status aktif di menu
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    // Tambahkan status aktif pada menu yang cocok dengan ID
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // 2. Logika untuk Mobile Menu Hamburger
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-links');

    if(hamburger) {
        hamburger.addEventListener('click', () => {
            if (navMenu.style.display === 'flex') {
                navMenu.style.display = 'none';
            } else {
                navMenu.style.display = 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '70px';
                navMenu.style.right = '8%';
                navMenu.style.backgroundColor = '#125b8a';
                navMenu.style.padding = '20px';
                navMenu.style.borderRadius = '8px';
            }
        });
    }
});