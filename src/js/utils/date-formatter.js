export function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
}

export function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getDayOfWeek(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
}

export function isToday(timestamp) {
    const today = new Date();
    const date = new Date(timestamp * 1000);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
} 