'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemBoot } from '@/context/SystemBootContext';

const GRUB_MENU_ITEMS = [
  { label: 'Fedora Linux 40 (Portfolio Workstation Edition)', selected: true },
  { label: 'Advanced options for Fedora Linux', selected: false },
  { label: 'Windows Boot Manager', selected: false, joke: true },
];

const KERNEL_MESSAGES = [
  { text: '[    0.000000] Linux version 6.12.0-fedora (nakshatra@portfolio)', delay: 0 },
  { text: '[    0.000012] Command line: BOOT_IMAGE=/vmlinuz-6.8.0', delay: 50 },
  { text: '[    0.004521] x86/cpu: Detected Intel Core i9 processor', delay: 100 },
  { text: '[    0.012847] ACPI: Early table checksum verification enabled', delay: 150 },
  { text: '[    0.045123] Memory: 32768MB available', delay: 200 },
  { text: '[    0.089456] CPU: Physical Processor ID: 0', delay: 250 },
  { text: '[    0.123789] smpboot: Allowing 16 CPUs, 0 hotplug', delay: 300 },
  { text: '[    0.456123] Security Framework initialized', delay: 350 },
  { text: '[    0.567890] cryptd: max_cpu_qlen set to 1000', delay: 400 },
  { text: '[    0.678901] systemd[1]: Detected architecture x86-64', delay: 450 },
  { text: '[    0.789012] systemd[1]: Hostname set to <portfolio-os>', delay: 500 },
  { text: '[    0.890123] systemd[1]: Initializing machine ID from random generator', delay: 550 },
  { text: '[  OK  ] Created slice Slice /system/modprobe', delay: 650, ok: true },
  { text: '[  OK  ] Started Load Kernel Module configfs', delay: 750, ok: true },
  { text: '[  OK  ] Started Load Kernel Module drm', delay: 850, ok: true },
  { text: '[  OK  ] Started Load Kernel Module fuse', delay: 950, ok: true },
  { text: '[  OK  ] Reached target Path Units', delay: 1050, ok: true },
  { text: '[  OK  ] Started Permit User Sessions', delay: 1150, ok: true },
  { text: '[  OK  ] Started GNOME Display Manager', delay: 1250, ok: true },
  { text: '[  OK  ] Reached target Graphical Interface', delay: 1400, ok: true },
  { text: '[  OK  ] Started User Manager for UID 1000', delay: 1550, ok: true },
  { text: '', delay: 1700 }, // Empty line for spacing
  { text: 'Starting Portfolio Desktop Environment...', delay: 1800, highlight: true },
];

export default function GrubBootloader() {
  const { advancePhase } = useSystemBoot();
  const [countdown, setCountdown] = useState(3);
  const [showKernelBoot, setShowKernelBoot] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle countdown
  useEffect(() => {
    if (showKernelBoot) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowKernelBoot(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showKernelBoot]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showKernelBoot) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        setShowKernelBoot(true);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(GRUB_MENU_ITEMS.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKernelBoot]);

  // Kernel boot messages animation
  useEffect(() => {
    if (!showKernelBoot) return;

    KERNEL_MESSAGES.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleMessages(index + 1);
      }, msg.delay);
    });

    // Transition to login after all messages
    // We need to advance twice: GRUB -> KERNEL_BOOT -> LOGIN
    const totalDuration = KERNEL_MESSAGES[KERNEL_MESSAGES.length - 1].delay + 600;
    const transitionTimer = setTimeout(() => {
      advancePhase(); // GRUB -> KERNEL_BOOT
      setTimeout(() => {
        advancePhase(); // KERNEL_BOOT -> LOGIN
      }, 50);
    }, totalDuration);

    return () => clearTimeout(transitionTimer);
  }, [showKernelBoot, advancePhase]);

  // Handle skip click
  const handleSkip = useCallback(() => {
    setShowKernelBoot(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!showKernelBoot ? (
        <motion.div
          key="grub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black flex flex-col font-mono text-sm"
          onClick={handleSkip}
        >
          {/* GRUB Header */}
          <div className="p-4 border-b border-gray-700">
            <pre className="text-gray-400 text-xs leading-tight">
{`                    GNU GRUB  version 2.06

 ┌────────────────────────────────────────────────────────────────────┐`}
            </pre>
          </div>

          {/* Menu Items */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="w-full max-w-2xl border border-gray-600 bg-gray-900/50 rounded">
              <div className="border-b border-gray-700 px-4 py-2">
                <span className="text-gray-400 text-xs">Use the ↑ and ↓ keys to select. Press Enter to boot.</span>
              </div>
              <div className="py-2">
                {GRUB_MENU_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      selectedIndex === index 
                        ? 'bg-gray-200 text-black' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      setSelectedIndex(index);
                      if (index === 0) setShowKernelBoot(true);
                    }}
                  >
                    {selectedIndex === index && <span className="mr-2">*</span>}
                    {item.label}
                    {item.joke && selectedIndex === index && (
                      <span className="ml-2 text-gray-500 text-xs">(just kidding 😄)</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Countdown */}
            <motion.div 
              className="mt-8 text-center"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <p className="text-gray-400">
                The highlighted entry will be executed automatically in {countdown}s...
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Press Enter to boot now, or click anywhere to skip
              </p>
            </motion.div>
          </div>

          {/* GRUB Footer */}
          <div className="p-4 border-t border-gray-700">
            <pre className="text-gray-500 text-xs">
{` └────────────────────────────────────────────────────────────────────┘
      Use the ↑ and ↓ keys to change the selection.
      Press 'e' to edit the selected entry, or 'c' for a command line.`}
            </pre>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="kernel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black overflow-hidden font-mono text-sm p-4"
        >
          <div className="h-full overflow-y-auto custom-scrollbar">
            {KERNEL_MESSAGES.slice(0, visibleMessages).map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
                className={`${
                  msg.ok 
                    ? 'text-gray-300' 
                    : msg.highlight 
                      ? 'text-cyan-400 font-bold' 
                      : 'text-gray-500'
                }`}
              >
                {msg.ok && (
                  <span className="text-green-500">[  OK  ]</span>
                )}
                {msg.text.replace('[  OK  ]', '')}
              </motion.div>
            ))}
            
            {/* Blinking cursor */}
            {visibleMessages > 0 && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-gray-400 ml-1"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
