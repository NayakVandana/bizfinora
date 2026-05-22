export type Appearance = 'light' | 'dark' | 'system';

export type ResolvedAppearance = 'light' | 'dark';

export const APPEARANCE_STORAGE_KEY = 'appearance';

export const appearanceOptions: {
    value: Appearance;
    label: string;
}[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
];

export function isAppearance(value: string | null): value is Appearance {
    return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredAppearance(): Appearance {
    if (typeof window === 'undefined') {
        return 'system';
    }

    const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);

    return isAppearance(stored) ? stored : 'system';
}

export function isDarkMode(appearance: Appearance): boolean {
    if (appearance === 'dark') {
        return true;
    }

    if (appearance === 'light') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(appearance: Appearance): ResolvedAppearance {
    return isDarkMode(appearance) ? 'dark' : 'light';
}

export function applyAppearance(appearance: Appearance): void {
    if (typeof document === 'undefined') {
        return;
    }

    const resolved = resolveTheme(appearance);
    const isDark = resolved === 'dark';

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = resolved;
    document.documentElement.setAttribute('data-appearance', resolved);
}

export function storeAppearance(appearance: Appearance): void {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
}

export function initializeAppearance(): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (!localStorage.getItem(APPEARANCE_STORAGE_KEY)) {
        storeAppearance('system');
    }

    applyAppearance(readStoredAppearance());

    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
            if (readStoredAppearance() === 'system') {
                applyAppearance('system');
            }
        });
}
