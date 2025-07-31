class ErrorLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.init();
    }

    init() {
        this.loadLogs();
    }

    logError(error, context = {}) {
        const timestamp = new Date().toISOString();
        const errorEntry = {
            timestamp,
            message: error.message || error.toString(),
            stack: error.stack || null,
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: context,
            id: this.generateId()
        };

        this.logs.unshift(errorEntry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        this.saveLogs();
        console.error(`[${timestamp}] Error logged:`, error);
        
        return errorEntry.id;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getLogs(limit = 100) {
        return this.logs.slice(0, limit);
    }

    clearLogs() {
        this.logs = [];
        this.saveLogs();
    }

    exportLogs() {
        const data = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    saveLogs() {
        try {
            localStorage.setItem('errorLogs', JSON.stringify(this.logs));
        } catch (e) {
            console.warn('Failed to save error logs to localStorage:', e);
        }
    }

    loadLogs() {
        try {
            const saved = localStorage.getItem('errorLogs');
            if (saved) {
                this.logs = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load error logs from localStorage:', e);
            this.logs = [];
        }
    }

    getLogsByTimeRange(startDate, endDate) {
        return this.logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= endDate;
        });
    }

    searchLogs(query) {
        return this.logs.filter(log => 
            log.message.toLowerCase().includes(query.toLowerCase()) ||
            (log.stack && log.stack.toLowerCase().includes(query.toLowerCase())) ||
            JSON.stringify(log.context).toLowerCase().includes(query.toLowerCase())
        );
    }
}

const errorLogger = new ErrorLogger();

window.logError = function(error, context = {}) {
    return errorLogger.logError(error, context);
};

window.getErrorLogs = function(limit) {
    return errorLogger.getLogs(limit);
};

window.clearErrorLogs = function() {
    errorLogger.clearLogs();
};

window.exportErrorLogs = function() {
    errorLogger.exportLogs();
};

window.searchErrorLogs = function(query) {
    return errorLogger.searchLogs(query);
};