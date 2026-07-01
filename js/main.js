/* =============================================
   ILU Landing — Main JavaScript
   ============================================= */

(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById('navBurger');
  var navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var isOpen = burger.classList.toggle('active');
      navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('active');
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Examples tabs (ARIA tablist) ---------- */
  var exTabs = document.querySelectorAll('.ex-tab');
  var exPanes = document.querySelectorAll('.ex-pane');

  exTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabId = tab.dataset.tab;

      exTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      exPanes.forEach(function (p) {
        p.classList.remove('active');
        p.setAttribute('hidden', '');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.removeAttribute('tabindex');

      var pane = document.getElementById('pane-' + tabId);
      if (pane) {
        pane.classList.add('active');
        pane.removeAttribute('hidden');
      }
    });

    /* Arrow key navigation between tabs */
    tab.addEventListener('keydown', function (e) {
      var tabsArray = Array.from(exTabs);
      var index = tabsArray.indexOf(tab);
      var next;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        next = tabsArray[(index + 1) % tabsArray.length];
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        next = tabsArray[(index - 1 + tabsArray.length) % tabsArray.length];
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = tabsArray[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        next = tabsArray[tabsArray.length - 1];
      }

      if (next) {
        next.focus();
        next.click();
      }
    });
  });

  /* Set initial tabindex on non-active tabs */
  exTabs.forEach(function (tab) {
    if (!tab.classList.contains('active')) {
      tab.setAttribute('tabindex', '-1');
    }
  });
})();
