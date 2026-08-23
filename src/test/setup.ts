import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", { writable: true, value: (query: string) => ({ matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined, addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false }) });
Object.defineProperty(window, "scrollTo", { writable: true, value: () => undefined });

Object.defineProperty(window, "speechSynthesis", { writable: true, value: { cancel: () => undefined, speak: () => undefined, getVoices: () => [] } });

window.HTMLElement.prototype.scrollIntoView = function() {};
