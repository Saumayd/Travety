import React, { useEffect, useState } from 'react';
import { AreaReviewItem } from '../data/ncrMetroData';

interface ReviewsViewProps {
  reviews: AreaReviewItem[];
  prefillArea: string;
  onSubmitReview: (
    areaName: string,
    safetyRating: number,
    lightingStatus: AreaReviewItem['lightingStatus'],
    issueFlag: AreaReviewItem['issueFlag'],
    comment: string
  ) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  reviews,
  prefillArea,
  onSubmitReview,
}) => {
  const [areaName, setAreaName] = useState<string>(prefillArea || '');
  const [safetyRating, setSafetyRating] = useState<number>(5);
  const [lightingStatus, setLightingStatus] =
    useState<AreaReviewItem['lightingStatus']>('Well-Lit LED');
  const [issueFlag, setIssueFlag] =
    useState<AreaReviewItem['issueFlag']>('Safe & Verified Corridor');
  const [comment, setComment] = useState<string>('');
  const [submittedBanner, setSubmittedBanner] = useState<boolean>(false);

  useEffect(() => {
    if (prefillArea) {
      setAreaName(prefillArea);
    }
  }, [prefillArea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim() || !comment.trim()) return;
    onSubmitReview(areaName.trim(), safetyRating, lightingStatus, issueFlag, comment.trim());
    setAreaName('');
    setComment('');
    setSubmittedBanner(true);
    setTimeout(() => setSubmittedBanner(false), 2500);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-5 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Area Safety &amp; Lighting Reviews
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Rate campus gates and metro stretches around NSUT and IGDTUW
        </p>
      </div>

      {/* Compact Review Form */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Campus Gate / Metro Stretch
              </label>
              <input
                type="text"
                required
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. NSUT North Gate to Dwarka Mor or IGDTUW Gate 6"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Safety Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSafetyRating(star)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      safetyRating >= star
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Lighting Condition
              </label>
              <select
                value={lightingStatus}
                onChange={(e) =>
                  setLightingStatus(e.target.value as AreaReviewItem['lightingStatus'])
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
              >
                <option value="Well-Lit LED">Well-Lit LED</option>
                <option value="Moderate Lighting">Moderate Lighting</option>
                <option value="Dim / Dark Stretches">Dim / Dark Stretches</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Flag Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    'Safe & Verified Corridor',
                    'Poor Street Lighting',
                    'Unsafe / Isolated Spot',
                    'No Pink Saheli Booth Nearby',
                    'Crowded / High Traffic',
                  ] as AreaReviewItem['issueFlag'][]
                ).map((flagOption) => (
                  <button
                    key={flagOption}
                    type="button"
                    onClick={() => setIssueFlag(flagOption)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                      issueFlag === flagOption
                        ? flagOption.includes('Poor') || flagOption.includes('Unsafe')
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {flagOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Observations
              </label>
              <textarea
                rows={2}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Note street lighting, patrol presence, or stretches to avoid..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="self-start py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display text-xs font-bold transition-colors"
          >
            Save Safety Report to Database
          </button>
        </form>

        {submittedBanner && (
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Safety review saved to database.
          </div>
        )}
      </section>

      {/* Feed */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Squad Reports ({reviews.length})
        </h2>

        {reviews.map((rev) => {
          const isWarning =
            rev.issueFlag === 'Poor Street Lighting' ||
            rev.issueFlag === 'Unsafe / Isolated Spot' ||
            rev.safetyRating <= 2;

          return (
            <article
              key={rev.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {rev.areaName}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`font-bold ${
                      isWarning
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {rev.safetyRating}/5 ★
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-300">{rev.lightingStatus}</span>
                  <span className="text-slate-400">·</span>
                  <span
                    className={`font-semibold ${
                      isWarning
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {rev.issueFlag}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {rev.comment}
              </p>

              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                <span>By {rev.authorName}</span>
                <span>·</span>
                <span>{rev.dateLabel}</span>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
