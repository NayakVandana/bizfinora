import { appearanceOptions, type Appearance } from '@/lib/appearance';
import { useAppearance } from '@/contexts/AppearanceContext';
import type { HTMLAttributes, SVGProps } from 'react';

function SunIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            {...props}
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
    );
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            {...props}
        >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    );
}

function MonitorIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            {...props}
        >
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </svg>
    );
}

const tabIcons: Record<Appearance, typeof SunIcon> = {
    light: SunIcon,
    dark: MoonIcon,
    system: MonitorIcon,
};

type Props = HTMLAttributes<HTMLDivElement>;

export default function AppearanceTabs({ className = '', ...props }: Props) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className={className} {...props}>
            <p className="text-sm font-medium text-foreground">Appearance</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Update your account&apos;s appearance settings.
            </p>
            <div
                className="mt-3 inline-flex gap-1 rounded-lg bg-muted p-1"
                role="group"
                aria-label="Appearance settings"
            >
                {appearanceOptions.map(({ value, label }) => {
                    const selected = appearance === value;
                    const Icon = tabIcons[value];

                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => updateAppearance(value)}
                            className={
                                'flex items-center rounded-md px-3.5 py-1.5 transition-colors ' +
                                (selected
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground')
                            }
                            aria-pressed={selected}
                        >
                            <Icon className="-ml-1 h-4 w-4" />
                            <span className="ml-1.5 text-sm">{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
