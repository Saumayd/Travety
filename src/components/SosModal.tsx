import React, { useEffect, useState } from 'react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAlert: () => void;
  lobbyCode: string;
  currentStationName: string;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  onTriggerAlert,
  lobbyCode,
  currentStationName,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-margin bg-surface-container-lowest/90 backdrop-blur-xl">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-high p-space-md shadow-[0_0_40px_rgba(255,74,142,0.45)] flex flex-col gap-space-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary-container/20 blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(255,74,142,0.5)]">
              <span className="material-symbols-outlined text-[22px] font-bold">fmd_bad</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Emergency SOS Shield
              </span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                Lobby {lobbyCode} • Live NCR Beacon
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close SOS Modal"
            className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Countdown or Dispatched State */}
        {!alertDispatched ? (
          <div className="rounded-xl bg-surface-container p-space-md flex flex-col items-center text-center gap-space-sm">
            <div className="w-20 h-20 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center font-headline-xl-mobile text-headline-xl-mobile font-bold shadow-[0_0_24px_rgba(255,74,142,0.35)]">
              {countdown}s
            </div>
            <p className="font-body-md text-body-md text-on-surface font-medium">
              Broadcasting live GPS distress coordinates to all squad members &amp; nearest Pink Saheli desk...
            </p>
            <div className="w-full grid grid-cols-2 gap-space-xs mt-1">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] rounded-xl bg-surface-container-highest text-on-surface font-label-md text-label-md font-bold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Cancel Alert</span>
              </button>
              <button
                type="button"
                onClick={handleImmediateDispatch}
                className="min-h-[46px] rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(255,74,142,0.45)]"
              >
                <span className="material-symbols-outlined text-[18px]">sensors</span>
                <span>Send Now</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-error-container/80 text-on-error-container p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[22px]">verified_user</span>
              <span className="font-label-lg text-label-lg font-bold uppercase tracking-wide">
                Distress Beacon Active
              </span>
            </div>
            <p className="font-body-sm text-body-sm leading-snug">
              Live telemetry near <strong>{currentStationName}</strong> locked and shared with Ananya S., Priya R., Rohan M., Tanvi K., and Kabir.
            </p>
          </div>
        )}

        {/* Direct Rapid Response Helplines */}
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Direct NCR Rapid Response Lines
          </span>
          <a
            href="tel:1091"
            className="rounded-xl bg-surface-container p-3 flex items-center justify-between hover:bg-surface-bright transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Delhi Police Women Helpline
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                  Pink Patrol Saheli Escort Desk
                </span>
              </div>
            </div>
            <span className="font-label-lg text-label-lg text-secondary font-bold">1091</span>
          </a>

          <a
            href="tel:155370"
            className="rounded-xl bg-surface-container p-3 flex items-center justify-between hover:bg-surface-bright transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary-container/25 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">local_police</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  CISF DMRC 24/7 Control Room
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                  Immediate platform &amp; gate QRT dispatch
                </span>
              </div>
            </div>
            <span className="font-label-lg text-label-lg text-primary font-bold">155370</span>
          </a>

          <a
            href="tel:112"
            className="rounded-xl bg-surface-container p-3 flex items-center justify-between hover:bg-surface-bright transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  National Emergency Response (ERSS)
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                  PCR van GPS dispatch across NCR
                </span>
              </div>
            </div>
            <span className="font-label-lg text-label-lg text-tertiary font-bold">112</span>
          </a>
        </div>
      </div>
    </div>
  );
};
