import { useState, type ReactNode } from 'react';

type MobileTab = 'edit' | 'preview';

type Props = {
    form: ReactNode;
    preview: ReactNode;
    actions: ReactNode;
    previewLabel?: string;
    editTabLabel?: string;
    previewTabLabel?: string;
};

export default function InvoiceEditorLayout({
    form,
    preview,
    actions,
    previewLabel = 'Live PDF preview',
    editTabLabel = 'Edit invoice',
    previewTabLabel = 'Preview PDF',
}: Props) {
    const [tab, setTab] = useState<MobileTab>('edit');

    return (
        <div className="relative pb-28 lg:pb-0">
            <div
                className="mb-4 flex gap-1 rounded-lg border border-border bg-muted p-1 lg:hidden"
                role="tablist"
                aria-label="Invoice editor"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'edit'}
                    className={
                        tab === 'edit' ? 'flex-1 rounded-md bg-card px-3 py-2.5 text-center text-sm font-semibold text-foreground shadow-sm' : 'flex-1 rounded-md px-3 py-2.5 text-center text-sm font-semibold text-muted-foreground transition hover:text-foreground'
                    }
                    onClick={() => setTab('edit')}
                >
                    {editTabLabel}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'preview'}
                    className={
                        tab === 'preview'
                            ? 'flex-1 rounded-md bg-card px-3 py-2.5 text-center text-sm font-semibold text-foreground shadow-sm'
                            : 'flex-1 rounded-md px-3 py-2.5 text-center text-sm font-semibold text-muted-foreground transition hover:text-foreground'
                    }
                    onClick={() => setTab('preview')}
                >
                    {previewTabLabel}
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div
                    className={
                        tab === 'preview'
                            ? 'hidden lg:block'
                            : 'min-w-0'
                    }
                >
                    <div className="space-y-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
                        <div className="hidden flex-wrap gap-2 lg:flex">
                            {actions}
                        </div>
                        {form}
                    </div>
                </div>

                <div
                    className={
                        tab === 'edit' ? 'hidden min-w-0 lg:block' : 'min-w-0'
                    }
                >
                    <p className="text-foreground mb-2 text-sm font-medium">
                        {previewLabel}
                    </p>
                    <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:self-start">
                        {preview}
                    </div>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-3 py-3 shadow-lg backdrop-blur-sm lg:hidden">
                <div className="mx-auto flex max-w-lg flex-col gap-2">
                    {actions}
                </div>
            </div>
        </div>
    );
}
