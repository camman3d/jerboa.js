/*
 Event Methods
 ---------------------------
 */

let listeners = {};

export function emit(event, payload) {
    if (listeners[event]) {
        listeners[event].forEach(l => l(payload));
    }
}

export function addEventListener(event, handler) {
    if (!listeners[event]) {
        listeners[event] = [];
    }
    listeners[event].push(handler);
}