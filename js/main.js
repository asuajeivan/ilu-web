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
      burger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---------- Examples tabs ---------- */
  var exTabs = document.querySelectorAll('.ex-tab');
  var exPanes = document.querySelectorAll('.ex-pane');

  exTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabId = tab.dataset.tab;
      exTabs.forEach(function (t) { t.classList.remove('active'); });
      exPanes.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelector('.ex-pane[data-pane="' + tabId + '"]').classList.add('active');
    });
  });
})();
