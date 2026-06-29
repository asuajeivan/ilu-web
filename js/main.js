/* =============================================
   ILU Landing — Main JavaScript
   ============================================= */

(function () {
  'use strict';

  /* ---------- DOM refs ---------- */
  var chatBody = document.getElementById('chatBody');
  var chatForm = document.getElementById('chatForm');
  var chatInput = document.getElementById('chatInput');
  var sendBtn = document.getElementById('sendBtn');
  var quickReplies = document.getElementById('quickReplies');

  /* ---------- Helpers ---------- */
  function timeNow() {
    var d = new Date();
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  function addMsg(text, who, opts) {
    who = who || 'bot';
    opts = opts || {};
    var el = document.createElement('div');
    el.className = 'msg from-' + who + (opts.report ? ' report' : '');
    if (opts.html) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
    if (!opts.report) {
      var t = document.createElement('span');
      t.className = 'time';
      t.textContent = timeNow();
      el.appendChild(t);
    }
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
  }

  function addTyping() {
    var el = document.createElement('div');
    el.className = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
  }

  /* ---------- Boot chat demo ---------- */
  function bootChat() {
    addMsg(
      '<div class="report-title">Buenos d\u00edas \u00b7 Reporte 8 mayo</div>' +
      '<div class="report-row"><span>Ventas hoy</span><b>$54,820 <span class="up">\u219112%</span></b></div>' +
      '<div class="report-row"><span>Tickets</span><b>284</b></div>' +
      '<div class="report-row"><span>Mejor sucursal</span><b>Polanco</b></div>' +
      '<div class="report-row"><span>Stock cr\u00edtico</span><b>3 SKUs <span class="down">!</span></b></div>',
      'bot', { report: true, html: true }
    );
    setTimeout(function () {
      addMsg('\u00bfQuieres que detalle alguna m\u00e9trica o lo dejamos as\u00ed? \ud83d\udc4b');
    }, 500);
  }

  /* ---------- Fallback answers ---------- */
  var FALLBACK = {
    ventas: 'Hoy llevamos $54,820 MXN, 284 tickets. Vamos 12% arriba vs ayer a esta hora.',
    stock: 'Tienes 3 SKUs por debajo del m\u00ednimo: Vibrance Shampoo 500ml (4 uds), Caf\u00e9 Etiop\u00eda 250g (8 uds), Chocolate Amargo 70% (6 uds).',
    producto: 'Esta semana el top es Caf\u00e9 Etiop\u00eda 250g \u2014 187 unidades. Le sigue el shampoo Vibrance con 92.',
    mejor: 'Tu mejor d\u00eda este mes fue el s\u00e1bado 4 de mayo: $68,200 en 392 tickets. \u00bfQuieres saber qu\u00e9 se vendi\u00f3 ese d\u00eda?',
    default: 'Buena pregunta \u2014 en producci\u00f3n me conecto a tu Odoo y te respondo con los n\u00fameros reales. \u00bfQuieres ver una demo en vivo con tu instancia?'
  };

  function fallbackAnswer(q) {
    var t = q.toLowerCase();
    if (t.indexOf('venta') !== -1) return FALLBACK.ventas;
    if (t.indexOf('stock') !== -1) return FALLBACK.stock;
    if (t.indexOf('producto') !== -1 || t.indexOf('vendi') !== -1) return FALLBACK.producto;
    if (t.indexOf('mejor') !== -1 || t.indexOf('d\u00eda') !== -1) return FALLBACK.mejor;
    return FALLBACK.default;
  }

  /* ---------- LLM / fallback ---------- */
  function askILU(question) {
    if (window.claude && typeof window.claude.complete === 'function') {
      var sys =
        'Eres ILU, un agente de WhatsApp conectado al Odoo de "Caf\u00e9 Reforma" (cadena de 3 cafeter\u00edas premium en CDMX).\n' +
        'Datos ficticios consistentes:\n' +
        '- Sucursales: Polanco, Centro, Roma Norte\n' +
        '- Ventas hoy: $54,820 MXN, 284 tickets, \u219112% vs ayer\n' +
        '- Producto top semana: Caf\u00e9 Etiop\u00eda 250g (187 uds)\n' +
        '- Stock bajo: Vibrance Shampoo 500ml (4), Caf\u00e9 Etiop\u00eda 250g (8), Chocolate Amargo 70% (6)\n' +
        '- Mejor d\u00eda del mes: s\u00e1bado 4 may ($68,200)\n' +
        '- Margen Q2: 38.4%, Q1: 35.1%\n' +
        'Responde en espa\u00f1ol, breve (m\u00e1ximo 2-3 oraciones), conversacional, con n\u00fameros si aplica. Usa $X MXN para montos. Si no tienes el dato, di "d\u00e9jame consultarlo en Odoo" sin inventar. No uses markdown ni listas largas.';
      try {
        return window.claude.complete({
          messages: [
            { role: 'user', content: sys + '\n\nPregunta del usuario: ' + question }
          ]
        }).then(function (text) {
          return (text || '').trim() || fallbackAnswer(question);
        }).catch(function () {
          return fallbackAnswer(question);
        });
      } catch (e) {
        return Promise.resolve(fallbackAnswer(question));
      }
    }
    return Promise.resolve(fallbackAnswer(question));
  }

  /* ---------- Send handler ---------- */
  function handleSend(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    chatInput.value = '';
    sendBtn.disabled = true;
    var typingEl = addTyping();
    askILU(text).then(function (answer) {
      typingEl.remove();
      addMsg(answer, 'bot');
      sendBtn.disabled = false;
      chatInput.focus();
    });
  }

  /* ---------- Events ---------- */
  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    handleSend(chatInput.value);
  });

  quickReplies.addEventListener('click', function (e) {
    var btn = e.target.closest('.quick-reply');
    if (!btn) return;
    handleSend(btn.dataset.q);
  });

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

  /* ---------- Init ---------- */
  bootChat();
})();
