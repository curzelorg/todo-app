/**
 * 🛠️ Utility Functions
 * Helper functions for date formatting, validation, and common operations
 */

/**
 * Format date to readable string
 */
function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (d.getTime() === today.getTime()) return 'Today';
    if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (d.getTime() === yesterday.getTime()) return 'Yesterday';

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
}

/**
 * Check if date is overdue
 */
function isOverdue(date) {
    if (!date) return false;
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return d < today;
}

/**
 * Get days until due date
 */
function daysUntilDue(date) {
    if (!date) return null;
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diff = d - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format date to YYYY-MM-DD for input[type="date"]
 */
function formatDateForInput(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Debounce function
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Get category emoji
 */
function getCategoryEmoji(category) {
    const emojis = {
        'work': '🏢',
        'personal': '👤',
        'shopping': '🛒',
        'health': '🏥',
        'finance': '💰',
        'education': '📚',
        'home': '🏠',
        'entertainment': '🎬',
        'travel': '✈️',
        'other': '📝'
    };
    return emojis[category] || '📝';
}

/**
 * Get priority icon
 */
function getPriorityIcon(priority) {
    const icons = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🟢'
    };
    return icons[priority] || '⚪';
}

/**
 * Capitalize string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Download file
 */
function downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Read file as text
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

/**
 * Keyboard shortcut handler
 */
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    register(key, modifier, callback) {
        const id = `${modifier}-${key}`;
        this.shortcuts.set(id, callback);
    }

    handleKeydown(e) {
        const modifier = e.ctrlKey || e.metaKey ? 'ctrl' : e.altKey ? 'alt' : 'none';
        const id = `${modifier}-${e.key.toLowerCase()}`;
        
        if (this.shortcuts.has(id)) {
            e.preventDefault();
            this.shortcuts.get(id)();
        }
    }
}

// Create global instance
const shortcuts = new KeyboardShortcuts();
