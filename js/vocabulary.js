// Vocabulary Management Module
const VocabularyManager = {
    words: [],
    favorites: new Set(),
    difficult: new Set(),

    // Topic-based word lists for Context Bonus
    topicWords: {
        business: [
            'contract', 'negotiation', 'agreement', 'investment', 'profit', 'revenue',
            'budget', 'meeting', 'proposal', 'client', 'employee', 'manager',
            'strategy', 'marketing', 'sales', 'productivity', 'merger', 'acquisition',
            'deadline', 'presentation', 'report', 'analysis', 'forecast', 'quarterly'
        ],
        travel: [
            'itinerary', 'destination', 'reservation', 'accommodation', 'passport',
            'boarding', 'departure', 'arrival', 'luggage', 'tourist', 'excursion',
            'hotel', 'flight', 'ticket', 'customs', 'immigration', 'vacation',
            'journey', 'adventure', 'sightseeing', 'guide', 'airport', 'terminal'
        ],
        general: []
    },

    // TOEIC common vocabulary list
    toeicWords: [
        // Business & Work
        'contract', 'negotiation', 'agreement', 'investment', 'revenue', 'profit',
        'budget', 'employee', 'manager', 'colleague', 'supervisor', 'client',
        'deadline', 'presentation', 'meeting', 'agenda', 'proposal', 'strategy',

        // Travel & Transportation
        'itinerary', 'destination', 'reservation', 'accommodation', 'departure',
        'arrival', 'boarding', 'luggage', 'passenger', 'terminal', 'customs',

        // Office & Administration
        'document', 'file', 'report', 'memo', 'schedule', 'appointment',
        'invoice', 'receipt', 'payment', 'transaction', 'procedure', 'policy',

        // Communication
        'conference', 'discussion', 'correspondence', 'inquiry', 'response',
        'announcement', 'notification', 'message', 'feedback', 'confirmation'
    ],

    init() {
        this.load();
    },

    load() {
        const saved = localStorage.getItem('wordChainVocabulary');
        if (saved) {
            const data = JSON.parse(saved);
            this.words = data.words || [];
            this.favorites = new Set(data.favorites || []);
            this.difficult = new Set(data.difficult || []);
        }
    },

    save() {
        const data = {
            words: this.words,
            favorites: Array.from(this.favorites),
            difficult: Array.from(this.difficult)
        };
        localStorage.setItem('wordChainVocabulary', JSON.stringify(data));
    },

    addWord(word, translation, definition = null) {
        // Check if word already exists
        const existing = this.words.find(w => w.word === word);
        if (existing) {
            existing.count++;
            existing.lastUsed = new Date().toISOString();
        } else {
            this.words.push({
                word: word,
                translation: translation,
                definition: definition,
                count: 1,
                addedDate: new Date().toISOString(),
                lastUsed: new Date().toISOString()
            });
        }
        this.save();
    },

    toggleFavorite(word) {
        if (this.favorites.has(word)) {
            this.favorites.delete(word);
        } else {
            this.favorites.add(word);
        }
        this.save();
    },

    markDifficult(word) {
        this.difficult.add(word);
        this.save();
    },

    isFavorite(word) {
        return this.favorites.has(word);
    },

    isDifficult(word) {
        return this.difficult.has(word);
    },

    getAll() {
        return this.words.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
    },

    getFavorites() {
        return this.words.filter(w => this.favorites.has(w.word));
    },

    getDifficult() {
        return this.words.filter(w => this.difficult.has(w.word));
    },

    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.words.filter(w =>
            w.word.toLowerCase().includes(lowerQuery) ||
            (w.translation && w.translation.toLowerCase().includes(lowerQuery))
        );
    },

    exportToCSV() {
        const headers = ['Word', 'Translation', 'Times Used', 'Favorite', 'Difficult', 'Added Date', 'Last Used'];
        const rows = this.words.map(w => [
            w.word,
            w.translation || '',
            w.count,
            this.favorites.has(w.word) ? 'Yes' : 'No',
            this.difficult.has(w.word) ? 'Yes' : 'No',
            new Date(w.addedDate).toLocaleDateString(),
            new Date(w.lastUsed).toLocaleDateString()
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `word-chain-vocabulary-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    async fetchDefinition(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) return null;

            const data = await response.json();
            const entry = data[0];

            return {
                word: entry.word,
                phonetic: entry.phonetic || entry.phonetics[0]?.text || '',
                audio: entry.phonetics.find(p => p.audio)?.audio || '',
                meanings: entry.meanings.map(m => ({
                    partOfSpeech: m.partOfSpeech,
                    definitions: m.definitions.slice(0, 3).map(d => ({
                        definition: d.definition,
                        example: d.example || ''
                    }))
                }))
            };
        } catch (error) {
            console.error('Error fetching definition:', error);
            return null;
        }
    },

    // Check if word is a TOEIC word
    isTOEICWord(word) {
        return this.toeicWords.includes(word.toLowerCase());
    },

    // Check if word matches selected topic
    matchesTopic(word, topic) {
        if (topic === 'general') return false; // No bonus for general
        return this.topicWords[topic]?.includes(word.toLowerCase()) || false;
    }
};
