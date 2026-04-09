import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Skeleton } from "@/components/ui/skeleton";

interface Breakdown {
  image?: number;
  video?: number;
  audio?: number;
  document?: number;
  text?: number;
  other?: number;
}

interface CapacityData {
  used: number; // GB
  total: number; // GB
  breakdown: Breakdown;
}

const COLORS: Record<string, string> = {
  image: '#3b82f6', // blue-500
  video: '#ef4444', // red-500
  audio: '#8b5cf6', // violet-500
  document: '#eab308', // yellow-500
  text: '#10b981', // emerald-500
  other: '#6b7280', // gray-500
};

export default function StorageUsageBar() {
  const { t } = useTranslation();
  const [data, setData] = useState<CapacityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sprawdzamy cache lokalny na szybko
    const cached = localStorage.getItem('storage_capacity_detailed');
    if (cached) setData(JSON.parse(cached));

    axios.get('/getStorageCapacity')
      .then(res => {
        setData(res.data);
        localStorage.setItem('storage_capacity_detailed', JSON.stringify(res.data));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return <Skeleton className="w-full h-32 rounded-xl mb-6" />;
  }

  if (!data) return null;

  const totalBytes = data.total * 1024 * 1024 * 1024;
  
  // Przeliczanie frakcji
  const segments = Object.entries(data.breakdown || {}).map(([type, megabytes]) => {
    // Megabajty -> bajty
    const bytes = megabytes * 1024 * 1024;
    return {
      type,
      megabytes,
      percentage: Math.min((bytes / totalBytes) * 100, 100)
    };
  }).filter(s => s.percentage > 0);

  const usedPercentage = Math.min((data.used / data.total) * 100, 100);

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 font-sans">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{t('storage_dashboard.title')}</h3>
          <p className="text-sm text-neutral-500">{t('storage_dashboard.usedOf', { used: data.used, total: data.total })}</p>
        </div>
        <div className="text-sm font-medium text-neutral-500">
          {t('storage_dashboard.freePercent', { percent: (100 - usedPercentage).toFixed(1) })}
        </div>
      </div>

      <div className="relative w-full h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex ring-1 ring-inset ring-black/5 dark:ring-white/5">
        {segments.map((segment, idx) => (
          <motion.div
            key={idx}
            initial={{ width: 0 }}
            animate={{ width: `${segment.percentage}%` }}
            transition={{ duration: 1, delay: idx * 0.1, ease: 'easeOut' }}
            className="h-full group relative cursor-pointer"
            style={{ backgroundColor: COLORS[segment.type] || COLORS.other }}
            title={`${segment.type}: ${segment.megabytes} MB`}
          >
            {/* Tooltip on hover */}
             <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded transition whitespace-nowrap z-10 pointer-events-none shadow-xl border border-neutral-700">
                {segment.type}: {segment.megabytes} MB
             </div>
          </motion.div>
        ))}
      </div>

      <div className="flex w-full mt-4 flex-wrap gap-4 text-sm whitespace-nowrap">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: COLORS[segment.type] || COLORS.other }} />
            <span className="capitalize text-neutral-600 dark:text-neutral-300 font-medium">
              {t(`storage_dashboard.type.${segment.type}`, { defaultValue: segment.type })}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-3 h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 shadow-inner ring-1 ring-inset ring-neutral-200 dark:ring-neutral-700" />
          <span className="text-neutral-500 dark:text-neutral-400 capitalize">{t('storage_dashboard.type.free')}</span>
        </div>
      </div>
    </div>
  );
}
