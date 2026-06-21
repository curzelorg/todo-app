/**
 * 📝 Todo List Application
 * Main application logic and DOM manipulation
 */

class TodoApp {
    constructor() {
        this.todos = [];
        this.filteredTodos = [];
        this.editingId = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadTodos();
        this.setupEventListeners();
        this.applySettings();
        this.render();
        this.setupKeyboardShortcuts();
        console.log('✅ Todo App initialized');
    }

    /**
     * Load todos from storage
     */
    loadTodos() {
        this.todos = todoStorage.getTodos();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.querySelector('.settings-btn').addEventListener('click', () => this.openSettings());
        document.getElementById('darkModeSetting').addEventListener('change', (e) => {
            todoStorage.updateSetting('darkMode', e.target.checked);
            this.applySettings();
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        document.getElementById('statusFilter').addEventListener('change', () => this.filterAndRender());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterAndRender());
        document.getElementById('priorityFilter').addEventListener('change', () => this.filterAndRender());
        document.getElementById('sortBy').addEventListener('change', () => this.filterAndRender());
        document.getElementById('searchInput').addEventListener('input', debounce(() => this.filterAndRender(), 300));
        document.getElementById('resetBtn').addEventListener('click', () => this.resetFilters());

        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllData());

        document.getElementById('saveEditBtn').addEventListener('click', () => this.saveEdit());

        document.getElementById('prioritySelect').value = todoStorage.getSettings().defaultPriority;
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        shortcuts.register('n', 'ctrl', () => {
            document.getElementById('todoInput').focus();
        });

        shortcuts.register('f', 'ctrl', () => {
            document.getElementById('searchInput').focus();
        });

        shortcuts.register('k', 'ctrl', () => {
            this.openSettings();
        });
    }

    /**
     * Add new todo
     */
    addTodo() {
        const input = document.getElementById('todoInput');
        const title = input.value.trim();

        if (!title) {
            this.showToast('Please enter a task', 'error');
            return;
        }

        const category = document.getElementById('categorySelect').value;
        const priority = document.getElementById('prioritySelect').value;
        const dueDate = document.getElementById('dueDateInput').value;

        const todo = todoStorage.addTodo({
            title,
            description: '',
            category: category || null,
            priority,
            dueDate: dueDate ? dueDate : null
        });

        this.todos.push(todo);
        this.filterAndRender();

        input.value = '';
        document.getElementById('categorySelect').value = '';
        document.getElementById('dueDateInput').value = '';

        this.showToast('✅ Task added successfully');
    }

