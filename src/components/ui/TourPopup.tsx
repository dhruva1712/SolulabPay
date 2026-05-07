'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Download, Sun, Moon, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TourPopupProps {
    onDismiss: () => void;
    skipHook?: boolean;
}

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

// ────────────────────────────────────────
// SLIDE 1 — Live Mini Card with Tilt
// ────────────────────────────────────────
function MiniCardDemo() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
    };

    const rotateX = isHovered ? (mousePos.y - 0.5) * -16 : 0;
    const rotateY = isHovered ? (mousePos.x - 0.5) * 16 : 0;

    return (
        <div className="relative bg-[#F5EFE6] h-[300px] flex items-center justify-center overflow-hidden">
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                animate={{
                    rotateX,
                    rotateY,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    transformStyle: 'preserve-3d',
                    perspective: 1000,
                }}
                className="relative w-[260px] cursor-pointer"
            >
                <div
                    className="relative overflow-hidden"
                    style={{
                        aspectRatio: '1.586/1',
                        background: 'linear-gradient(135deg, #F5EFE6 0%, #ECE3D2 100%)',
                        boxShadow: '0 8px 24px rgba(28,26,23,0.15)',
                        padding: '16px',
                    }}
                >
                    {/* Holographic shimmer layers */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.8) 0%, transparent 50%)`,
                            opacity: isHovered ? 0.4 : 0,
                            transition: 'opacity 300ms',
                        }}
                    />
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,200,150,0.3) 0%, rgba(150,200,255,0.2) 50%, transparent 70%)`,
                            opacity: isHovered ? 0.6 : 0,
                            transition: 'opacity 300ms',
                        }}
                    />
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.9) 0%, transparent 30%)`,
                            opacity: isHovered ? 0.3 : 0,
                            transition: 'opacity 300ms',
                        }}
                    />

                    {/* Card content */}
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        {/* Top row */}
                        <div className="flex items-start justify-between">
                            <span className="font-sans font-medium text-[8px] tracking-[0.2em] uppercase text-ink">
                                SOLULAB
                            </span>
                            <div
                                className="w-[18px] h-[14px] rounded-[2px]"
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B1 50%, #D4AF37 100%)',
                                }}
                            />
                        </div>

                        {/* Card number */}
                        <div className="font-mono text-[10px] tracking-[0.08em] text-ink">
                            4242 4242 4242 4242
                        </div>

                        {/* Bottom row */}
                        <div className="flex items-end justify-between">
                            <span className="font-sans font-medium text-[8px] tracking-[0.06em] uppercase text-ink">
                                DHRUV SHARMA
                            </span>
                            <span className="font-sans font-semibold text-[8px] tracking-[0.15em] text-ink">
                                VISA
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Hint */}
            <AnimatePresence>
                {!isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute bottom-4 font-mono text-[9px] tracking-[0.15em] uppercase text-ink-subtle"
                    >
                        hover me
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ────────────────────────────────────────
// SLIDE 2 — Phone Animation Loop
// ────────────────────────────────────────
function PhoneDemo() {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        const runSequence = () => {
            setPhase(0);
            timers.push(setTimeout(() => setPhase(1), 1500));
            timers.push(setTimeout(() => setPhase(2), 2000));
            timers.push(setTimeout(() => setPhase(3), 3500));
            timers.push(setTimeout(() => runSequence(), 4000));
        };

        runSequence();

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="relative bg-[#FAF8F4] h-[300px] flex flex-col items-center justify-center overflow-hidden gap-3">
            {/* Phone frame */}
            <div
                className="relative overflow-hidden"
                style={{
                    width: '100px',
                    height: '180px',
                    border: '2px solid #D6CDBE',
                    borderRadius: '16px',
                    background: '#FFFFFF',
                    padding: '8px',
                }}
            >
                <AnimatePresence mode="wait">
                    {/* Phase 0-1: Form lines */}
                    {(phase === 0 || phase === 1) && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: phase === 1 ? 0 : 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-2 pt-4"
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0 }}
                                className="h-[6px] bg-[#E8E2D8] rounded-[2px]"
                                style={{ width: '80%' }}
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="h-[6px] bg-[#E8E2D8] rounded-[2px]"
                                style={{ width: '60%' }}
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="h-[6px] bg-[#E8E2D8] rounded-[2px]"
                                style={{ width: '70%' }}
                            />
                        </motion.div>
                    )}

                    {/* Phase 2-3: Card reveal */}
                    {(phase === 2 || phase === 3) && (
                        <motion.div
                            key="card"
                            initial={{ scale: 0.3, rotateY: -90, rotateZ: -15, opacity: 0 }}
                            animate={{ scale: 1, rotateY: 0, rotateZ: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div
                                className="rounded-[4px] p-2 flex flex-col justify-between"
                                style={{
                                    width: '70px',
                                    height: '44px',
                                    background: 'linear-gradient(135deg, #F5EFE6 0%, #ECE3D2 100%)',
                                    boxShadow: '0 2px 8px rgba(28,26,23,0.15)',
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-sans text-[4px] tracking-wider uppercase text-ink">
                                        SOLULAB
                                    </span>
                                    <div
                                        className="w-[8px] h-[6px] rounded-[1px]"
                                        style={{
                                            background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B1 50%, #D4AF37 100%)',
                                        }}
                                    />
                                </div>
                                <div className="font-mono text-[4px] text-ink">4242 4242 4242 4242</div>
                                <div className="flex justify-between items-end">
                                    <span className="font-sans text-[4px] uppercase text-ink">DHRUV</span>
                                    <span className="font-sans text-[4px] font-semibold text-ink">VISA</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Label */}
            <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink-subtle flex items-center gap-1">
                <span>↺</span>
                <span>loops automatically</span>
            </div>
        </div>
    );
}

// ────────────────────────────────────────
// SLIDE 3 — Dark Mode Toggle Demo
// ────────────────────────────────────────
function DarkModeDemo() {
    const [miniDark, setMiniDark] = useState(false);

    return (
        <div
            className="relative h-[300px] flex flex-col items-center justify-center overflow-hidden gap-3 transition-all duration-300 ease-in-out"
            style={{
                background: miniDark ? '#111010' : '#FAF8F4',
            }}
        >
            {/* Mini UI mockup */}
            <div
                className="rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 ease-in-out"
                style={{
                    width: '200px',
                    height: '120px',
                    background: miniDark ? '#1A1917' : '#FFFFFF',
                    border: `1px solid ${miniDark ? '#2A2824' : '#E8E2D8'}`,
                }}
            >
                {/* Brand mark */}
                <div className="flex items-center gap-2">
                    <div
                        className="w-[5px] h-[5px] rounded-[1px] transition-all duration-300"
                        style={{
                            background: miniDark ? '#D4AF37' : '#1C1A17',
                        }}
                    />
                    <span
                        className="font-sans text-[7px] tracking-wider uppercase transition-colors duration-300"
                        style={{
                            color: miniDark ? '#E8E2D8' : '#1C1A17',
                        }}
                    >
                        SOLULAB
                    </span>
                </div>

                {/* Simulated text lines */}
                <div className="flex flex-col gap-1.5">
                    <div
                        className="h-[4px] rounded-full transition-all duration-300"
                        style={{
                            width: '70%',
                            background: miniDark ? '#3A3834' : '#E8E2D8',
                        }}
                    />
                    <div
                        className="h-[4px] rounded-full transition-all duration-300"
                        style={{
                            width: '50%',
                            background: miniDark ? '#3A3834' : '#E8E2D8',
                        }}
                    />
                </div>

                {/* Toggle button */}
                <div className="flex-1 flex items-end justify-end">
                    <button
                        onClick={() => setMiniDark(!miniDark)}
                        className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110"
                        style={{
                            background: miniDark ? '#2A2824' : '#F5EFE6',
                            color: miniDark ? '#E8E2D8' : '#1C1A17',
                        }}
                        aria-label="Toggle theme"
                    >
                        {miniDark ? <Sun size={12} /> : <Moon size={12} />}
                    </button>
                </div>
            </div>

            {/* Label */}
            <div
                className="font-mono text-[9px] uppercase tracking-[0.12em] transition-colors duration-300"
                style={{
                    color: miniDark ? '#8A8580' : '#6B6560',
                }}
            >
                try it ↑
            </div>
        </div>
    );
}

// ────────────────────────────────────────
// SLIDE 4 — Receipt Download Animation
// ────────────────────────────────────────
function ReceiptDemo() {
    return (
        <div className="relative bg-[#FAF8F4] h-[300px] flex flex-col items-center justify-center overflow-hidden gap-3">
            {/* Mini receipt */}
            <div
                className="bg-white border border-[#E8E2D8] p-3 flex flex-col gap-2"
                style={{
                    width: '140px',
                    height: '180px',
                    boxShadow: '0 4px 16px rgba(28,26,23,0.08)',
                }}
            >
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <span className="font-sans text-[7px] tracking-wider uppercase text-ink">SOLULAB</span>
                    <span className="font-mono text-[6px] tracking-[0.15em] uppercase text-ink-muted">
                        PAYMENT RECEIPT
                    </span>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-border" />

                {/* Amount */}
                <div className="flex-1 flex items-center justify-center">
                    <span className="font-sans font-light text-[18px] text-ink">₹ 24,500</span>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1">
                    <div className="h-[3px] bg-[#E8E2D8] rounded-full" style={{ width: '80%' }} />
                    <div className="h-[3px] bg-[#E8E2D8] rounded-full" style={{ width: '60%' }} />
                    <div className="h-[3px] bg-[#E8E2D8] rounded-full" style={{ width: '70%' }} />
                </div>

                {/* Filename */}
                <div className="font-mono text-[5px] text-ink-muted text-center">
                    solulab-receipt-a3f7b2c1.pdf
                </div>
            </div>

            {/* Download icon */}
            <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
                className="text-accent"
            >
                <Download size={20} />
            </motion.div>

            {/* Filename label */}
            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="font-mono text-[9px] tracking-[0.1em] text-ink-muted"
            >
                solulab-receipt-a3f7b2c1.pdf
            </motion.div>
        </div>
    );
}

// ────────────────────────────────────────
// HOOK PHASE — Animated Card Demo
// ────────────────────────────────────────
function HookCardDemo() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
    };

    const rotateX = isHovered ? (mousePos.y - 0.5) * -16 : 0;
    const rotateY = isHovered ? (mousePos.x - 0.5) * 16 : 0;

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            animate={{
                rotateX: isHovered ? rotateX : [0, -3, 0, 3, 0],
                rotateY: isHovered ? rotateY : [0, 6, 0, -6, 0],
            }}
            transition={
                isHovered
                    ? { type: 'spring', stiffness: 300, damping: 30 }
                    : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
            className="relative w-[260px] cursor-pointer"
        >
            <div
                className="relative overflow-hidden"
                style={{
                    aspectRatio: '1.586/1',
                    background: 'linear-gradient(135deg, #F5EFE6 0%, #ECE3D2 100%)',
                    boxShadow: '0 8px 24px rgba(28,26,23,0.15)',
                    padding: '16px',
                }}
            >
                {/* Holographic shimmer layers — always visible, animated */}
                {!isHovered ? (
                    <>
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            animate={{
                                backgroundPosition: ['30% 30%', '70% 70%', '30% 30%'],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 50%)',
                                backgroundSize: '200% 200%',
                                opacity: 0.5,
                            }}
                        />
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            animate={{
                                backgroundPosition: ['30% 30%', '70% 70%', '30% 30%'],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle, rgba(255,200,150,0.3) 0%, rgba(150,200,255,0.2) 50%, transparent 70%)',
                                backgroundSize: '200% 200%',
                                opacity: 0.5,
                            }}
                        />
                    </>
                ) : (
                    <>
                        <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                            style={{
                                backgroundImage: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.8) 0%, transparent 50%)`,
                                opacity: 0.5,
                            }}
                        />
                        <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                            style={{
                                backgroundImage: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,200,150,0.3) 0%, rgba(150,200,255,0.2) 50%, transparent 70%)`,
                                opacity: 0.5,
                            }}
                        />
                    </>
                )}

                {/* Card content */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                        <span className="font-sans font-medium text-[8px] tracking-[0.2em] uppercase text-ink">
                            SOLULAB
                        </span>
                        <div
                            className="w-[18px] h-[14px] rounded-[2px]"
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B1 50%, #D4AF37 100%)',
                            }}
                        />
                    </div>

                    {/* Card number */}
                    <div className="font-mono text-[10px] tracking-[0.08em] text-ink">
                        4242 4242 4242 4242
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-end justify-between">
                        <span className="font-sans font-medium text-[8px] tracking-[0.06em] uppercase text-ink">
                            DHRUV SHARMA
                        </span>
                        <span className="font-sans font-semibold text-[8px] tracking-[0.15em] text-ink">
                            VISA
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────
export function TourPopup({ onDismiss, skipHook }: TourPopupProps) {
    const [phase, setPhase] = useState<'hook' | 'tour' | 'dismissed'>(skipHook ? 'tour' : 'hook');
    const [slideIndex, setSlideIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [countdown, setCountdown] = useState(3);

    const slides = [
        {
            id: 'card',
            eyebrow: 'The card preview',
            title: 'It moves with your cursor.',
            body: 'Tilt. Shimmer. Flip. Hover the card above — it responds like a real one.',
            demo: <MiniCardDemo />,
        },
        {
            id: 'mobile',
            eyebrow: 'On mobile',
            title: 'Fill the form. Watch what happens.',
            body: 'The card hides while you type. Hit Pay — it flies in like you just pulled it from your wallet.',
            demo: <PhoneDemo />,
        },
        {
            id: 'darkmode',
            eyebrow: 'Dark mode',
            title: 'Click the moon. Watch it happen.',
            body: 'Not a class toggle — a circle expands from the click point outward. The header toggle does the same thing.',
            demo: <DarkModeDemo />,
        },
        {
            id: 'receipt',
            eyebrow: 'After payment',
            title: 'A real receipt. Zero print dialogs.',
            body: 'Every transaction generates a PDF. Named, formatted, downloaded directly to your device.',
            demo: <ReceiptDemo />,
        },
    ];

    const currentSlide = slides[slideIndex];
    const isLast = slideIndex === slides.length - 1;

    // Countdown effect for dismissed phase
    useEffect(() => {
        if (phase !== 'dismissed') return;
        setCountdown(3);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onDismiss();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [phase, onDismiss]);

    return (
        <AnimatePresence>
            <>
                {/* Backdrop — NO onClick */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[60] bg-ink/20 backdrop-blur-[2px]"
                    aria-hidden="true"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                    className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] sm:w-full sm:max-w-[480px] min-h-[520px] max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-[0_24px_64px_rgba(28,26,23,0.16)]"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Product tour"
                >
                    {/* Close button — floats above everything */}
                    {phase === 'tour' && (
                        <button
                            onClick={onDismiss}
                            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-ink/5 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]"
                            aria-label="Close tour"
                        >
                            <X size={14} />
                        </button>
                    )}

                    <AnimatePresence mode="wait">
                        {phase === 'hook' && (
                            <motion.div
                                key="hook"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-col min-h-[520px]"
                            >
                                {/* TOP SECTION — Visual hero with animated card */}
                                <div className="relative h-[300px] w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5EFE6] to-[#ECE3D2]">
                                    <HookCardDemo />
                                    
                                    {/* Hint label */}
                                    <div className="absolute bottom-4 font-mono text-[9px] tracking-[0.15em] uppercase text-[rgba(28,26,23,0.4)]">
                                        hover me on desktop ✦
                                    </div>
                                </div>

                                {/* BOTTOM SECTION — Text + buttons */}
                                <div className="bg-surface px-8 py-7 flex-1 flex flex-col justify-between">
                                    <div className="flex flex-col">
                                        {/* Eyebrow */}
                                        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-muted mb-5">
                                            Hey, reviewer 👋
                                        </p>

                                        {/* Heading */}
                                        <h2 className="font-serif italic text-[26px] leading-[1.2] tracking-[-0.01em] text-ink mb-3">
                                            Fifty tabs open. Make this one count.
                                        </h2>

                                        {/* Body */}
                                        <p className="font-sans text-[13px] text-ink-muted leading-relaxed mb-7">
                                            This one does a few things you won't see in other submissions. Takes 30 seconds.
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => setPhase('tour')}
                                                className="h-11 w-full px-6 bg-accent text-white font-sans font-medium text-[13px] tracking-[0.04em] rounded-sm hover:bg-accent-hover transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)] flex items-center justify-center gap-2"
                                            >
                                                Show me →
                                            </button>
                                            <button
                                                onClick={() => setPhase('dismissed')}
                                                className="h-11 w-full px-6 bg-transparent text-ink-muted font-sans text-[13px] rounded-sm border border-border hover:text-ink hover:border-border-strong transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]"
                                            >
                                                I'll explore myself
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {phase === 'tour' && (
                            <motion.div
                                key="tour"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-col min-h-[520px]"
                            >
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={currentSlide.id}
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                                        className="flex flex-col min-h-[520px]"
                                    >
                                        {/* Visual demo area */}
                                        <div className="h-[300px]">
                                            {currentSlide.demo}
                                        </div>

                                        {/* Text + navigation section */}
                                        <div className="bg-surface px-8 py-6 flex-1 flex flex-col justify-between">
                                            {/* Text */}
                                            <div>
                                                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-muted mb-2">
                                                    {currentSlide.eyebrow}
                                                </p>
                                                <h3 className="font-serif italic text-[22px] tracking-[-0.015em] text-ink mb-2 leading-[1.2]">
                                                    {currentSlide.title}
                                                </h3>
                                                <p className="font-sans text-[14px] text-ink-muted leading-relaxed">
                                                    {currentSlide.body}
                                                </p>
                                            </div>

                                            {/* Progress dots + next button */}
                                            <div className="flex items-center justify-between">
                                                {/* Dots */}
                                                <div className="flex items-center gap-2">
                                                    {slides.map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                setDirection(i > slideIndex ? 1 : -1);
                                                                setSlideIndex(i);
                                                            }}
                                                            aria-label={`Go to slide ${i + 1}`}
                                                            className={cn(
                                                                'rounded-full transition-all duration-300 cursor-pointer',
                                                                i === slideIndex
                                                                    ? 'w-5 h-1.5 bg-accent'
                                                                    : 'w-1.5 h-1.5 bg-border-strong hover:bg-ink-subtle'
                                                            )}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Next / finish button */}
                                                <button
                                                    onClick={() => {
                                                        if (isLast) {
                                                            onDismiss();
                                                        } else {
                                                            setDirection(1);
                                                            setSlideIndex((i) => i + 1);
                                                        }
                                                    }}
                                                    className="h-9 px-5 bg-accent text-white font-sans font-medium text-[12px] tracking-[0.06em] rounded-sm hover:bg-accent-hover transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--focus-ring)] flex items-center gap-2"
                                                >
                                                    {isLast ? "Let's go" : 'Next'}
                                                    <ChevronRight size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {phase === 'dismissed' && (
                            <motion.div
                                key="dismissed"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                                className="flex flex-col justify-center min-h-[520px] p-8 items-center text-center gap-6"
                            >
                                {/* Animated countdown ring */}
                                <div className="relative w-14 h-14 flex items-center justify-center">
                                    <svg
                                        width="56"
                                        height="56"
                                        viewBox="0 0 56 56"
                                        className="absolute inset-0 -rotate-90"
                                        aria-hidden="true"
                                    >
                                        {/* Track */}
                                        <circle
                                            cx="28"
                                            cy="28"
                                            r="24"
                                            fill="none"
                                            stroke="var(--border)"
                                            strokeWidth="1.5"
                                        />
                                        {/* Animated fill — drains over 3 seconds */}
                                        <motion.circle
                                            cx="28"
                                            cy="28"
                                            r="24"
                                            fill="none"
                                            stroke="var(--accent)"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 24}`}
                                            initial={{ strokeDashoffset: 0 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 24 }}
                                            transition={{ duration: 3, ease: 'linear' }}
                                        />
                                    </svg>
                                    {/* Countdown number */}
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={countdown}
                                            initial={{ opacity: 0, scale: 0.7 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.7 }}
                                            transition={{ duration: 0.15 }}
                                            className="font-mono text-[20px] text-ink relative z-10"
                                        >
                                            {countdown}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>

                                {/* Message */}
                                <div className="flex flex-col gap-3">
                                    <h3 className="font-serif italic text-[24px] tracking-[-0.01em] text-ink leading-[1.2]">
                                        All good. Explore freely.
                                    </h3>
                                    <p className="font-sans text-[13px] text-ink-muted leading-relaxed max-w-[280px] mx-auto">
                                        If you want a guided tour later, hit the{' '}
                                        <HelpCircle
                                            size={12}
                                            className="inline-block text-accent mx-0.5 mb-0.5"
                                            aria-hidden="true"
                                        />{' '}
                                        <span className="font-mono text-[11px] tracking-[0.08em] text-accent">guide</span>{' '}
                                        in the header — it shows what makes this one different.
                                    </p>
                                </div>

                                {/* Closing hint */}
                                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-subtle">
                                    Closing in {countdown}s
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </>
        </AnimatePresence>
    );
}
