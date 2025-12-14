document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const vieSetup = document.getElementById('view-setup');
    const viewTranslator = document.getElementById('view-translator');
    const inputApiKey = document.getElementById('input-api-key');
    const btnSaveKey = document.getElementById('btn-save-key');
    const btnSettings = document.getElementById('btn-settings');

    const inputText = document.getElementById('input-text');
    const selectTone = document.getElementById('select-tone');
    const selectContext = document.getElementById('select-context');
    const selectAudience = document.getElementById('select-audience');
    const btnTranslate = document.getElementById('btn-translate');
    const outputContainer = document.getElementById('output-container');
    const outputText = document.getElementById('output-text');
    const btnCopy = document.getElementById('btn-copy');
    const btnReverseMode = document.getElementById('btn-reverse-mode');

    let isReverseMode = false;

    // Load Key
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');

    if (geminiApiKey) {
        showTranslator();
    } else {
        showSetup();
    }

    // --- Handlers ---

    btnSaveKey.addEventListener('click', async () => {
        const key = inputApiKey.value.trim();
        if (!key) return;

        await chrome.storage.local.set({ geminiApiKey: key });
        showTranslator();
    });

    btnSettings.addEventListener('click', () => {
        showSetup();
    });

    // Toggle Reverse Mode
    btnReverseMode.addEventListener('click', () => {
        isReverseMode = !isReverseMode;

        // Update UI
        if (isReverseMode) {
            btnReverseMode.classList.replace('text-slate-500', 'text-amber-400');
            inputText.placeholder = "Paste corporate jargon here... (e.g. 'Let's circle back')";
            btnTranslate.classList.replace('bg-indigo-600', 'bg-amber-600');
            btnTranslate.classList.replace('hover:bg-indigo-500', 'hover:bg-amber-500');
        } else {
            btnReverseMode.classList.replace('text-amber-400', 'text-slate-500');
            inputText.placeholder = "Type raw thoughts (e.g. 'That is stupid')";
            btnTranslate.classList.replace('bg-amber-600', 'bg-indigo-600');
            btnTranslate.classList.replace('hover:bg-amber-500', 'hover:bg-indigo-500');
        }
    });

    btnTranslate.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) return;

        setLoading(true);
        outputContainer.classList.add('hidden');

        try {
            const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
            if (!geminiApiKey) throw new Error('API Key missing');

            const response = await fetch('http://localhost:5000/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-gemini-api-key': geminiApiKey
                },
                body: JSON.stringify({
                    text,
                    tone: selectTone.value,
                    context: selectContext.value,
                    audience: selectAudience.value,
                    reverseMode: isReverseMode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Translation failed');
            }

            outputText.textContent = data.translation;
            outputContainer.classList.remove('hidden');
        } catch (err) {
            outputText.textContent = `Error: ${err.message}. Ensure localhost:5000 is running.`;
            outputContainer.classList.remove('hidden');
        } finally {
            setLoading(false);
        }
    });

    btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(outputText.textContent);
        const originalText = btnCopy.innerHTML;
        btnCopy.textContent = 'Copied!';
        setTimeout(() => {
            btnCopy.innerHTML = originalText;
        }, 2000);
    });

    // --- Helpers ---

    function showSetup() {
        vieSetup.classList.remove('hidden');
        viewTranslator.classList.add('hidden');
        viewTranslator.style.display = 'none'; // Ensure fully hidden
        vieSetup.style.display = 'flex';
    }

    function showTranslator() {
        vieSetup.classList.add('hidden');
        vieSetup.style.display = 'none';
        viewTranslator.classList.remove('hidden');
        viewTranslator.style.display = 'flex';
    }

    function setLoading(isLoading) {
        if (isLoading) {
            btnTranslate.disabled = true;
            btnTranslate.innerHTML = '<svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M4 12a8 8 0 0 1 8-8"></path></svg> Translating...';
        } else {
            btnTranslate.disabled = false;
            btnTranslate.innerHTML = '<span>Translate</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        }
    }
});
