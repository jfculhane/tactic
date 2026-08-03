// Tactic-UX — shared behavior for all silo pages
// (index.html, community.html, development.html, experimental.html)

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Accordion ---------- */
  const items = document.querySelectorAll('.accordion-item');

  function openItem(item, { updateHash = true } = {}) {
    const trigger = item.querySelector('.accordion-trigger');
    items.forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
    });
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    if (updateHash) {
      history.replaceState(null, '', '#' + item.id);
    }
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) {
        // Allow closing the currently open item; clear the hash since nothing is expanded
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } else {
        openItem(item);
      }
    });
  });

  // Deep-link support: /page.html#project-02 opens and scrolls to that entry
  function openFromHash() {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    const target = document.getElementById(id);
    if (target && target.classList.contains('accordion-item')) {
      openItem(target, { updateHash: false });
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------- Video placeholders ---------- */
  document.querySelectorAll('.video-frame').forEach((frame) => {
    frame.addEventListener('click', () => {
      if (frame.querySelector('iframe')) return;
      // Wire up a real embed URL when available, e.g.:
      // frame.innerHTML = '<iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Project video" allow="autoplay; fullscreen" allowfullscreen></iframe>';
    });
  });

  /* ---------- IA / UX Gallery + Lightbox ---------- */
  const galleries = document.querySelectorAll('.ia-gallery');
  const lightbox = document.querySelector('.lightbox-overlay');

  if (galleries.length && lightbox) {
    const lightboxMedia   = lightbox.querySelector('.lightbox-media');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxCount   = lightbox.querySelector('.lightbox-count');
    const closeBtn        = lightbox.querySelector('.lightbox-close');
    const prevBtn         = lightbox.querySelector('.lightbox-prev');
    const nextBtn         = lightbox.querySelector('.lightbox-next');

    let activeItems = [];
    let activeIndex = 0;
    let lastFocused = null;

    function showItem(index) {
      activeIndex = (index + activeItems.length) % activeItems.length;
      const item = activeItems[activeIndex];
      const template = item.querySelector('.ia-gallery-full');
      const caption = item.querySelector('.ia-gallery-caption')?.textContent ?? '';

      lightboxMedia.innerHTML = '';
      lightboxMedia.appendChild(template.content.cloneNode(true));
      lightboxCaption.textContent = caption;
      lightboxCount.textContent = (activeIndex + 1) + ' / ' + activeItems.length;
    }

    function openLightbox(gallery, startIndex) {
      activeItems = Array.from(gallery.querySelectorAll('.ia-gallery-item'));
      lastFocused = document.activeElement;
      showItem(startIndex);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    galleries.forEach((gallery) => {
      const items = Array.from(gallery.querySelectorAll('.ia-gallery-item'));
      items.forEach((item, index) => {
        item.querySelector('.ia-gallery-trigger')
          .addEventListener('click', () => openLightbox(gallery, index));
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => showItem(activeIndex - 1));
    nextBtn.addEventListener('click', () => showItem(activeIndex + 1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showItem(activeIndex + 1);
      if (e.key === 'ArrowLeft') showItem(activeIndex - 1);
    });
  }

  /* ---------- Video popup modal (YouTube / Vimeo) ---------- */
  const videoTriggers = document.querySelectorAll('.video-thumb-trigger');
  const videoModal = document.querySelector('.video-modal-overlay');

  if (videoTriggers.length && videoModal) {
    const videoFrame = videoModal.querySelector('.video-modal-frame');
    const videoClose = videoModal.querySelector('.video-modal-close');
    let lastFocusedVideo = null;

    function openVideo(embedUrl) {
      lastFocusedVideo = document.activeElement;
      const separator = embedUrl.includes('?') ? '&' : '?';
      videoFrame.innerHTML =
        '<iframe src="' + embedUrl + separator + 'autoplay=1" ' +
        'title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      videoModal.classList.add('is-open');
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      videoClose.focus();
    }

    function closeVideo() {
      videoFrame.innerHTML = ''; // removing the iframe stops playback
      videoModal.classList.remove('is-open');
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocusedVideo) lastFocusedVideo.focus();
    }

    videoTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => openVideo(trigger.dataset.videoEmbed));
    });

    videoClose.addEventListener('click', closeVideo);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideo();
    });
    document.addEventListener('keydown', (e) => {
      if (!videoModal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeVideo();
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close the mobile nav after choosing a link
    siteNav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});
