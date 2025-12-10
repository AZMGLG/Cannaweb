// Production-Ready Multi-API Translation System
// Supports Microsoft Translator, DeepL, and LibreTranslate with fallbacks

class ProductionTranslator {
    constructor() {
        this.supportedLanguages = ['en', 'es', 'de', 'pt', 'it'];
        this.currentLanguage = 'en';
        this.cache = new Map();
        this.originalTexts = new Map();
        this.isTranslating = false;
        this.rateLimitCount = 0;
        this.maxRateLimitErrors = 3;
        
        // Smart failover system
        this.apiHealth = {
            libretranslate: { failures: 0, lastFailure: 0, disabled: false },
            libretranslate_alt: { failures: 0, lastFailure: 0, disabled: false },
            mymemory: { failures: 0, lastFailure: 0, disabled: false }
        };
        this.maxFailures = 5; // More tolerant - disable after 5 consecutive failures
        this.failureTimeout = 10000; // Re-enable after only 10 seconds for faster recovery
        this.healthCheckInterval = setInterval(() => this.checkAndReenableApis(), 5000); // Check every 5s
        
        // API Configuration - Prioritizing no-API-key options
        this.apis = {
            libretranslate: {
                name: 'LibreTranslate',
                url: 'https://libretranslate.de/translate', // Public instance
                enabled: true, // No API key needed
                freeLimit: Infinity,
                priority: 1,
                timeout: 5000 // 5 second timeout for faster failover
            },
            libretranslate_alt: {
                name: 'LibreTranslate Alt',
                url: 'https://translate.argosopentech.com/translate', // Alternative public instance
                enabled: true, // No API key needed
                freeLimit: Infinity,
                priority: 2,
                timeout: 5000 // 5 second timeout for faster failover
            },
            microsoft: {
                name: 'Microsoft Translator',
                url: 'https://api.cognitive.microsofttranslator.com/translate',
                key: '', // Add your Microsoft Translator API key here
                region: '', // Add your Azure region here
                enabled: false, // Set to true when you have API key
                freeLimit: 2000000, // 2M characters/month
                priority: 3
            },
            deepl: {
                name: 'DeepL',
                url: 'https://api-free.deepl.com/v2/translate',
                key: '', // Add your DeepL API key here
                enabled: false, // Set to true when you have API key
                freeLimit: 500000, // 500K characters/month
                priority: 4
            },
            mymemory: {
                name: 'MyMemory',
                url: 'https://api.mymemory.translated.net/get',
                enabled: true, // Fallback option
                freeLimit: 1000, // Very limited
                priority: 5
            }
        };
        
        // Elements to translate
        this.translatableSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'div', 'a', 'li', 'td', 'th',
            'label', 'button', 'strong', 'em', 'small',
            'blockquote', 'figcaption', 'legend'
        ];
        
        // Elements to exclude
        this.excludeSelectors = [
            'script', 'style', 'noscript', 'code', 'pre',
            '.lang-btn', '.language-switcher', '.nav-toggle',
            '[data-no-translate]'
        ];
        
