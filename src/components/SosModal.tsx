import React, { useEffect, useState } from 'react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAlert: () => void;
  lobbyCode: string;
  currentLocationName: string;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  onTriggerAlert,
  lobbyCode,
  currentLocationName,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [alertDispatched, setAlertDispatched] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setAlertDispatched(false);
      return;
    }

    if (alertDispatched) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAlertDispatched(true);
          onTriggerAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, alertDispatched, onTriggerAlert]);

  if (!isOpen) return null;

  const handleImmediateDispatch = () => {
    setAlertDispatched(true);
    setCountdown(0);
    onTriggerAlert();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Emergency SOS Alert
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lobby {lobbyCode} · NSUT &amp; IGDTUW Squad Alert
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close SOS Modal"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {!alertDispatched ? (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-4 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center font-display text-xl font-bold">
              {countdown}s
            </div>
            <p className="text-xs text-rose-950 dark:text-rose-200 font-medium">
              Broadcasting live alert near <strong>{currentLocationName}</strong> to Devika, Vansh,
              Saumay, Rimisha, and Pragya...
            </p>
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImmediateDispatch}
                className="py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Send Alert Now
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-rose-600 text-white p-4 flex flex-col gap-1">
            <div className="font-display text-sm font-bold">SOS Alert Dispatched</div>
            <p className="text-xs text-rose-50">
              Location near <strong>{currentLocationName}</strong> shared with Lobby {lobbyCode}.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 text-xs">
          <a
            href="tel:1091"
            className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Delhi Police Women Helpline (Pink Saheli)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                24/7 Campus &amp; Metro Patrol
              </div>
            </div>
            <span className="font-display text-sm font-bold text-blue-600 dark:text-blue-400">
              1091
            </span>
          </a>

          <a
            href="tel:112"
            className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                National Emergency Response (ERSS)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                PCR Van Dispatch
              </div>
            </div>
            <span className="font-display text-sm font-bold text-rose-600 dark:text-rose-400">
              112
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
