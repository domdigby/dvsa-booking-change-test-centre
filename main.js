// ==UserScript==
// @name         DVSA Monitor - WORKING
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Rate-limited monitor with persistent state
// @match        *://driverpracticaltest.dvsa.gov.uk/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        license: "ENTER YOUR DRIVER LICENCE ID HERE",
        bookingRef: "ENTER YOUR BOOKING REF HERE",
        postcode: "ENTER YOUR POST CODE HERE",
        waitMinutes: 3,
        targetCentres: ["ENTER TEST CENTRE NAME HERE", "ENTER ANOTHER TEST CENTRE NAME HERE"]
    };

    const WAIT_MS = CONFIG.waitMinutes * 60 * 1000;
    const STORAGE_KEY = 'dvsa_last_search';
    const PAUSE_KEY = 'dvsa_paused';

    // Load from localStorage (survives page reloads!)
    let lastSearch = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
    let paused = localStorage.getItem(PAUSE_KEY) === 'true';
    let searchCount = 0;

    function log(msg) {
        console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, lastSearch.toString());
        localStorage.setItem(PAUSE_KEY, paused.toString());
    }

    function updateUI() {
        let ui = document.getElementById('monitor-ui');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'monitor-ui';
            ui.style.cssText = 'position:fixed;bottom:20px;right:20px;background:black;color:lime;padding:20px;border:3px solid lime;font:14px monospace;z-index:999999;min-width:320px;';
            document.body.appendChild(ui);
        }

        const now = Date.now();
        const elapsed = lastSearch > 0 ? Math.floor((now - lastSearch) / 1000) : 0;
        const remaining = Math.max(0, (CONFIG.waitMinutes * 60) - elapsed);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;

        ui.innerHTML = `
            <div style="font-size:18px;font-weight:bold;margin-bottom:10px;color:${paused?'orange':'lime'}">
                ${paused ? '⏸️ PAUSED' : '▶️ MONITORING'}
            </div>
            <div>Last search: ${lastSearch === 0 ? 'Never' : elapsed + 's ago'}</div>
            <div style="color:${remaining>0?'red':'lime'};font-weight:bold;font-size:18px;margin:10px 0;">
                ${remaining > 0 ? `⏳ ${mins}m ${secs}s` : '✓ CAN SEARCH'}
            </div>
            <div style="font-size:11px;margin:5px 0;color:#888;">
                Monitoring: ${CONFIG.targetCentres.join(', ')}
            </div>
            <button onclick="window.toggleMonitor()" style="width:100%;padding:12px;background:orange;border:none;font-weight:bold;cursor:pointer;font-size:14px;">
                ${paused ? '▶️ RESUME' : '⏸️ PAUSE'}
            </button>
        `;
    }

    window.toggleMonitor = function() {
        paused = !paused;
        saveState();
        log(paused ? 'PAUSED' : 'RESUMED');
        updateUI();
    };

    function canSearchNow() {
        if (lastSearch === 0) return true;

        const now = Date.now();
        const elapsed = now - lastSearch;
        return elapsed >= WAIT_MS;
    }

    async function run() {
        if (paused) {
            updateUI();
            return;
        }

        updateUI();

        try {
            // LOGIN PAGE
            const lic = document.querySelector('#driving-licence-number');
            const ref = document.querySelector('#application-reference-number');
            const loginBtn = document.querySelector('#booking-login');

            if (lic && ref && loginBtn && !lic.value) {
                log('Logging in...');
                lic.value = CONFIG.license;
                ref.value = CONFIG.bookingRef;
                await new Promise(r => setTimeout(r, 500));
                loginBtn.click();
                return;
            }

            // VIEW BOOKING PAGE
            const changeBtn = document.querySelector('#test-centre-change');
            if (changeBtn) {
                log('Clicking Change...');
                await new Promise(r => setTimeout(r, 500));
                changeBtn.click();
                return;
            }

            // SEARCH PAGE
            const searchBox = document.querySelector('#test-centres-input');
            const searchBtn = document.querySelector('#test-centres-submit');
            const resultsSection = document.querySelector('#search-results');

            if (searchBox && searchBtn) {
                // RESULTS ARE SHOWING - Check them
                if (resultsSection) {
                    log('Checking results...');

                    const centres = resultsSection.querySelectorAll('li');
                    let foundSlots = false;

                    centres.forEach(li => {
                        const h4 = li.querySelector('h4');
                        const h5 = li.querySelector('h5');
                        const link = li.querySelector('a');

                        if (h4 && h5 && link) {
                            const name = h4.textContent.trim();
                            const status = h5.textContent.trim();

                            // Only check target centres
                            if (CONFIG.targetCentres.includes(name)) {
                                if (!status.includes('No tests found')) {
                                    log(`🎉🎉🎉 SLOTS FOUND AT ${name}!`);

                                    // Big alert
                                    alert(`🎉 AVAILABLE SLOTS!\n\n${name}\n${status}\n\nClick OK to view!`);

                                    // Highlight
                                    li.style.border = '10px solid red';
                                    li.style.backgroundColor = 'yellow';

                                    // Sound
                                    try {
                                        const audio = new AudioContext();
                                        for (let i = 0; i < 5; i++) {
                                            setTimeout(() => {
                                                const osc = audio.createOscillator();
                                                const gain = audio.createGain();
                                                osc.connect(gain);
                                                gain.connect(audio.destination);
                                                osc.frequency.value = 880;
                                                gain.gain.setValueAtTime(0.5, audio.currentTime);
                                                gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3);
                                                osc.start();
                                                osc.stop(audio.currentTime + 0.3);
                                            }, i * 500);
                                        }
                                    } catch(e) {}

                                    // Flash title
                                    let flash = true;
                                    setInterval(() => {
                                        document.title = flash ? '🎉 SLOTS AVAILABLE!' : 'Test centre';
                                        flash = !flash;
                                    }, 1000);

                                    paused = true;
                                    saveState();
                                    foundSlots = true;
                                }
                            }
                        }
                    });

                    if (foundSlots) return;

                    // No slots - check if can search again
                    if (!canSearchNow()) {
                        const now = Date.now();
                        const remaining = Math.ceil((WAIT_MS - (now - lastSearch)) / 1000);
                        log(`No slots. Waiting ${remaining}s before next search`);
                        return;
                    }

                    // OK to search again
                    log('No slots found. Searching again...');
                    lastSearch = Date.now();
                    saveState();
                    searchBtn.click();
                    log('Search button clicked');
                    return;
                }

                // NO RESULTS YET - Do first search
                if (!canSearchNow()) {
                    const now = Date.now();
                    const remaining = Math.ceil((WAIT_MS - (now - lastSearch)) / 1000);
                    log(`Waiting ${remaining}s...`);
                    return;
                }

                log('Performing search...');
                searchBox.value = CONFIG.postcode;
                await new Promise(r => setTimeout(r, 500));

                lastSearch = Date.now();
                saveState();
                searchBtn.click();
                log('Search initiated');
            }

        } catch (e) {
            log('Error: ' + e.message);
        }
    }

    // Initialize
    log('Monitor initialized');
    log(`Last search: ${lastSearch === 0 ? 'Never' : new Date(lastSearch).toLocaleTimeString()}`);
    log(`Targets: ${CONFIG.targetCentres.join(', ')}`);
    log(`Wait: ${CONFIG.waitMinutes} minutes`);

    setInterval(run, 3000);
    setTimeout(run, 1000);

})();