        this.init();
    }

    async init() {
        const savedLanguage = localStorage.getItem('cannabis-madrid-language');
        const browserLanguage = this.detectBrowserLanguage();
        this.currentLanguage = savedLanguage || browserLanguage || 'en';
        
        this.storeOriginalTexts();
        this.updateLanguageSwitcher();
        
        if (this.currentLanguage !== 'en') {
            await this.translateAllElements();
        }
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        
        if (this.supportedLanguages.includes(langCode)) {
            return langCode;
        }
        
        return 'en';
    }

    storeOriginalTexts() {
        const elements = this.getTranslatableElements();
        elements.forEach(element => {
            const text = this.extractText(element);
            if (text && text.trim().length > 0) {
                this.originalTexts.set(element, text);
            }
        });
    }

    getTranslatableElements() {
        const elements = [];
        
        this.translatableSelectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(element => {
                if (!this.shouldExcludeElement(element)) {
                    elements.push(element);
                }
            });
        });
        
        return elements;
    }

    shouldExcludeElement(element) {
        // Check if element should be excluded
        for (const selector of this.excludeSelectors) {
            if (element.matches(selector)) {
                return true;
            }
        }
        
        // Check if element is inside excluded parent
        let parent = element.parentElement;
        while (parent) {
            for (const selector of this.excludeSelectors) {
                if (parent.matches(selector)) {
                    return true;
                }
            }
            parent = parent.parentElement;
        }
        
        return false;
    }

    extractText(element) {
        if (element.children.length === 0) {
            return element.textContent;
        }
        
        let text = '';
        Array.from(element.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            }
        });
        
        return text.trim();
    }

    async translateText(text, targetLang) {
        if (targetLang === 'en') return text;
        
        const cacheKey = `${text}_${targetLang}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Get healthy APIs in priority order
        const healthyApis = this.getHealthyApis();

        for (const [apiKey, api] of healthyApis) {
            try {
                const translatedText = await this.callTranslationAPI(apiKey, api, text, targetLang);
                if (translatedText && translatedText !== text) {
                    this.cache.set(cacheKey, translatedText);
                    this.recordApiSuccess(apiKey);
                    return translatedText;
                }
            } catch (error) {
                console.warn(`${api.name} failed:`, error.message);
                this.recordApiFailure(apiKey);
                continue;
            }
        }

        console.warn('All translation APIs failed, returning original text');
        return text;
    }

    getHealthyApis() {
        // Return enabled APIs - skip health checks for speed
        // Health is checked only on failures, not on every translation
        return Object.entries(this.apis)
            .filter(([key, api]) => api.enabled && !this.apiHealth[key]?.disabled)
            .sort((a, b) => a[1].priority - b[1].priority);
    }

    checkAndReenableApis() {
        const now = Date.now();
        Object.keys(this.apiHealth).forEach(apiKey => {
            const health = this.apiHealth[apiKey];
            if (health.disabled && (now - health.lastFailure) > this.failureTimeout) {
                console.log(`Re-enabling ${apiKey} after timeout`);
                health.disabled = false;
                health.failures = 0;
            }
        });
    }

    recordApiSuccess(apiKey) {
        if (this.apiHealth[apiKey]) {
            this.apiHealth[apiKey].failures = 0;
            this.apiHealth[apiKey].disabled = false;
        }
    }

    recordApiFailure(apiKey) {
        if (this.apiHealth[apiKey]) {
            this.apiHealth[apiKey].failures++;
            this.apiHealth[apiKey].lastFailure = Date.now();
            
            if (this.apiHealth[apiKey].failures >= this.maxFailures) {
                this.apiHealth[apiKey].disabled = true;
                console.warn(`${apiKey} disabled due to ${this.maxFailures} consecutive failures`);
            }
        }
    }

    async callTranslationAPI(apiKey, api, text, targetLang) {
        switch (apiKey) {
            case 'libretranslate':
            case 'libretranslate_alt':
                return await this.translateLibreTranslate(api, text, targetLang);
            case 'microsoft':
                return await this.translateMicrosoft(api, text, targetLang);
            case 'deepl':
                return await this.translateDeepL(api, text, targetLang);
            case 'mymemory':
                return await this.translateMyMemory(api, text, targetLang);
            default:
                throw new Error(`Unknown API: ${apiKey}`);
        }
    }

    async translateMicrosoft(api, text, targetLang) {
        if (!api.key || !api.region) {
            throw new Error('Microsoft Translator API key or region not configured');
        }

        const response = await fetch(`${api.url}?api-version=3.0&to=${targetLang}`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': api.key,
                'Ocp-Apim-Subscription-Region': api.region,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{ text: text }])
        });

        if (!response.ok) {
            throw new Error(`Microsoft API error: ${response.status}`);
        }

        const data = await response.json();
        return data[0]?.translations[0]?.text || text;
    }

    async translateDeepL(api, text, targetLang) {
        if (!api.key) {
            throw new Error('DeepL API key not configured');
        }

        const response = await fetch(api.url, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${api.key}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                text: text,
                target_lang: targetLang.toUpperCase(),
                source_lang: 'EN'
            })
        });

        if (!response.ok) {
            throw new Error(`DeepL API error: ${response.status}`);
        }

        const data = await response.json();
        return data.translations[0]?.text || text;
    }

    async translateLibreTranslate(api, text, targetLang) {
        const timeout = api.timeout || 5000; // 5 second timeout for fast failover
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(api.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text,
                    source: 'en',
                    target: targetLang,
                    format: 'text'
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                // Detect specific overload conditions
                if (response.status === 429 || response.status === 503) {
                    throw new Error(`LibreTranslate overloaded (${response.status})`);
                }
                throw new Error(`LibreTranslate API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(`LibreTranslate error: ${data.error}`);
            }
            
            return data.translatedText || text;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('LibreTranslate timeout - switching to fallback');
            }
            throw error;
        }
    }

    async translateMyMemory(api, text, targetLang) {
        // No delay - we want fast failover
        
        const response = await fetch(`${api.url}?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        
        if (response.status === 429) {
            throw new Error('MyMemory rate limited');
        }
        
        if (!response.ok) {
            throw new Error(`MyMemory API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData) {
            return data.responseData.translatedText;
        }
        
        throw new Error('MyMemory translation failed');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async translateElement(element) {
        const originalText = this.originalTexts.get(element);
        if (!originalText) return;

        const translatedText = await this.translateText(originalText, this.currentLanguage);
        
        if (element.children.length === 0) {
            element.textContent = translatedText;
        } else {
            const textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (textNode) {
                textNode.textContent = translatedText;
            } else {
                element.textContent = translatedText;
            }
        }
    }

    async translateAllElements() {
        if (this.isTranslating) return;
        this.isTranslating = true;

        const elements = this.getTranslatableElements();
        
        // Process ALL elements in parallel for maximum speed
        await Promise.all(elements.map(element => this.translateElement(element)));
        
        this.isTranslating = false;
    }

    restoreOriginalTexts() {
        this.originalTexts.forEach((originalText, element) => {
            const textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (textNode) {
                textNode.textContent = originalText;
            } else {
                element.textContent = originalText;
            }
        });
    }

    async changeLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.error('Unsupported language:', lang);
            return;
        }

        this.currentLanguage = lang;
        localStorage.setItem('cannabis-madrid-language', lang);
        
        this.updateLanguageSwitcher();
        
        if (lang === 'en') {
            this.restoreOriginalTexts();
        } else {
            await this.translateAllElements();
        }
        
        this.updatePageMeta();
    }

    updateLanguageSwitcher() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === this.currentLanguage) {
                btn.classList.add('active');
            }
        });
    }

    updatePageMeta() {
        document.documentElement.lang = this.currentLanguage;
    }

    // Method to configure API keys
    configureAPI(apiName, key, region = null) {
        if (this.apis[apiName]) {
            this.apis[apiName].key = key;
            if (region) {
                this.apis[apiName].region = region;
            }
            this.apis[apiName].enabled = true;
            console.log(`${apiName} API configured successfully`);
        }
    }

    // Method to get API status
    getAPIStatus() {
        return Object.entries(this.apis).map(([key, api]) => ({
            name: api.name,
            enabled: api.enabled,
            hasKey: !!api.key,
            freeLimit: api.freeLimit,
            health: this.apiHealth[key] || { failures: 0, disabled: false },
            status: this.getApiStatusText(key)
        }));
    }

    getApiStatusText(apiKey) {
        const health = this.apiHealth[apiKey];
        if (!health) return 'Unknown';
        
        if (health.disabled) {
            const timeLeft = Math.max(0, this.failureTimeout - (Date.now() - health.lastFailure));
            return `Disabled (${Math.ceil(timeLeft / 1000)}s until retry)`;
        }
        
        if (health.failures > 0) {
            return `Degraded (${health.failures}/${this.maxFailures} failures)`;
        }
        
        return 'Healthy';
    }

    // Method to manually reset API health
    resetApiHealth(apiKey = null) {
        if (apiKey) {
            if (this.apiHealth[apiKey]) {
                this.apiHealth[apiKey] = { failures: 0, lastFailure: 0, disabled: false };
                console.log(`Reset health for ${apiKey}`);
            }
        } else {
            Object.keys(this.apiHealth).forEach(key => {
                this.apiHealth[key] = { failures: 0, lastFailure: 0, disabled: false };
            });
            console.log('Reset health for all APIs');
        }
    }
}

// Initialize the production translator
const productionTranslator = new ProductionTranslator();

// Language button event listeners
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.dataset.lang;
            productionTranslator.changeLanguage(lang);
        });
    });
});

// Export for configuration and monitoring
window.configureTranslationAPI = (apiName, key, region = null) => {
    productionTranslator.configureAPI(apiName, key, region);
};

window.getTranslationAPIStatus = () => {
    return productionTranslator.getAPIStatus();
};

window.resetTranslationAPIHealth = (apiKey = null) => {
    productionTranslator.resetApiHealth(apiKey);
};

window.getTranslationHealth = () => {
    return productionTranslator.apiHealth;
};
