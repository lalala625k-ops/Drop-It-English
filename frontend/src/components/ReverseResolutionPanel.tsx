import { t, useLanguage } from '../i18n';
import React, { useState } from 'react';
import { Card, Viewport } from '../types';
import { ReverseResolution } from '../utils/recognizeCardImage';
import { manualSearchFallback } from '../utils/manualSearch';

const stageLabels: Record<string, string> = {
  get explicit() { return t("明确链接或编号"); }, get vision() { return t("AI 提取"); }, get site_search() { return t("站内搜索"); },
  get domain_search() { return t("域名定向搜索"); }, get verification() { return t("候选核验"); },
};
const statusLabels: Record<string, string> = {
  get matched() { return t("已命中"); }, get completed() { return t("已完成"); }, get candidates() { return t("待确认"); }, get no_results() { return t("未命中"); },
  get failed() { return t("失败"); }, get blocked() { return t("被网站拦截"); }, get timeout() { return t("超时"); }, get not_configured() { return t("未配置"); },
  get unauthorized() { return t("无权限"); }, get rate_limited() { return t("被限流"); }, get invalid_response() { return t("结果无效"); },
  get unsupported() { return t("暂不支持"); }, get unavailable() { return t("站内搜索不可用"); }, get missing_title() { return t("缺少标题"); },
  get skipped() { return t("已跳过"); },
};

interface Props {
  card: Card;
  viewport: Viewport;
  resolution: ReverseResolution;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

export const ReverseResolutionPanel: React.FC<Props> = ({
  card, viewport, resolution, onClose, onConfirm,
}) => {
  useLanguage();
  const [manualUrl, setManualUrl] = useState('');
  const manualSearch = resolution.clues?.title && resolution.manual_search?.query !== resolution.clues.title
    ? manualSearchFallback(resolution.clues, '')
    : resolution.manual_search || manualSearchFallback(resolution.clues, '');
  const width = 360;
  const cardLeft = viewport.x + card.x * viewport.zoom;
  const cardRight = cardLeft + card.width * viewport.zoom;
  const preferredLeft = cardRight + 12;
  const left = preferredLeft + width <= window.innerWidth - 12
    ? Math.max(12, preferredLeft) : Math.max(12, cardLeft - width - 12);
  const top = Math.min(Math.max(12, viewport.y + card.y * viewport.zoom),
    Math.max(12, window.innerHeight - 390));

  return (
    <aside role="region" aria-label={t("图片溯源结果")}
      className="fixed z-[110] w-[360px] max-h-[min(70vh,540px)] overflow-y-auto border border-ink bg-paper p-4 text-ink shadow-2xl"
      style={{ left, top }}
      onMouseDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-bold">{t("图片溯源结果")}</h2>
        <button type="button" className="text-xs underline" onClick={onClose} aria-label={t("关闭溯源结果")}>{t("关闭")}</button>
      </div>
      <p className="mt-2 text-xs leading-5">{resolution.reason}</p>
      {resolution.clues?.title && (
        <div className="mt-3 border-t border-ash/50 pt-2 text-xs leading-5">
          <div>{t("平台：")}{resolution.clues.platform || resolution.clues.site_domain || t("未确定")}</div>
          <div>{t("标题：")}{resolution.clues.title}</div>
          {resolution.clues.author && <div>{t("作者：")}{resolution.clues.author}</div>}
        </div>
      )}
      {!!resolution.stages.length && (
        <ol className="mt-3 space-y-1 border-t border-ash/50 pt-2 text-xs">
          {resolution.stages.map((stage, index) => (
            <li key={`${stage.name}-${index}`} className="flex justify-between gap-3">
              <span>{stageLabels[stage.name] || stage.name}</span>
              <span className="text-ash">{statusLabels[stage.status] || stage.status}</span>
            </li>
          ))}
        </ol>
      )}
      {!!resolution.candidates.length && (
        <div className="mt-3 border-t border-ash/50 pt-2">
          <h3 className="text-xs font-bold">{t("相似内容，请确认")}</h3>
          <div className="mt-2 space-y-2">
            {resolution.candidates.map((candidate) => (
              <div key={candidate.url} className="border border-ash/60 p-2 text-xs leading-5">
                <div className="font-semibold break-words">{candidate.title}</div>
                <div className="text-ash">{candidate.author || t("作者未知")} · {candidate.source === 'site' ? t("站内") : t("域名搜索")}  {t("· 标题相似度")} {Math.round(candidate.score * 100)}%</div>
                <div className="mt-1 flex gap-3">
                  <button type="button" className="font-bold underline" onClick={() => onConfirm(candidate.url)}>{t("确认并转换")}</button>
                  <a href={candidate.url} target="_blank" rel="noopener noreferrer" className="underline">{t("先查看网页")}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 border-t border-ash/50 pt-3 text-xs leading-5">
          <h3 className="font-bold">{t("手动搜索原内容")}</h3>
          <p className="mt-1 break-words">{manualSearch.query
            ? t("已填关键词（仅标题）：{0}", {0: (manualSearch.query)})
            : t("没有提取到可预填的标题，请在搜索页自行输入。")}</p>
          {resolution.clues?.author && <p className="text-ash">{t("作者仅用于核对：")}{resolution.clues.author}</p>}
          <a href={manualSearch.url} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-block border border-ink px-2 py-1 font-bold">
            {manualSearch.kind === 'site'
              ? t("打开{0}站内搜索", {0: (manualSearch.platform)})
              : manualSearch.kind === 'domain'
                ? t("打开{0}定向搜索", {0: (manualSearch.platform)})
                : t("打开网页搜索")}
          </a>
          <p className="mt-2 text-ash">{t("搜索页用于人工查找，图片卡片不会因此自动转换。")}</p>
      </div>
      {resolution.search_page && (
        <div className="mt-3 border-t border-ash/50 pt-3 text-xs">
          <h3 className="font-bold">{t("小红书站内搜索")}</h3>
          <p className="mt-1 leading-5">{t("若没有列出笔记，请在搜索页选择原帖，并复制它的具体链接。")}</p>
          <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); onConfirm(manualUrl.trim()); }}>
            <input value={manualUrl} onChange={(event) => setManualUrl(event.target.value)}
              aria-label={t("小红书笔记链接")} placeholder={t("粘贴选中的笔记链接")}
              className="min-w-0 flex-1 border border-ash bg-paper px-2 py-1" />
            <button type="submit" disabled={!manualUrl.trim()} className="border border-ink px-2 py-1 font-bold disabled:opacity-40">{t("确认")}</button>
          </form>
        </div>
      )}
    </aside>
  );
};
