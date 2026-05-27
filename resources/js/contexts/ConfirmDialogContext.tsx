import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

export type ConfirmOptions = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
};

type PendingConfirm = ConfirmOptions & {
    resolve: (value: boolean) => void;
};

type ConfirmContextValue = {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
    const [pending, setPending] = useState<PendingConfirm | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setPending({ ...options, resolve });
        });
    }, []);

    const close = useCallback((result: boolean) => {
        setPending((current) => {
            current?.resolve(result);

            return null;
        });
    }, []);

    const value = useMemo(() => ({ confirm }), [confirm]);

    const isDanger = pending?.variant === 'danger';

    return (
        <ConfirmDialogContext.Provider value={value}>
            {children}

            <Modal
                show={pending !== null}
                onClose={() => close(false)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <h3 className="text-foreground text-lg font-semibold">
                        {pending?.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {pending?.message}
                    </p>

                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                        <SecondaryButton
                            className="normal-case tracking-normal"
                            onClick={() => close(false)}
                        >
                            {pending?.cancelLabel ?? 'Cancel'}
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={() => close(true)}
                            className={
                                isDanger
                                    ? 'normal-case tracking-normal bg-red-600 text-white hover:opacity-90 focus:ring-red-500'
                                    : 'normal-case tracking-normal'
                            }
                        >
                            {pending?.confirmLabel ?? 'Confirm'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </ConfirmDialogContext.Provider>
    );
}

export function useConfirm(): ConfirmContextValue {
    const context = useContext(ConfirmDialogContext);

    if (context === null) {
        throw new Error('useConfirm must be used within ConfirmDialogProvider');
    }

    return context;
}
