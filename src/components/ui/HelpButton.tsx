'use client';

import { HelpCircle } from 'lucide-react';

interface HelpButtonProps {
    onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
    return (
        <button
            onClick={onClick}
            aria-label="Open product tour"
            className="w-9 h-9 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-ink/5 transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]"
        >
            <HelpCircle size={14} aria-hidden="true" />
        </button>
    );
}
