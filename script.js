document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startBtn = document.getElementById('start-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const shareBtn = document.getElementById('share-btn');

    const gaugesContainer = document.getElementById('gauges-container');
    const resultsContainer = document.getElementById('results-container');
    const pingResultEl = document.getElementById('ping-result');
    const jitterResultEl = document.getElementById('jitter-result');
    const downloadResultEl = document.getElementById('download-result');
    const uploadResultEl = document.getElementById('upload-result');

    const liveSpeedEl = document.getElementById('live-speed');
    const gaugeTypeEl = document.getElementById('gauge-type');
    const statusTextEl = document.getElementById('status-text');
    const languageSelectorEl = document.getElementById('language-selector');

    const ipAddressEl = document.getElementById('ip-address');
    const ispEl = document.getElementById('isp');
    const cityEl = document.getElementById('city');
    const countryEl = document.getElementById('country');
    const toggleUserInfoBtn = document.getElementById('toggle-user-info');
    const userInfoDetails = document.getElementById('user-info-details');
    const retryUserInfoBtn = document.getElementById('retry-user-info');

    const historyListEl = document.getElementById('history-list');

    let testInProgress = false;
    let gauge;

    const settings = {
        ping: {
            url: 'upload.php',
            count: 10,
        },
        download: {
            url: 'download.php',
            size: 25 * 1024 * 1024, // 25 MB
        },
        upload: {
            url: 'upload.php',
            size: 10 * 1024 * 1024, // 10 MB
        }
    };

    const gaugeOptions = {
        angle: -0.2,
        lineWidth: 0.3,
        radiusScale: 1,
        pointer: { length: 0.6, strokeWidth: 0.035, color: '#000000' },
        limitMax: false,
        limitMin: false,
        strokeColor: '#E0E0E0',
        generateGradient: true,
        highDpiSupport: true,
        staticZones: [
           {strokeStyle: "#F03E3E", min: 0, max: 200},   // 0-20 Mbps
           {strokeStyle: "#E0E0E0", min: 200, max: 202}, // Gap
           {strokeStyle: "#FFDD00", min: 202, max: 500}, // 20-50 Mbps
           {strokeStyle: "#E0E0E0", min: 500, max: 502}, // Gap
           {strokeStyle: "#30B32D", min: 502, max: 1000} // >50 Mbps
        ]
    };

    const translations = {
        en: {
            "start-btn": "Start Test",
            "retest-btn": "Retest",
            "ping-label": "Ping",
            "jitter-label": "Jitter",
            "download-label": "Download",
            "upload-label": "Upload",
            "ip-label": "IP:",
            "isp-label": "ISP:",
            "city-label": "City:",
            "country-label": "Country:",
            "history-label": "Test History",
            "no-history-label": "No past results found.",
            "share-btn": "Share Results",
            "theme-toggle": "Toggle Theme",
            "searching-server-status": "Searching for the best server...",
            "testing-ping-status": "Testing Ping...",
            "testing-download-status": "Testing Download Speed...",
            "testing-upload-status": "Testing Upload Speed...",
            "fetching-ip-status": "Fetching...",
            "fetch-isp-error": "Could not fetch ISP info.",
            "toggle-user-info-btn": "Show My Info",
            "toggle-user-info-btn-hide": "Hide My Info",
            "retry-user-info-btn": "Retry"
        },
        es: {
            "start-btn": "Iniciar Prueba",
            "retest-btn": "Repetir",
            "ping-label": "Ping",
            "jitter-label": "Jitter",
            "download-label": "Descarga",
            "upload-label": "Subida",
            "ip-label": "IP:",
            "isp-label": "ISP:",
            "city-label": "Ciudad:",
            "country-label": "País:",
            "history-label": "Historial de Pruebas",
            "no-history-label": "No se encontraron resultados anteriores.",
            "share-btn": "Compartir Resultados",
            "theme-toggle": "Cambiar Tema",
            "searching-server-status": "Buscando el mejor servidor...",
            "testing-ping-status": "Probando Ping...",
            "testing-download-status": "Probando Velocidad de Descarga...",
            "testing-upload-status": "Probando Velocidad de Subida...",
            "fetching-ip-status": "Buscando...",
            "fetch-isp-error": "No se pudo obtener la información del ISP.",
            "toggle-user-info-btn": "Mostrar Mi Información",
            "toggle-user-info-btn-hide": "Ocultar Mi Información",
            "retry-user-info-btn": "Reintentar"
        },
        fr: {
            "start-btn": "Démarrer le Test",
            "retest-btn": "Refaire",
            "ping-label": "Ping",
            "jitter-label": "Gigue",
            "download-label": "Téléchargement",
            "upload-label": "Envoi",
            "ip-label": "IP:",
            "isp-label": "FAI:",
            "city-label": "Ville:",
            "country-label": "Pays:",
            "history-label": "Historique des tests",
            "no-history-label": "Aucun résultat précédent trouvé.",
            "share-btn": "Partager les Résultats",
            "theme-toggle": "Changer de Thème",
            "searching-server-status": "Recherche du meilleur serveur...",
            "testing-ping-status": "Test du Ping...",
            "testing-download-status": "Test de la Vitesse de Téléchargement...",
            "testing-upload-status": "Test de la Vitesse d'Envoi...",
            "fetching-ip-status": "Recherche...",
            "fetch-isp-error": "Impossible de récupérer les informations du FAI.",
            "toggle-user-info-btn": "Afficher Mes Informations",
            "toggle-user-info-btn-hide": "Masquer Mes Informations",
            "retry-user-info-btn": "Réessayer"
        }
    };

    // --- Main Test Logic ---
    const startTest = async () => {
        if (testInProgress) return;
        testInProgress = true;

        startBtn.classList.add('hidden');
        gaugesContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        resultsContainer.classList.remove('fade-in-animation');
        document.getElementById('share-container').classList.add('hidden');

        resetResults();
        initGauge();

        try {
            statusTextEl.textContent = 'Searching for the best server...';
            const { ping, jitter } = await measurePingAndJitter();
            pingResultEl.textContent = ping;
            jitterResultEl.textContent = jitter;

            gaugeTypeEl.textContent = 'Download';
            statusTextEl.textContent = 'Testing Download Speed...';
            const downloadSpeed = await measureDownloadSpeed();
            downloadResultEl.textContent = downloadSpeed;
            updateGauge(0);

            gaugeTypeEl.textContent = 'Upload';
            statusTextEl.textContent = 'Testing Upload Speed...';
            const uploadSpeed = await measureUploadSpeed();
            uploadResultEl.textContent = uploadSpeed;
            updateGauge(0);

            statusTextEl.textContent = '';

            resultsContainer.classList.remove('hidden');
            resultsContainer.classList.add('fade-in-animation');
            document.getElementById('share-container').classList.remove('hidden');

            saveTestResult({ ping, jitter, download: downloadSpeed, upload: uploadSpeed, date: new Date() });
            loadHistory();

        } catch (error) {
            console.error("Speed test failed:", error);
            alert("The speed test failed. This could be due to a network issue or a problem with the test server. Please ensure your server is configured correctly (e.g. for CORS).");
        } finally {
            testInProgress = false;
            startBtn.textContent = 'Retest';
            startBtn.classList.remove('hidden');
            gaugesContainer.classList.add('hidden');
        }
    };

    const measurePingAndJitter = async () => {
        const latencies = [];
        for (let i = 0; i < settings.ping.count; i++) {
            const startTime = Date.now();
            await fetch(settings.ping.url + `?t=${startTime}`, { cache: "no-store" });
            const endTime = Date.now();
            latencies.push(endTime - startTime);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const sum = latencies.reduce((a, b) => a + b, 0);
        const ping = Math.round(sum / latencies.length);

        let jitterSum = 0;
        for(let i = 0; i < latencies.length - 1; i++) {
            jitterSum += Math.abs(latencies[i+1] - latencies[i]);
        }
        const jitter = Math.round(jitterSum / (latencies.length - 1));

        return { ping, jitter };
    };

    const measureDownloadSpeed = async () => {
        const testDuration = 15 * 1000; // 15 seconds
        let receivedLength = 0;
        const startTime = Date.now();
        const response = await fetch(settings.download.url + `?t=${startTime}`, { cache: "no-store" });
        const reader = response.body.getReader();
        let lastUpdateTime = 0;

        function read() {
            return reader.read().then(({ done, value }) => {
                if (done) {
                    return;
                }

                receivedLength += value.length;
                const duration = Date.now() - startTime;

                if (duration >= testDuration) {
                    reader.cancel();
                    return;
                }

                if (Date.now() - lastUpdateTime > 100) { // Throttle UI updates
                    const currentSpeed = (receivedLength * 8) / (duration / 1000) / 1000 / 1000;
                    requestAnimationFrame(() => updateGauge(currentSpeed));
                    lastUpdateTime = Date.now();
                }

                return read();
            });
        }

        await read();

        const finalDuration = (Date.now() - startTime) / 1000;
        const finalSpeedMbps = (receivedLength * 8) / finalDuration / 1000 / 1000;
        return finalSpeedMbps.toFixed(2);
    };

    const measureUploadSpeed = () => {
        return new Promise((resolve, reject) => {
            const testDuration = 15 * 1000;
            const warmUpDuration = 2 * 1000;
            const data = new Blob(Array(25).fill(new ArrayBuffer(1024 * 1024)), { type: 'application/octet-stream' }); // 25MB payload

            const xhr = new XMLHttpRequest();
            const startTime = Date.now();
            let lastLoaded = 0;
            let lastTime = startTime;
            let warmupLoaded = 0;
            let warmupComplete = false;
            let totalBytesLoaded = 0;

            const speedSamples = [];
            const movingAverageSamples = 5;

            xhr.upload.onprogress = (event) => {
                totalBytesLoaded = event.loaded;
                const currentTime = Date.now();
                const elapsedTime = currentTime - startTime;

                if (!warmupComplete && elapsedTime >= warmUpDuration) {
                    warmupComplete = true;
                    warmupLoaded = event.loaded;
                    lastLoaded = event.loaded;
                    lastTime = currentTime;
                }

                if (warmupComplete) {
                    const loadedSinceLast = event.loaded - lastLoaded;
                    const timeSinceLast = currentTime - lastTime;

                    if (timeSinceLast > 100) { // Throttle UI updates
                        const speedMbps = (loadedSinceLast * 8) / (timeSinceLast / 1000) / 1000 / 1000;

                        speedSamples.push(speedMbps);
                        if (speedSamples.length > movingAverageSamples) {
                            speedSamples.shift();
                        }
                        const avgSpeed = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;

                        requestAnimationFrame(() => updateGauge(avgSpeed));

                        lastLoaded = event.loaded;
                        lastTime = currentTime;
                    }
                }
            };

            const calculateFinalSpeed = () => {
                const finalTime = Date.now();
                const totalDuration = (finalTime - startTime) / 1000;
                const durationAfterWarmup = (finalTime - (startTime + warmUpDuration)) / 1000;
                const totalSentAfterWarmup = totalBytesLoaded - warmupLoaded;

                if (durationAfterWarmup <= 0 || totalSentAfterWarmup <= 0) {
                     const avgSpeed = (totalBytesLoaded * 8) / totalDuration / 1000 / 1000;
                     resolve(avgSpeed.toFixed(2));
                } else {
                    const finalSpeedMbps = (totalSentAfterWarmup * 8) / durationAfterWarmup / 1000 / 1000;
                    resolve(finalSpeedMbps.toFixed(2));
                }
            };

            xhr.onload = calculateFinalSpeed;
            xhr.onabort = calculateFinalSpeed;
            xhr.onerror = () => reject(new Error("Upload test failed due to a network error."));

            xhr.open('POST', settings.upload.url + `?t=${Date.now()}`, true);
            xhr.send(data);

            setTimeout(() => {
                if (xhr.readyState === 1 || xhr.readyState === 3) {
                    xhr.abort();
                }
            }, testDuration);
        });
    };

    // --- UI Functions ---
    const initGauge = () => {
        const gaugeColor = getComputedStyle(document.body).getPropertyValue('--primary-color-light').trim();
        const pointerColor = getComputedStyle(document.body).getPropertyValue('--text-color-light').trim();

        gaugeOptions.pointer.color = pointerColor;
        gaugeOptions.colorStart = gaugeColor;
        gaugeOptions.colorStop = gaugeColor;

        if (!gauge) {
            const canvas = document.getElementById('gauge');
            gauge = new Gauge(canvas).setOptions(gaugeOptions);
        }

        gauge.maxValue = 1000;
        gauge.set(0);
    };

    const updateGauge = (speed) => {
        if (!gauge) return;
        const speedMbps = parseFloat(speed);

        let displayValue = 0;
        if (speedMbps <= 50) {
            // Map 0-50 Mbps to 0-500 display value
            displayValue = (speedMbps / 50) * 500;
        } else {
            // Map 50-1024 Mbps to 500-1000 display value
            displayValue = 500 + ((speedMbps - 50) / 974) * 500;
        }

        gauge.set(displayValue);
        liveSpeedEl.textContent = speedMbps.toFixed(2);
    };

    const resetResults = () => {
        pingResultEl.textContent = '-';
        jitterResultEl.textContent = '-';
        downloadResultEl.textContent = '-';
        uploadResultEl.textContent = '-';
        liveSpeedEl.textContent = '0.00';
    };

    // --- Other Functions (getUserInfo, History, Theme, Share) ---
    const getUserInfo = async () => {
        retryUserInfoBtn.classList.add('hidden');
        ipAddressEl.textContent = 'Fetching...';
        ispEl.textContent = 'Fetching...';
        cityEl.textContent = 'Fetching...';
        countryEl.textContent = 'Fetching...';
        try {
            let response = await fetch('https://ip-api.com/json');
            if (!response.ok) {
                response = await fetch('http://ip-api.com/json');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                ipAddressEl.textContent = data.query;
                ispEl.textContent = data.isp;
                cityEl.textContent = data.city;
                countryEl.textContent = data.country;
            } else {
                throw new Error('Failed to fetch user information.');
            }
        } catch (error) {
            console.error("Failed to get user info:", error);
            const errorMessage = 'Could not fetch user info.';
            ipAddressEl.textContent = errorMessage;
            ispEl.textContent = '';
            cityEl.textContent = '';
            countryEl.textContent = '';
            retryUserInfoBtn.classList.remove('hidden');
        }
    };

    const saveTestResult = (result) => {
        let history = JSON.parse(localStorage.getItem('speedTestHistory')) || [];
        history.unshift(result);
        if (history.length > 10) history.pop();
        localStorage.setItem('speedTestHistory', JSON.stringify(history));
    };

    const loadHistory = () => {
        let history = JSON.parse(localStorage.getItem('speedTestHistory')) || [];
        historyListEl.innerHTML = '';
        if (history.length === 0) {
            historyListEl.innerHTML = '<li>No past results found.</li>';
            return;
        }
        history.forEach(result => {
            const li = document.createElement('li');
            const date = new Date(result.date).toLocaleString();
            li.innerHTML = `<strong>${date}</strong> - Ping: ${result.ping}ms, Jitter: ${result.jitter}ms, Down: ${result.download} Mbps, Up: ${result.upload} Mbps`;
            historyListEl.appendChild(li);
        });
    };

    const applyTheme = (theme) => {
        if (theme === 'dark-mode') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', theme);
        if (gauge) {
            initGauge();
        }
    };

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
        applyTheme(newTheme);
    });

    shareBtn.addEventListener('click', () => {
        const resultsText = `My Internet Speed:\nPing: ${pingResultEl.textContent} ms\nJitter: ${jitterResultEl.textContent} ms\nDownload: ${downloadResultEl.textContent} Mbps\nUpload: ${uploadResultEl.textContent} Mbps`;
        navigator.clipboard.writeText(resultsText).then(() => {
            alert('Results copied to clipboard!');
        }, () => {
            alert('Failed to copy results.');
        });
    });

    const setLanguage = (lang) => {
        const translation = translations[lang];
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translation[key]) {
                element.textContent = translation[key];
            }
        });
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);
    };

    languageSelectorEl.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });

    // --- Initialization ---
    const init = () => {
        startBtn.addEventListener('click', startTest);
        gaugesContainer.classList.add('hidden');

        retryUserInfoBtn.addEventListener('click', getUserInfo);

        toggleUserInfoBtn.addEventListener('click', () => {
            const isHidden = userInfoDetails.classList.toggle('hidden');
            const lang = localStorage.getItem('language') || 'en';
            toggleUserInfoBtn.textContent = isHidden ? translations[lang]['toggle-user-info-btn'] : translations[lang]['toggle-user-info-btn-hide'];
        });

        const savedTheme = localStorage.getItem('theme') || 'light-mode';
        applyTheme(savedTheme);

        const savedLanguage = localStorage.getItem('language') || navigator.language.split('-')[0] || 'en';
        if (translations[savedLanguage]) {
            languageSelectorEl.value = savedLanguage;
            setLanguage(savedLanguage);
        }

        getUserInfo();
        loadHistory();
    };

    init();
});
