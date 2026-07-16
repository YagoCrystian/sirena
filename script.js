/* =========================================================
   Sirena 21 Inc. — Site Script
   Vanilla JS only. No dependencies.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Sticky header shrink/blur on scroll ---------- */
  var header = document.getElementById('site-header');
  function onScrollHeader() {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    var isOpen = mobileMenu.classList.toggle('open');
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  }
  menuBtn.addEventListener('click', toggleMenu);
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Scroll-triggered animations ---------- */
  var animatedEls = document.querySelectorAll('[data-animate]');
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            el.classList.add('in-view');
          }, delay);
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.15 }
  );
  animatedEls.forEach(function (el) { io.observe(el); });

  /* ---------- Animated counters ---------- */
  var statNumbers = document.querySelectorAll('.stat-number');
  var counterIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1600;
        var start = null;

        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          var value = Math.round(eased * target);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  statNumbers.forEach(function (el) { counterIO.observe(el); });

  /* ---------- Testimonial carousel ---------- */
  var track = document.getElementById('testimonial-track');
  var slides = track ? track.children : [];
  var dotsWrap = document.getElementById('carousel-dots');
  var prevBtn = document.getElementById('carousel-prev');
  var nextBtn = document.getElementById('carousel-next');
  var current = 0;
  var autoplayTimer;

  if (track && slides.length) {
    for (var i = 0; i < slides.length; i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      (function (idx) {
        dot.addEventListener('click', function () { goTo(idx); resetAutoplay(); });
      })(i);
      dotsWrap.appendChild(dot);
    }

    function update() {
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      dotsWrap.querySelectorAll('.carousel-dot').forEach(function (d, idx) {
        d.classList.toggle('active', idx === current);
      });
    }
    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      update();
    }
    function next() { goTo(current + 1); }
    function prevSlide() { goTo(current - 1); }
    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(next, 6000);
    }

    nextBtn.addEventListener('click', function () { next(); resetAutoplay(); });
    prevBtn.addEventListener('click', function () { prevSlide(); resetAutoplay(); });
    resetAutoplay();
  }

  /* ---------- Service Areas: county tabs + interactive map + search ---------- */
  var countyTabs = document.querySelectorAll('.county-tab');
  var countyPanels = document.querySelectorAll('.county-panel');
  var mapCountyLabels = document.querySelectorAll('.map-county-label');
  var mapPins = document.querySelectorAll('.map-pin');
  var areaChips = document.querySelectorAll('.area-chip');
  var areaSearch = document.getElementById('area-search');
  var areaEmpty = document.getElementById('area-empty');
  var areaEmptyTerm = document.getElementById('area-empty-term');
  var mapWidget = document.getElementById('map-widget');
  var mapTooltip = document.getElementById('map-tooltip');

  // Fill in live chip counts
  ['orange', 'osceola'].forEach(function (county) {
    var panel = document.getElementById('panel-' + county);
    var countEl = document.getElementById('count-' + county);
    if (panel && countEl) countEl.textContent = panel.querySelectorAll('.area-chip').length;
  });

  function setActiveCounty(county) {
    countyTabs.forEach(function (tab) {
      var active = tab.getAttribute('data-county') === county;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    countyPanels.forEach(function (panel) {
      panel.classList.toggle('hidden', panel.getAttribute('data-county') !== county);
    });
    mapCountyLabels.forEach(function (label) {
      label.classList.toggle('is-dim', label.getAttribute('data-county') !== county);
    });
    mapPins.forEach(function (pin) {
      pin.classList.toggle('is-dim', pin.getAttribute('data-county') !== county);
    });
  }

  countyTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setActiveCounty(tab.getAttribute('data-county'));
    });
  });

  /* --- Tooltip helper --- */
  function positionTooltip(targetEl) {
    if (!mapWidget || !mapTooltip) return;
    var wrapRect = mapWidget.getBoundingClientRect();
    var elRect = targetEl.getBoundingClientRect();
    var x = elRect.left + elRect.width / 2 - wrapRect.left;
    var y = elRect.top - wrapRect.top;
    mapTooltip.style.left = x + 'px';
    mapTooltip.style.top = y + 'px';
  }
  function showTooltip(targetEl, text) {
    if (!mapTooltip) return;
    mapTooltip.textContent = text;
    positionTooltip(targetEl);
    mapTooltip.classList.add('show');
  }
  function hideTooltip() {
    if (mapTooltip) mapTooltip.classList.remove('show');
  }

  /* --- Cross-highlight: map pin <-> sidebar chip --- */
  function findPin(city) {
    var match = null;
    mapPins.forEach(function (pin) {
      if (pin.getAttribute('data-city') === city) match = pin;
    });
    return match;
  }
  function findChip(city) {
    var match = null;
    areaChips.forEach(function (chip) {
      if (chip.getAttribute('data-city') === city) match = chip;
    });
    return match;
  }

  mapPins.forEach(function (pin) {
    var city = pin.getAttribute('data-city');
    function activate() {
      showTooltip(pin, city);
      var chip = findChip(city);
      if (chip) chip.classList.add('chip-highlight');
    }
    function deactivate() {
      hideTooltip();
      var chip = findChip(city);
      if (chip) chip.classList.remove('chip-highlight');
    }
    pin.addEventListener('mouseenter', activate);
    pin.addEventListener('mouseleave', deactivate);
    pin.addEventListener('focus', activate);
    pin.addEventListener('blur', deactivate);
    pin.addEventListener('click', function () {
      setActiveCounty(pin.getAttribute('data-county'));
    });
  });

  areaChips.forEach(function (chip) {
    var city = chip.getAttribute('data-city');
    function activate() {
      chip.classList.add('chip-highlight');
      var pin = findPin(city);
      if (pin) {
        pin.classList.add('pin-highlight');
        showTooltip(pin, city);
      }
    }
    function deactivate() {
      chip.classList.remove('chip-highlight');
      var pin = findPin(city);
      if (pin) pin.classList.remove('pin-highlight');
      hideTooltip();
    }
    chip.addEventListener('mouseenter', activate);
    chip.addEventListener('mouseleave', deactivate);
    chip.addEventListener('focus', activate);
    chip.addEventListener('blur', deactivate);
  });

  if (areaSearch) {
    areaSearch.addEventListener('input', function () {
      var term = areaSearch.value.trim().toLowerCase();
      var totalVisible = 0;
      var firstMatchCounty = null;

      countyPanels.forEach(function (panel) {
        var county = panel.getAttribute('data-county');
        panel.querySelectorAll('.area-chip').forEach(function (chip) {
          var match = chip.textContent.toLowerCase().indexOf(term) !== -1;
          chip.classList.toggle('filtered-out', term.length > 0 && !match);
          if (term.length === 0 || match) {
            totalVisible++;
            if (match && term.length > 0 && !firstMatchCounty) firstMatchCounty = county;
          }
        });
      });

      if (term.length > 0 && firstMatchCounty) {
        setActiveCounty(firstMatchCounty);
      }

      if (areaEmpty) {
        areaEmpty.classList.toggle('hidden', !(term.length > 0 && totalVisible === 0));
        if (areaEmptyTerm) areaEmptyTerm.textContent = areaSearch.value.trim();
      }
    });
  }

  /* ---------- Services: clickable cards -> details modal ---------- */
  var serviceData = {
    residential: {
      title: 'Residential Cleaning',
      description: 'Professional, reliable, and detail-oriented cleaning for your home.',
      items: [
        'Kitchen Cleaning',
        'Bathroom Sanitizing',
        'Dusting All Surfaces',
        'Vacuum & Mop Floors',
        'Bedroom & Living Area Cleaning',
        'Trash Removal',
        'Light Tidying & Finishing Touches'
      ]
    },
    deep: {
      title: 'Deep Cleaning',
      description: 'A detailed top-to-bottom cleaning designed to refresh your entire home.',
      items: [
        'Baseboards & Doors',
        'Detailed Bathroom Scrubbing',
        'Kitchen Deep Sanitizing',
        'Cabinet Exterior Cleaning',
        'Light Fixtures & Ceiling Fans',
        'Dusting High & Low Areas',
        'Vacuum Under Furniture',
        'Detailed Floor Cleaning',
        'Spot Cleaning Walls',
        'Trash Removal'
      ]
    },
    movinout: {
      title: 'Move In / Move Out Cleaning',
      description: 'Perfect for preparing your home for a fresh start or final inspection.',
      items: [
        'Deep Cleaning Throughout the Home',
        'Inside Cabinets & Drawers',
        'Inside Fridge & Oven',
        'Bathrooms Fully Sanitized',
        'Baseboards, Doors & Trim Cleaned',
        'Floors Vacuumed & Mopped',
        'Dust Removal from All Surfaces',
        'Window & Mirror Cleaning',
        'Trash Removal'
      ]
    },
    postconstruction: {
      title: 'Post-Construction Cleaning',
      description: 'Detailed cleaning to leave your newly built or renovated space spotless and move-in ready.',
      items: [
        'Construction Dust Removal',
        'Detailed Surface Cleaning',
        'Baseboards, Doors & Trim Cleaned',
        'Window & Glass Cleaning',
        'Cabinets & Countertops Wiped',
        'Bathrooms Fully Sanitized',
        'Floors Vacuumed & Mopped',
        'Light Fixtures & Fans Dusted'
      ]
    }
  };

  var serviceModal = document.getElementById('service-modal');
  var serviceModalClose = document.getElementById('service-modal-close');
  var serviceModalTitle = document.getElementById('service-modal-title');
  var serviceModalDesc = document.getElementById('service-modal-desc');
  var serviceModalList = document.getElementById('service-modal-list');

  document.querySelectorAll('.service-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var data = serviceData[card.getAttribute('data-service')];
      if (!data) return;
      serviceModalTitle.textContent = data.title;
      serviceModalDesc.textContent = data.description;
      serviceModalList.innerHTML = '';
      data.items.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        serviceModalList.appendChild(li);
      });
      openModal(serviceModal);
    });
  });
  if (serviceModalClose) {
    serviceModalClose.addEventListener('click', function () { closeModal(serviceModal); });
  }
  if (serviceModal) {
    serviceModal.addEventListener('click', function (e) { if (e.target === serviceModal) closeModal(serviceModal); });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxTitle = document.getElementById('lightbox-title');
  var lightboxBefore = document.getElementById('lightbox-before');
  var lightboxAfter = document.getElementById('lightbox-after');

  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.addEventListener('click', function () {
      lightboxTitle.textContent = item.getAttribute('data-title');
      lightboxBefore.src = item.getAttribute('data-file-before');
      lightboxBefore.alt = item.getAttribute('data-title') + ' — before';
      lightboxAfter.src = item.getAttribute('data-file-after');
      lightboxAfter.alt = item.getAttribute('data-title') + ' — after';
      openModal(lightbox);
    });
  });
  lightboxClose.addEventListener('click', function () { closeModal(lightbox); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeModal(lightbox); });

  /* ---------- Video modal ---------- */
  var videoModal = document.getElementById('video-modal');
  var videoModalClose = document.getElementById('video-modal-close');
  var videoModalTitle = document.getElementById('video-modal-title');
  var videoModalPlayer = document.getElementById('video-modal-player');

  document.querySelectorAll('.video-card').forEach(function (card) {
    card.addEventListener('click', function () {
      videoModalTitle.textContent = card.getAttribute('data-title');
      videoModalPlayer.src = card.getAttribute('data-video');
      openModal(videoModal);
      videoModalPlayer.play();
    });
  });
  function stopVideoPlayer() {
    videoModalPlayer.pause();
    videoModalPlayer.removeAttribute('src');
    videoModalPlayer.load();
  }
  videoModalClose.addEventListener('click', function () { closeModal(videoModal); stopVideoPlayer(); });
  videoModal.addEventListener('click', function (e) { if (e.target === videoModal) { closeModal(videoModal); stopVideoPlayer(); } });

  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal(lightbox);
      closeModal(videoModal);
      closeModal(serviceModal);
      stopVideoPlayer();
    }
  });

  /* ---------- Button ripple effect ---------- */
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-cta').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var ripple = document.createElement('span');
      var size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);
    });
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();