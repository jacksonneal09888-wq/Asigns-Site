document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptCookiesBtn = document.querySelector('.accept-cookies');
    const projectFileInput = document.getElementById('projectFile');
    const fileNameSpan = document.getElementById('fileName');

    const updateHeader = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader);

    if (burger && nav) {
        const toggleNav = () => nav.classList.toggle('nav-active');
        burger.addEventListener('click', toggleNav);
        nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('nav-active')));
    }

    window.addEventListener('scroll', () => {
        backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    if (!localStorage.getItem('cookieConsent')) {
        cookieConsent.style.display = 'flex';
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        cookieConsent.style.display = 'none';
    });

    if (projectFileInput) {
        projectFileInput.addEventListener('change', () => {
            fileNameSpan.textContent = projectFileInput.files.length ? projectFileInput.files[0].name : 'No file chosen';
        });
    }
});
