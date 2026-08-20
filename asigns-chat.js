/*
  Asigns & Printing AI chat widget ("Asigns Bot").
  Self-contained: injects its own CSS + DOM, needs no other markup on the page.

  TODO before going live: point API_URL at the deployed Worker
  (`cd backend/worker && npx wrangler deploy` prints the workers.dev URL,
  or wire a custom route like api.asignsinc.com).
*/
(function () {
  'use strict';

  const API_URL = 'https://asigns-worker.jacksonneal09888.workers.dev/api/chat';
  const PHONE_TEL = '+13362150518';
  const PHONE_DISPLAY = '336-215-0518';

  const STARTERS = [
    'DTF gang sheet pricing',
    'How fast can you turn around apparel?',
    'I need a vehicle wrap quote',
    'What are your hours?',
  ];

  const STORAGE_KEY = 'asignsChatHistory';

  const css = `
    .ace-widget * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
    .ace-launcher {
      position: fixed; bottom: 22px; right: 22px; z-index: 9999;
      width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #ffa728 0%, #ff7a00 100%);
      box-shadow: 0 10px 30px rgba(255, 122, 0, 0.45);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease;
    }
    .ace-launcher:hover { transform: scale(1.06); }
    .ace-launcher svg { width: 28px; height: 28px; fill: #0a0a0a; }
    .ace-nudge {
      position: fixed; bottom: 92px; right: 22px; z-index: 9998;
      background: #12141a; color: #f7f7f9; padding: 12px 16px; border-radius: 14px 14px 4px 14px;
      max-width: 220px; font-size: 13px; box-shadow: 0 12px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,167,40,0.35);
      opacity: 0; transform: translateY(8px); transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }
    .ace-nudge.is-visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
    .ace-nudge button { position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%;
      background: #ffa728; border: none; color: #0a0a0a; font-size: 12px; cursor: pointer; line-height: 1; }
    .ace-panel {
      position: fixed; bottom: 96px; right: 22px; z-index: 9999;
      width: 360px; max-width: calc(100vw - 32px); height: 520px; max-height: calc(100vh - 140px);
      background: #0f1115; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
      box-shadow: 0 30px 70px rgba(0,0,0,0.65);
      display: none; flex-direction: column; overflow: hidden;
    }
    .ace-panel.is-open { display: flex; }
    .ace-header {
      background: linear-gradient(135deg, #ffa728 0%, #ff7a00 100%);
      color: #0a0a0a; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between;
    }
    .ace-header-title { font-weight: 700; font-size: 15px; }
    .ace-header-sub { font-size: 11px; opacity: 0.75; }
    .ace-close { background: none; border: none; cursor: pointer; font-size: 18px; color: #0a0a0a; }
    .ace-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .ace-greeting { background: #171922; border-radius: 14px; padding: 14px; font-size: 13.5px; color: #d0d4de; }
    .ace-cta-row { display: flex; flex-direction: column; gap: 8px; }
    .ace-cta {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 11px 14px; border-radius: 12px; font-size: 13.5px; font-weight: 600;
      text-decoration: none; cursor: pointer; border: none;
    }
    .ace-cta-call { background: #e8394a; color: #fff; }
    .ace-cta-text { background: #1c1e26; color: #fff; border: 1px solid rgba(255,255,255,0.12); }
    .ace-starters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .ace-chip {
      background: #171922; border: 1px solid rgba(255,167,40,0.35); color: #ffc266;
      font-size: 12px; padding: 7px 11px; border-radius: 999px; cursor: pointer;
    }
    .ace-chip:hover { background: rgba(255,167,40,0.12); }
    .ace-msg { max-width: 85%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; white-space: pre-wrap; }
    .ace-msg-user { align-self: flex-end; background: linear-gradient(135deg, #ffa728 0%, #ff7a00 100%); color: #0a0a0a; border-radius: 14px 14px 4px 14px; }
    .ace-msg-bot { align-self: flex-start; background: #171922; color: #e6e8ee; border-radius: 14px 14px 14px 4px; }
    .ace-typing { align-self: flex-start; display: flex; gap: 4px; padding: 10px 13px; }
    .ace-typing span { width: 6px; height: 6px; border-radius: 50%; background: #a3a9b8; animation: ace-bounce 1.2s infinite ease-in-out; }
    .ace-typing span:nth-child(2) { animation-delay: 0.15s; }
    .ace-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes ace-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }
    .ace-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .ace-action-btn { background: rgba(43,164,255,0.15); border: 1px solid rgba(43,164,255,0.4); color: #6bc1ff;
      font-size: 11.5px; padding: 6px 10px; border-radius: 999px; cursor: pointer; }
    .ace-footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 10px; display: flex; gap: 8px; }
    .ace-input {
      flex: 1; background: #171922; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
      padding: 10px 12px; color: #f7f7f9; font-size: 13px; outline: none;
    }
    .ace-send { background: #ffa728; border: none; border-radius: 12px; width: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .ace-send svg { width: 16px; height: 16px; fill: #0a0a0a; }
    @media (max-width: 480px) {
      .ace-panel { right: 16px; left: 16px; width: auto; bottom: 88px; }
      .ace-launcher, .ace-nudge { right: 16px; }
    }
  `;

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (key === 'class') node.className = value;
      else if (key === 'html') node.innerHTML = value;
      else node.setAttribute(key, value);
    });
    (children || []).forEach((child) => node.appendChild(child));
    return node;
  }

  function loadHistory() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(history) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  function parseActions(text) {
    const actionPattern = /\[ACTION:(scroll|open):([^\]]+)\]/g;
    const actions = [];
    const clean = text.replace(actionPattern, (match, type, target) => {
      actions.push({ type, target });
      return '';
    }).trim();
    return { clean, actions };
  }

  function actionLabel(action) {
    if (action.type === 'scroll') return 'View ' + action.target.replace('#', '').replace(/-/g, ' ');
    return 'Open ' + action.target.replace('.html', '').replace(/-/g, ' ');
  }

  function runAction(action) {
    if (action.type === 'scroll') {
      const targetOnThisPage = document.querySelector(action.target);
      if (targetOnThisPage) {
        targetOnThisPage.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      window.location.href = '/' + action.target;
    } else if (action.type === 'open') {
      window.location.href = action.target;
    }
  }

  function init() {
    injectStyles();

    const launcher = el('button', { class: 'ace-launcher', 'aria-label': 'Chat with Asigns Bot' }, [
      el('span', { html: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.4 1.05 4.58 2.77 6.19L4 22l5.09-1.75C10.03 20.4 11 20.5 12 20.5c5.52 0 10-4.03 10-9S17.52 2 12 2z"/></svg>' }),
    ]);

    const nudge = el('div', { class: 'ace-nudge' }, [
      el('button', { 'aria-label': 'Dismiss' }, [document.createTextNode('×')]),
      document.createTextNode("Questions about pricing or turnaround? I'm Asigns Bot — happy to help!"),
    ]);

    const closeBtn = el('button', { class: 'ace-close', 'aria-label': 'Close chat' }, [document.createTextNode('×')]);

    const header = el('div', { class: 'ace-header' }, [
      el('div', {}, [
        el('div', { class: 'ace-header-title' }, [document.createTextNode('Asigns Bot — Asigns & Printing')]),
        el('div', { class: 'ace-header-sub' }, [document.createTextNode('Usually replies in seconds')]),
      ]),
      closeBtn,
    ]);

    const body = el('div', { class: 'ace-body' }, []);
    const input = el('input', { class: 'ace-input', type: 'text', placeholder: 'Ask about signs, apparel, pricing…' });
    const sendBtn = el('button', { class: 'ace-send', 'aria-label': 'Send' }, [
      el('span', { html: '<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>' }),
    ]);
    const footer = el('div', { class: 'ace-footer' }, [input, sendBtn]);

    const panel = el('div', { class: 'ace-panel' }, [header, body, footer]);

    document.body.appendChild(launcher);
    document.body.appendChild(nudge);
    document.body.appendChild(panel);

    let panelInitialized = false;
    let messages = loadHistory();

    function showHome() {
      body.innerHTML = '';
      body.appendChild(el('div', { class: 'ace-greeting' }, [
        document.createTextNode("Hi, I'm Asigns Bot! Need a quote, a rush order, or just have a question? I can point you the right way."),
      ]));
      body.appendChild(el('div', { class: 'ace-cta-row' }, [
        el('a', { class: 'ace-cta ace-cta-call', href: 'tel:' + PHONE_TEL }, [document.createTextNode('📞 Call ' + PHONE_DISPLAY)]),
        el('a', { class: 'ace-cta ace-cta-text', href: 'sms:' + PHONE_TEL }, [document.createTextNode('💬 Text Us')]),
      ]));

      const starterWrap = el('div', { class: 'ace-starters' }, []);
      STARTERS.forEach((starter) => {
        const chip = el('button', { class: 'ace-chip' }, [document.createTextNode(starter)]);
        chip.addEventListener('click', () => sendMessage(starter));
        starterWrap.appendChild(chip);
      });
      body.appendChild(starterWrap);

      if (messages.length) {
        messages.forEach(renderMessage);
      }
    }

    function renderMessage(msg) {
      const bubble = el('div', { class: msg.role === 'user' ? 'ace-msg ace-msg-user' : 'ace-msg ace-msg-bot' }, []);
      if (msg.role === 'assistant') {
        const { clean, actions } = parseActions(msg.content);
        bubble.textContent = clean;
        body.appendChild(bubble);
        if (actions.length) {
          const actionWrap = el('div', { class: 'ace-actions' }, []);
          actions.forEach((action) => {
            const btn = el('button', { class: 'ace-action-btn' }, [document.createTextNode(actionLabel(action))]);
            btn.addEventListener('click', () => runAction(action));
            actionWrap.appendChild(btn);
          });
          body.appendChild(actionWrap);
        }
      } else {
        bubble.textContent = msg.content;
        body.appendChild(bubble);
      }
      body.scrollTop = body.scrollHeight;
    }

    function showTyping() {
      const typing = el('div', { class: 'ace-typing', id: 'aceTyping' }, [
        el('span', {}, []), el('span', {}, []), el('span', {}, []),
      ]);
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;
    }

    function hideTyping() {
      const typing = document.getElementById('aceTyping');
      if (typing) typing.remove();
    }

    async function sendMessage(text) {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (!messages.length) {
        body.innerHTML = '';
      }

      messages.push({ role: 'user', content: trimmed });
      renderMessage({ role: 'user', content: trimmed });
      saveHistory(messages);
      input.value = '';
      showTyping();

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        });
        const data = await res.json();
        hideTyping();
        const reply = data.content || "Sorry, I'm having trouble connecting right now — please call or text us at " + PHONE_DISPLAY + '.';
        messages.push({ role: 'assistant', content: reply });
        renderMessage({ role: 'assistant', content: reply });
        saveHistory(messages);
      } catch (err) {
        hideTyping();
        const fallback = "Sorry, I'm having trouble connecting right now — please call or text us at " + PHONE_DISPLAY + '.';
        messages.push({ role: 'assistant', content: fallback });
        renderMessage({ role: 'assistant', content: fallback });
        saveHistory(messages);
      }
    }

    function openPanel() {
      panel.classList.add('is-open');
      nudge.classList.remove('is-visible');
      if (!panelInitialized) {
        showHome();
        panelInitialized = true;
      }
      input.focus();
    }

    function closePanel() {
      panel.classList.remove('is-open');
    }

    launcher.addEventListener('click', () => {
      if (panel.classList.contains('is-open')) closePanel();
      else openPanel();
    });
    closeBtn.addEventListener('click', closePanel);
    nudge.addEventListener('click', openPanel);
    nudge.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      nudge.classList.remove('is-visible');
    });

    sendBtn.addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage(input.value);
    });

    setTimeout(() => {
      if (!panel.classList.contains('is-open')) nudge.classList.add('is-visible');
    }, 4000);
    setTimeout(() => nudge.classList.remove('is-visible'), 12000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
