import {
    applyAppearance,
    initializeAppearance,
    readStoredAppearance,
    resolveTheme,
    storeAppearance,
    type Appearance,
    type ResolvedAppearance,
} from '@/lib/appearance';
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

type AppearanceContextValue = {
    appearance: Appearance;
    resolvedAppearance: ResolvedAppearance;
    setAppearance: (mode: Appearance) => void;
    /** Same as setAppearance — matches legansales useAppearance API */
    updateAppearance: (mode: Appearance) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: PropsWithChildren) {
    const [appearance, setAppearanceState] = useState<Appearance>(() =>
        readStoredAppearance(),
    );

    useEffect(() => {
        initializeAppearance();
        setAppearanceState(readStoredAppearance());
    }, []);

    useEffect(() => {
        applyAppearance(appearance);
        storeAppearance(appearance);
    }, [appearance]);

    const setAppearance = useCallback((mode: Appearance) => {
        setAppearanceState(mode);
    }, []);

    const resolvedAppearance = useMemo(
        () => resolveTheme(appearance),
        [appearance],
    );

    const value = useMemo(
        () => ({
            appearance,
            resolvedAppearance,
            setAppearance,
            updateAppearance: setAppearance,
        }),
        [appearance, resolvedAppearance, setAppearance],
    );

    return (
        <AppearanceContext.Provider value={value}>
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance(): AppearanceContextValue {
    const context = useContext(AppearanceContext);

    if (!context) {
        throw new Error('useAppearance must be used within AppearanceProvider');
    }

    return context;
}
