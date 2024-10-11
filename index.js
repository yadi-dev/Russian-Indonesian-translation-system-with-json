async function translate() {
    const inputText = document.getElementById('inputText').value.trim();
    const direction = currentDirection; // Use the global currentDirection variable
    const outputText = document.getElementById('outputText');
    console.log('Input:', inputText);
    console.log('Direction:', direction);
    if (!inputText) {
        outputText.innerHTML = '<p class="text-red-500">Silakan masukkan teks untuk diterjemahkan.</p>';
        return;
    }
    try {
        const response = await fetch('data.json');
        const translationData = await response.json();
        console.log('Translation data:', translationData);
        const sentences = inputText.split(/(?<=[.!?])\s+/);
        let translatedSentences = [];
        let notFoundPhrases = new Set();
        
        sentences.forEach(sentence => {
            const words = sentence.split(/\s+/);
            let translatedWords = [];
            for (let i = 0; i < words.length; i++) {
                let phrase = words[i];
                let translated = false;
                for (let j = 5; j >= 1; j--) {
                    if (i + j <= words.length) {
                        const multiWordPhrase = words.slice(i, i + j).join(' ').toLowerCase();
                        if (translationData[direction][multiWordPhrase]) {
                            const translation = translationData[direction][multiWordPhrase];
                            translatedWords.push(Array.isArray(translation) ? translation[0] : translation);
                            i += j - 1;
                            translated = true;
                            break;
                        }
                    }
                }
                if (!translated) {
                    const lowerPhrase = phrase.toLowerCase();
                    if (translationData[direction][lowerPhrase]) {
                        const translation = translationData[direction][lowerPhrase];
                        translatedWords.push(Array.isArray(translation) ? translation[0] : translation);
                    } else {
                        translatedWords.push(phrase);
                        notFoundPhrases.add(phrase);
                    }
                }
            }
            let translatedSentence = translatedWords.join(' ');
            if (direction === 'id-ru') {
                translatedSentence = applyRussianGrammarRules(translatedSentence);
            }
            translatedSentences.push(translatedSentence);
        });
        
        const result = translatedSentences.join(' ');
        console.log('Result:', result);
        let outputMessage = `
            <p class="font-semibold">Terjemahan:</p>
            <p>"${result}"</p>
            <p class="text-sm text-gray-600 mt-2">Dari ${direction === 'ru-id' ? 'Rusia ke Indonesia' : 'Indonesia ke Rusia'}</p>
            <p class="text-xs text-gray-500">terjemahan oleh yadi-dev</p>
        `;
        if (notFoundPhrases.size > 0) {
            outputMessage += `
                <p class="text-yellow-600 mt-2">Beberapa kata atau frasa tidak ditemukan dalam data terjemahan:</p>
                <p>${Array.from(notFoundPhrases).join(', ')}</p>
            `;
        }
        outputText.innerHTML = outputMessage;
    } catch (error) {
        console.error('Error:', error);
        outputText.innerHTML = '<p class="text-red-500">Terjadi kesalahan saat menerjemahkan. Silakan coba lagi.</p>';
    }
}

