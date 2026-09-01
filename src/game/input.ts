const keys = new Set<string>();
const injected = new Set<string>();

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function onDown(e: KeyboardEvent) {
  if (isTypingTarget(e.target)) return;
  keys.add(e.code);
}

function onUp(e: KeyboardEvent) {
  keys.delete(e.code);
}

function onBlur() {
  keys.clear();
}

let bound = false;

export function bindInput() {
  if (bound || typeof window === "undefined") return () => {};
  bound = true;
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onBlur);
  return () => {
    bound = false;
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onBlur);
    keys.clear();
  };
}

export function held(code: string) {
  return keys.has(code) || injected.has(code);
}

export function setInjectedKeys(codes: string[]) {
  injected.clear();
  for (const c of codes) injected.add(c);
}

export function isTyping(target: EventTarget | null) {
  return isTypingTarget(target);
}
