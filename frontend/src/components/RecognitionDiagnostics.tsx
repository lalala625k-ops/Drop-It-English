import { t, useLanguage } from '../i18n';
import React, { useState } from 'react';
import { RecognitionReport } from '../utils/recognizeCardImage';
import { manualSearchFallback } from '../utils/manualSearch';

const names: Record<string, string> = {
  get qr() { return t("二维码预检"); }, get ocr() { return t("本地 OCR"); }, get caption() { return t("Instagram 正文提取"); }, get explicit() { return t("明确标识"); }, get vision() { return t("大模型提取"); },
  get routing() { return t("平台分发"); }, get platform_correction() { return t("平台特征纠偏"); },
  get model_request() { return t("模型接口"); }, get site_request() { return t("站内接口"); }, get site_results() { return t("站内结果"); }, get site_search() { return t("站内搜索"); },
  get domain_request() { return t("定向搜索接口"); }, get domain_results() { return t("搜索结果筛选"); }, get domain_search() { return t("定向搜索"); },
  get verification() { return t("候选核验"); }, get api_request() { return t("前端请求"); }, get metadata() { return t("网页元数据"); }, get cover() { return t("原网页封面"); },
  get manual_confirmation() { return t("手动确认"); }, get client() { return t("页面处理"); },
};

interface Props {
  reports: RecognitionReport[];
  onClose: () => void;
  activeReviewCardId?: string;
  onConfirmCandidate?: (url: string) => void;
}

export const RecognitionDiagnostics: React.FC<Props> = ({ reports, onClose,
  activeReviewCardId, onConfirmCandidate }) => {
  useLanguage();
  const [manualUrl, setManualUrl] = useState('');
  return (
  <aside role="region" aria-label={t("识别诊断记录")}
    className="fixed right-0 top-0 z-[115] flex h-dvh w-[min(420px,92vw)] flex-col border-l border-ink bg-paper text-ink"
    onMouseDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
    <header className="flex items-center justify-between border-b border-ink px-4 py-3">
      <div><h2 className="text-sm font-bold">{t("识别诊断记录")}</h2>
        <p className="mt-1 text-[11px] text-ash">{t("本次打开页面的最近 20 次运行")}</p></div>
      <button type="button" className="text-xs underline" onClick={onClose}>{t("关闭")}</button>
    </header>
    <div className="flex-1 overflow-y-auto p-4">
      {reports.length === 0 && <p className="text-xs">{t("尚无记录。对图片使用“识字”或“溯源”后会显示过程。")}</p>}
      {reports.map((report, index) => {
        const manualSearch = report.mode === 'link' && !report.finalUrl
          ? report.clues?.title && report.manualSearch?.query !== report.clues.title
            ? manualSearchFallback(report.clues, '')
            : report.manualSearch || manualSearchFallback(report.clues, '')
          : null;
        return (
        <details key={report.id} open={index === 0} className="mb-3 border border-ash/70 p-3 text-xs">
          <summary className="cursor-pointer font-bold">
            {report.mode === 'link' ? t("图片溯源") : t("OCR 识字")} · {report.at} · {report.status}
          </summary>
          <p className="mt-2 leading-5">{report.reason}</p>
          {report.elapsedMs !== undefined && <p className="text-ash">{t("耗时")} {report.elapsedMs} ms</p>}
          <p className="text-ash">{t("卡片 ID：")}{report.cardId}</p>
          {!!report.clues && Object.entries(report.clues).some(([, value]) => value) && (
            <div className="mt-3 border-t border-ash/50 pt-2">
              <strong>{t("标准化检索字段")}</strong>
              {Object.entries(report.clues).filter(([, value]) => value).map(([key, value]) =>
                <p key={key} className="mt-1 break-words">{key}：{value}</p>)}
            </div>
          )}
          {manualSearch && <div className="mt-3 border border-ink p-3">
            <strong>{t("未找到原链接时手动搜索")}</strong>
            <p className="mt-1 break-words">{manualSearch.query
              ? t("已填关键词（仅标题）：{0}", {0: (manualSearch.query)}) : t("没有可预填关键词，请在搜索页输入。")}</p>
            {report.clues?.author && <p className="text-ash">{t("作者仅用于核对：")}{report.clues.author}</p>}
            <a href={manualSearch.url} target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-block border border-ink px-2 py-1 font-bold">
              {manualSearch.kind === 'site'
                ? t("打开{0}站内搜索", {0: (manualSearch.platform)})
                : manualSearch.kind === 'domain'
                  ? t("打开{0}定向搜索", {0: (manualSearch.platform)}) : t("打开网页搜索")}
            </a>
          </div>}
          <ol className="mt-3 space-y-2 border-t border-ash/50 pt-2">
            {report.events.map((event, eventIndex) => (
              <li key={eventIndex} className="border-b border-ash/30 pb-2">
                <div className="font-semibold">{eventIndex + 1}. {names[event.name] || event.name} · {event.status}</div>
                {event.detail && <div className="mt-1 whitespace-pre-wrap break-words">{event.detail}</div>}
                {event.url && <div className="mt-1 break-all text-ash">{event.url}
                  {event.port && t(" · 端口 {0}", {0: (event.port)})}{event.http_status && ` · HTTP ${event.http_status}`}</div>}
              </li>
            ))}
          </ol>
          {report.finalUrl && <p className="mt-2 break-all">{t("最终链接：")}{report.finalUrl}</p>}
          {!!report.candidates?.length && <div className="mt-2 border-t border-ash/50 pt-2">
            <strong>{t("候选（")}{report.candidates.length}）</strong>
            {report.candidates.map((candidate) => <div key={candidate.url} className="mt-2 border border-ash/50 p-2 break-words">
              <div>{candidate.title} · {candidate.author || t("作者未知")} · {Math.round(candidate.score * 100)}%</div>
              <div className="break-all text-ash">{candidate.url}</div>
              {activeReviewCardId === report.cardId && onConfirmCandidate &&
                <button type="button" onClick={() => onConfirmCandidate(candidate.url)} className="mt-1 font-bold underline">{t("选这条并转换")}</button>}
            </div>)}
          </div>}
          {report.searchPage && <div className="mt-3 border-t border-ash/50 pt-2">
            <strong>{t("小红书站内搜索")}</strong>
            <p className="mt-1">{t("未取得可读取的笔记时，请在搜索页选中原帖。")}</p>
            {!manualSearch && <a href={report.searchPage} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-bold underline">{t("打开搜索结果页")}</a>}
            {activeReviewCardId === report.cardId && onConfirmCandidate &&
              <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); onConfirmCandidate(manualUrl.trim()); }}>
                <input value={manualUrl} onChange={(event) => setManualUrl(event.target.value)}
                  aria-label={t("小红书笔记链接")} placeholder={t("粘贴选中的笔记链接")}
                  className="min-w-0 flex-1 border border-ash px-2 py-1" />
                <button type="submit" disabled={!manualUrl.trim()} className="border border-ink px-2 py-1 font-bold disabled:opacity-40">{t("确认")}</button>
              </form>}
          </div>}
        </details>
      )})}
    </div>
  </aside>
  );
};