function applyRussianGrammarRules(sentence) {
    let words = sentence.split(' ');
    let subject = '';

    for (let i = 0; i < words.length; i++) {
        switch (words[i].toLowerCase()) {
            case 'я':
                subject = 'я';
                if (i < words.length - 1) {
                    switch (words[i+1]) {
                        case 'читать':
                            words[i+1] = 'читаю';
                            break;
                        case 'любить':
                            words[i+1] = 'люблю';
                            break;
                        case 'видеть':
                            words[i+1] = 'вижу';
                            break;
                    }
                }
                break;
            case 'ты':
                subject = 'ты';
                if (i < words.length - 1) {
                    switch (words[i+1]) {
                        case 'читать':
                            words[i+1] = 'читаешь';
                            break;
                        case 'любить':
                            words[i+1] = 'любишь';
                            break;
                        case 'видеть':
                            words[i+1] = 'видишь';
                            break;
                    }
                }
                break;
            case 'он':
            case 'она':
            case 'оно':
                subject = 'он/она/оно';
                if (i < words.length - 1) {
                    switch (words[i+1]) {
                        case 'читать':
                            words[i+1] = 'читает';
                            break;
                        case 'любить':
                            words[i+1] = 'любит';
                            break;
                        case 'видеть':
                            words[i+1] = 'видит';
                            break;
                    }
                }
                break;
            case 'книга':
                if (subject === 'я' || ['читаю', 'люблю', 'вижу', 'читаешь', 'любишь', 'видишь', 'читает', 'любит', 'видит'].includes(words[i-1])) {
                    words[i] = 'книгу';
                }
                break;
        }
    }

    return words.join(' ');
}

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const ruToIdButton = document.getElementById('ruToId');
    const idToRuButton = document.getElementById('idToRu');
    const translateButton = document.getElementById('translateButton');
    const outputText = document.getElementById('outputText');
    let currentDirection = 'ru-id';
    ruToIdButton.addEventListener('click', () => {
        currentDirection = 'ru-id';
        ruToIdButton.classList.remove('bg-gray-700', 'text-gray-300');
        ruToIdButton.classList.add('bg-gray-800', 'text-white');
        idToRuButton.classList.remove('bg-gray-800', 'text-white');
        idToRuButton.classList.add('bg-gray-700', 'text-gray-300');
    });
    idToRuButton.addEventListener('click', () => {
        currentDirection = 'id-ru';
        idToRuButton.classList.remove('bg-gray-700', 'text-gray-300');
        idToRuButton.classList.add('bg-gray-800', 'text-white');
        ruToIdButton.classList.remove('bg-gray-800', 'text-white');
        ruToIdButton.classList.add('bg-gray-700', 'text-gray-300');
    });
    translateButton.addEventListener('click', async () => {
        const text = inputText.value.trim();

        if (text === '') {
            outputText.textContent = 'Silakan masukkan teks untuk diterjemahkan.';
            return;
        }

        try {
            // Fetch translation data
            const response = await fetch('data.json');
            const translationData = await response.json();
            const sentences = text.split(/(?<=[.!?])\s+/);
            let translatedSentences = [];
            let notFoundPhrases = [];
            sentences.forEach(sentence => {
                const lowerSentence = sentence.toLowerCase();
                if (translationData[currentDirection][lowerSentence]) {
                    translatedSentences.push(translationData[currentDirection][lowerSentence]);
                } else {
                    const words = sentence.split(' ');
                    let translatedWords = [];
                    words.forEach(word => {
                        const lowerWord = word.toLowerCase();
                        if (translationData[currentDirection][lowerWord]) {
                            translatedWords.push(translationData[currentDirection][lowerWord]);
                        } else {
                            translatedWords.push(word);
                            notFoundPhrases.push(word);
                        }
                    });
                    translatedSentences.push(translatedWords.join(' '));
                }
            });
            let outputMessage = `
                <p class="font-semibold">Terjemahan:</p>
                <p>"${translatedSentences.join(' ')}"</p>
                <p class="text-sm text-gray-600 mt-2">Dari ${currentDirection === 'ru-id' ? 'Rusia ke Indonesia' : 'Indonesia ke Rusia'}</p>
                <p class="text-xs text-gray-500">terjemahan oleh yadi-dev</p>
            `;
            if (notFoundPhrases.length > 0) {
                outputMessage += `
                    <p class="text-yellow-600 mt-2">Beberapa kata atau frasa tidak ditemukan dalam data terjemahan:</p>
                    <p>${notFoundPhrases.join(', ')}</p>
                `;
            }
            outputText.innerHTML = outputMessage;
        } catch (error) {
            console.error('Error:', error);
            outputText.innerHTML = '<p class="text-red-500">Terjadi kesalahan saat menerjemahkan. Silakan coba lagi.</p>';
        }
    });
});