import React from 'react';
import { AppMode, PastOuting } from '../data/ncrMetroData';

interface PastOutingsViewProps {
  outings: PastOuting[];
  onRehostOuting: (title: string, mode: AppMode) => void;
  onRateOutingArea: (areaName: string) => void;
}

export const PastOutingsView: React.FC<PastOutingsViewProps> = ({
  outings,
  onRehostOuting,
  onRateOutingArea,
}) => {
  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-5 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Past Squad Outings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          NSUT &amp; IGDTUW hangout archive for Devika, Vansh, Saumay, Rimisha, and Pragya
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {outings.map((outing) => (
          <article
            key={outing.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{outing.date}</span>
                  <span>·</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {outing.mode === 'safe' ? 'Safe Case' : 'Best Fun Case'}
                  </span>
                  <span>·</span>
                  <span>{outing.area}</span>
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {outing.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">{outing.venue}</p>
              </div>

              <div className="flex items-center gap-4 text-xs self-start sm:self-auto">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Avg Spend</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{outing.avgSpend}/person
                  </span>
                </div>
                <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block">Safety</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {outing.safetyScore}% Verified
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {outing.summary}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Squad:</span>{' '}
                {outing.participants.join(', ')}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRateOutingArea(`${outing.venue} (${outing.area})`)}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  Rate Area
                </button>
                <button
                  type="button"
                  onClick={() => onRehostOuting(outing.title, outing.mode)}
                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                >
                  Plan Again
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