    /**
     * Delete todo
     */
    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            todoStorage.deleteTodo(id);
            this.todos = this.todos.filter(t => t.id !== id);
            this.filterAndRender();
            this.showToast('🗑️ Task deleted');
        }
    }

    /**
     * Toggle todo completion
     */
    toggleTodo(id) {
        todoStorage.toggleTodo(id);
        this.loadTodos();
        this.filterAndRender();
    }

    /**
     * Open edit modal
     */
    openEdit(id) {
        this.editingId = id;
        const todo = this.todos.find(t => t.id === id);

        if (!todo) return;

        document.getElementById('editTitle').value = todo.title;
        document.getElementById('editDescription').value = todo.description || '';
        document.getElementById('editCategory').value = todo.category || '';
        document.getElementById('editPriority').value = todo.priority;
        document.getElementById('editDueDate').value = formatDateForInput(todo.dueDate);

        document.getElementById('editModal').style.display = 'flex';
    }

    /**
     * Save edited todo
     */
    saveEdit() {
        const title = document.getElementById('editTitle').value.trim();
        if (!title) {
            this.showToast('Title cannot be empty', 'error');
            return;
        }

        todoStorage.updateTodo(this.editingId, {
            title,
            description: document.getElementById('editDescription').value,
            category: document.getElementById('editCategory').value || null,
            priority: document.getElementById('editPriority').value,
            dueDate: document.getElementById('editDueDate').value || null
        });

        this.loadTodos();
        this.filterAndRender();
        document.getElementById('editModal').style.display = 'none';
        this.showToast('✏️ Task updated');
    }

    /**
     * Filter and render todos
     */
    filterAndRender() {
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        let filtered = [...this.todos];

        if (statusFilter === 'active') {
            filtered = filtered.filter(t => !t.completed);
        } else if (statusFilter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        }

        if (categoryFilter) {
            filtered = filtered.filter(t => t.category === categoryFilter);
        }

        if (priorityFilter) {
            filtered = filtered.filter(t => t.priority === priorityFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(searchTerm) ||
                (t.description && t.description.toLowerCase().includes(searchTerm))
            );
        }

        const priorityOrder = { high: 3, medium: 2, low: 1 };
        
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        this.filteredTodos = filtered;
        this.render();
    }

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('sortBy').value = 'dueDate';
        document.getElementById('searchInput').value = '';
        this.filterAndRender();
    }

    /**
     * Render todos to DOM
     */
    render() {
        const todosList = document.getElementById('todosList');
        const emptyState = document.getElementById('emptyState');
        const noResultsState = document.getElementById('noResultsState');

        this.updateStats();

        if (this.todos.length === 0) {
            todosList.innerHTML = '';
            emptyState.style.display = 'block';
            noResultsState.style.display = 'none';
            return;
        }

        if (this.filteredTodos.length === 0) {
            todosList.innerHTML = '';
            emptyState.style.display = 'none';
            noResultsState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        noResultsState.style.display = 'none';

        todosList.innerHTML = this.filteredTodos.map(todo => this.createTodoElement(todo)).join('');

        document.querySelectorAll('.todo-item').forEach(item => {
            const id = item.dataset.id;

            item.querySelector('.todo-checkbox').addEventListener('change', () => {
                this.toggleTodo(id);
            });

            item.querySelector('.todo-edit-btn').addEventListener('click', () => {
                this.openEdit(id);
            });

            item.querySelector('.todo-delete-btn').addEventListener('click', () => {
                this.deleteTodo(id);
            });
        });
    }

    /**
     * Create todo element HTML
     */
    createTodoElement(todo) {
        const categoryEmoji = todo.category ? getCategoryEmoji(todo.category) : '';
        const priorityIcon = getPriorityIcon(todo.priority);
        const overdueClass = todo.dueDate && isOverdue(todo.dueDate) ? 'overdue' : '';
        
        let dueDateStr = '';
        if (todo.dueDate) {
            const days = daysUntilDue(todo.dueDate);
            dueDateStr = `${formatDate(todo.dueDate)} (${days}d)`;
        }

        return `
            <div class="todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                
                <div class="todo-content">
                    <div class="todo-header">
                        <span class="todo-title">${this.escapeHtml(todo.title)}</span>
                    </div>
                    
                    <div class="todo-meta">
                        ${todo.category ? `<span class="todo-category">${categoryEmoji} ${capitalize(todo.category)}</span>` : ''}
                        <span class="todo-priority ${todo.priority}">${priorityIcon} ${capitalize(todo.priority)}</span>
                        ${todo.dueDate ? `<span class="todo-due-date ${overdueClass}">📅 ${dueDateStr}</span>` : ''}
                    </div>

                    ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                </div>

                <div class="todo-actions">
                    <button class="todo-btn todo-edit-btn" title="Edit">✏️</button>
                    <button class="todo-btn delete todo-delete-btn" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    }

    /**
     * Update statistics
     */
    updateStats() {
        const stats = todoStorage.getStats();
        
        document.getElementById('totalCount').textContent = stats.total;
        document.getElementById('completedCount').textContent = stats.completed;
        document.getElementById('activeCount').textContent = stats.active;
        document.getElementById('progressPercent').textContent = stats.completionRate + '%';

        document.getElementById('statTotal').textContent = stats.total;
        document.getElementById('statCompleted').textContent = stats.completed;
        document.getElementById('statActive').textContent = stats.active;
        document.getElementById('statRate').textContent = stats.completionRate + '%';
    }

    /**
     * Open settings modal
     */
    openSettings() {
        const settings = todoStorage.getSettings();
        document.getElementById('darkModeSetting').checked = settings.darkMode;
        document.getElementById('defaultPriority').value = settings.defaultPriority;
        document.getElementById('settingsModal').style.display = 'flex';
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        todoStorage.updateSetting('darkMode', isDarkMode);
        
        const emoji = isDarkMode ? '☀️' : '🌙';
        document.querySelector('.theme-toggle').textContent = emoji;
    }

    /**
     * Apply settings
     */
    applySettings() {
        const settings = todoStorage.getSettings();
        
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-toggle').textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            document.querySelector('.theme-toggle').textContent = '🌙';
        }
    }

    /**
     * Export data as JSON
     */
    exportData() {
        const data = todoStorage.export();
        const json = JSON.stringify(data, null, 2);
        const filename = `todos-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(json, filename, 'application/json');
        this.showToast('📥 Data exported successfully');
    }

    /**
     * Import data from JSON
     */
    async importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const content = await readFileAsText(file);
            const data = JSON.parse(content);
            todoStorage.import(data);
            this.loadTodos();
            this.filterAndRender();
            this.showToast('📤 Data imported successfully');
        } catch (error) {
            this.showToast('❌ Failed to import data', 'error');
            console.error('Import error:', error);
        }

        e.target.value = '';
    }

    /**
     * Clear all data
     */
    clearAllData() {
        if (confirm('⚠️ Are you sure? This will delete ALL tasks permanently.')) {
            if (confirm('This cannot be undone. Are you really sure?')) {
                todoStorage.clearAll();
                this.todos = [];
                this.filterAndRender();
                this.showToast('🗑️ All data cleared');
            }
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.classList.add('hidden');
            setTimeout(() => {
                toast.style.display = 'none';
                toast.classList.remove('hidden');
            }, 300);
        }, 3000);
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});
