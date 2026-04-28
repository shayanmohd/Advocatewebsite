// Advocate Mohd Yunus — site interactions. No frameworks.
(function () {
    'use strict';

    // Footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Sticky nav state
    const nav = document.getElementById('nav');
    const onScroll = () => {
        if (!nav) return;
        nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile nav toggle
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('is-open');
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('is-open');
                toggle.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // FAQ accordion
    document.querySelectorAll('.faq__item').forEach(item => {
        const btn = item.querySelector('.faq__q');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const open = item.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });

    // Reveal-on-scroll
    const revealTargets = document.querySelectorAll(
        '.section-head, .card, .quote, .post, .stats__grid li, .process__list li, .hero__content, .hero__card, .about__media, .about__copy'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(el => io.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('is-in'));
    }

    // Contact form — posts to FormSubmit.co (delivers as email to chamber).
    // Falls back to a mailto: link if the network call fails.
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    const errorEl = document.getElementById('formError');

    if (form) {
        const FORM_ENDPOINT = 'https://formsubmit.co/ajax/contact@advocateyunus.com';

        form.addEventListener('submit', async e => {
            e.preventDefault();

            const data = new FormData(form);
            const name = (data.get('name') || '').toString().trim();
            const email = (data.get('email') || '').toString().trim();
            const msg = (data.get('message') || '').toString().trim();

            if (!name || !email || !msg) {
                form.reportValidity();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalLabel = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
            if (success) success.hidden = true;
            if (errorEl) errorEl.hidden = true;

            try {
                const payload = {};
                data.forEach((v, k) => { if (k !== '_honey') payload[k] = v; });

                const res = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error('Network error');

                form.reset();
                if (success) success.hidden = false;
                setTimeout(() => { if (success) success.hidden = true; }, 12000);
            } catch (err) {
                if (errorEl) errorEl.hidden = false;
                // Mailto fallback: open user's mail client with the message pre-filled.
                const subject = encodeURIComponent('Enquiry — ' + (data.get('area') || 'Legal Consultation'));
                const body = encodeURIComponent(
                    'Name: ' + name + '\n' +
                    'Email: ' + email + '\n' +
                    'Phone: ' + (data.get('phone') || '') + '\n' +
                    'Area: ' + (data.get('area') || '') + '\n\n' +
                    msg
                );
                setTimeout(() => {
                    window.location.href = 'mailto:contact@advocateyunus.com?subject=' + subject + '&body=' + body;
                }, 600);
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel || 'Send Enquiry'; }
            }
        });
    }
})();
