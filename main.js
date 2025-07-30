// ==UserScript==
// @name         Typing Bot
// @namespace    https://github.com/etoshy
// @version      1.1
// @description  An ultra-fast, autocorrective bot for typing websites like Monkeytype. Designed for maximum speed and reliability.
// @author       etoshy
// @homepageURL  https://github.com/etoshy
// @supportURL   https://github.com/etoshy/typing-bot
// @match        *://monkeytype.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=monkeytype.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- Início do código do Bot ---

    let isRunning = false;
    let typingSpeed = 5; // Atraso OTIMIZADO entre palavras (em ms). 5-15ms é ideal.
    let typingTimeout = null;

    // Configurações de velocidade (atraso entre palavras para sincronização)
    const SPEED_CONFIGS = {
        ultra: 5,      // 5ms - Velocidade máxima e geralmente estável
        fast: 15,      // 15ms - Muito rápido e super confiável
        normal: 30,    // 30ms - Rápido e sem chance de erro
        safe: 50       // 50ms - Para sites mais lentos
    };

    // --- Funções de Simulação de Teclado ---

    function typeChar(inputElement, char) {
        try { if (document.execCommand('insertText', false, char)) return; } catch (e) {}
        const start = inputElement.selectionStart, end = inputElement.selectionEnd;
        inputElement.value = inputElement.value.substring(0, start) + char + inputElement.value.substring(end);
        inputElement.selectionStart = inputElement.selectionEnd = start + 1;
        inputElement.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }

    function sendBackspace(inputElement) {
        try { if (document.execCommand('delete', false, null)) return; } catch (e) {}
        const start = inputElement.selectionStart;
        if (start > 0) {
            inputElement.value = inputElement.value.substring(0, start - 1) + inputElement.value.substring(inputElement.selectionEnd);
            inputElement.selectionStart = inputElement.selectionEnd = start - 1;
            inputElement.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
    }

    // --- Funções Principais do Bot ---

    function getActiveWord() {
        const activeWordElement = document.querySelector('.word.active');
        if (!activeWordElement) return null;
        const letters = activeWordElement.querySelectorAll('letter');
        let word = '';
        letters.forEach(letter => { word += letter.textContent; });
        return word;
    }

    function ensureFocus() {
        const wordsInput = document.getElementById('wordsInput');
        if (document.activeElement !== wordsInput) {
            const focusWarning = document.querySelector('.outOfFocusWarning:not(.hidden)');
            if (focusWarning) focusWarning.click();
            if (wordsInput) wordsInput.focus();
        }
    }

    function performTypingLoop() {
        if (!isRunning) return;

        const wordsInput = document.getElementById('wordsInput');
        if (!wordsInput) {
            console.error('❌ Bot: Input não encontrado. Parando.');
            stopTyping();
            return;
        }

        ensureFocus();
        const targetWord = getActiveWord();

        if (targetWord) {
            const currentText = wordsInput.value;
            const lastWordTyped = currentText.split(' ').pop() || '';

            if (targetWord.startsWith(lastWordTyped)) {
                const remainingChars = targetWord.substring(lastWordTyped.length);
                for (const char of remainingChars) typeChar(wordsInput, char);
            } else {
                console.warn(`⚠️ Bot: Erro detectado! Corrigindo "${lastWordTyped}" para "${targetWord}"`);
                for (let i = 0; i < lastWordTyped.length; i++) sendBackspace(wordsInput);
                for (const char of targetWord) typeChar(wordsInput, char);
            }

            typeChar(wordsInput, ' ');
            typingTimeout = setTimeout(performTypingLoop, typingSpeed);
        } else {
            typingTimeout = setTimeout(performTypingLoop, 100);
        }
    }

    // --- Funções de Controle da API ---

    function startTyping() {
        if (isRunning) { console.log('⚠️ Bot: Já está rodando!'); return; }
        console.log('🚀 Bot: INICIANDO BOT AUTOCORRETIVO...');
        console.log(`⚡ Bot: Velocidade (pausa entre palavras): ${typingSpeed}ms`);
        isRunning = true;

        const wordsInput = document.getElementById('wordsInput');
        if (wordsInput) wordsInput.value = '';

        ensureFocus();
        setTimeout(() => {
            console.log('💨 Bot: Digitação iniciada!');
            performTypingLoop();
        }, 200);
    }

    function stopTyping() {
        console.log('⏹️ Bot: Parando...');
        isRunning = false;
        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = null;
    }

    function setSpeedPreset(preset) {
        if (SPEED_CONFIGS.hasOwnProperty(preset)) {
            typingSpeed = SPEED_CONFIGS[preset];
            console.log(`⚡ Bot: Velocidade definida para "${preset}": ${typingSpeed}ms de pausa.`);
        } else {
            console.log('❌ Bot: Presets disponíveis:', Object.keys(SPEED_CONFIGS).join(', '));
        }
    }

    // --- API Pública ---
    window.typingBot = {
        start: startTyping,
        stop: stopTyping,
        ultra: () => setSpeedPreset('ultra'),
        fast: () => setSpeedPreset('fast'),
        normal: () => setSpeedPreset('normal'),
        safe: () => setSpeedPreset('safe'),
        setSpeed: (speed) => {
            typingSpeed = Math.max(1, parseInt(speed));
            console.log(`⚡ Bot: Velocidade customizada definida: ${typingSpeed}ms`);
        },
        status: () => ({
            running: isRunning,
            speed_ms_per_word: typingSpeed,
            next_word: getActiveWord() || 'N/A'
        })
    };

    // Inicia e exibe os controles no console
    function initialize() {
        console.clear();
        console.log('==============================================');
        console.log(`🤖 === BOT by ${'etoshy'} CARREGADO ===`);
        console.log('----------------------------------------------');
        console.log('🚀 Controles de Velocidade (pausa entre palavras):');
        console.log('   typingBot.ultra()   - 5ms (Recomendado)');
        console.log('   typingBot.fast()    - 15ms');
        console.log('');
        console.log('📝 Controles Principais:');
        console.log('   typingBot.start()   - Iniciar');
        console.log('   typingBot.stop()    - Parar');
        console.log('   typingBot.status()  - Ver status');
        console.log('==============================================');

        setSpeedPreset('ultra');

        // Auto-iniciar após 1.5 segundos
        setTimeout(() => {
            console.log('🔥 Bot: INICIANDO AUTOMATICAMENTE NO MODO MAIS RÁPIDO E ESTÁVEL!');
            startTyping();
        }, 1500);
    }

    // Aguarda o site carregar completamente antes de iniciar o bot
    window.addEventListener('load', function() {
        // Um pequeno atraso extra para garantir que frameworks como React/Vue tenham renderizado tudo
        setTimeout(initialize, 500);
    });

})();
