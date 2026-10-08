import { t, useLanguage } from '../i18n';
import React, { useState } from 'react';
import { FEISHU_LOGO_URLS } from '../utils/feishu';

export const FeishuLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  useLanguage();
  const [sourceIndex, setSourceIndex] = useState(0);

  if (sourceIndex >= FEISHU_LOGO_URLS.length) {
    return <span aria-label={t("飞书")} className={`${className} flex shrink-0 items-center justify-center bg-[#3370ff] text-[10px] font-bold text-white`}>{t("飞")}</span>;
  }
  return <img src={FEISHU_LOGO_URLS[sourceIndex]} alt={t("飞书")} className={`${className} shrink-0 object-contain pointer-events-none`}
    referrerPolicy="no-referrer" onError={() => setSourceIndex((index) => index + 1)} />;
};
