import { t, useLanguage } from '../../i18n';
import { useEffect, useState } from 'react';
import type { GeneralSettings } from '../../hooks/useSettings';
import { workspaceRequest } from '../../utils/workspaceApi';
import type { GeneralController } from './useGeneralSettings';

const buttonClass = 'border border-ink px-1 py-1 disabled:opacity-40 hover:bg-stone/30 whitespace-nowrap';
function FolderControl({ kind, path, disabled, onChange, toast }: {
  kind: 'save' | 'temp'; path: string; disabled: boolean; onChange: (path: string) => Promise<void>; toast: (msg: string) => void;
}) {
  useLanguage();
  const [input, setInput] = useState(path);
  useEffect(() => setInput(path), [path]);
  const action = async (mode: 'choose' | 'open') => {
    try {
      const result = await workspaceRequest<{ success: boolean; path?: string }>('/api/settings/folder', { action: mode, kind });
      if (result.path) { setInput(result.path); await onChange(result.path); }
    } catch (error) { toast(error instanceof Error ? error.message : t("目录操作失败")); }
  };
  const label = kind === 'save' ? t("文件保存地址") : t("文件暂存地址");
  return <div data-interactive="true" className="w-full flex flex-col gap-2">
    <input aria-label={label} title={path} placeholder={t("目录绝对路径")} value={input} disabled={disabled} onChange={(event) => setInput(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Enter') void onChange(input.trim()); }}
      className="w-full min-w-0 border-b border-ash bg-transparent outline-none select-text" />
    <div className="flex justify-between gap-1">
      <button className={buttonClass} disabled={disabled} onClick={() => void action('choose')}>{t("选择文件夹")}</button>
      <button className={buttonClass} disabled={disabled} onClick={() => void action('open')}>{t("打开文件夹")}</button>
      <button className={buttonClass} disabled={disabled || input === path} onClick={() => void onChange(input.trim())}>{disabled ? t("切换中") : t("切换")}</button>
    </div>
  </div>;
}

export function GeneralControls({ id, controller: control, canvas, onCanvas, toast }: {
  id: string; controller: GeneralController; canvas: GeneralSettings;
  onCanvas: (updates: Partial<GeneralSettings>) => void; toast: (msg: string) => void;
}) {
  useLanguage();
  const files = control.files;
  if (id === 'save_dir' || id === 'temp_dir') {
    const path = files?.[id];
    return path ? <FolderControl kind={id === 'save_dir' ? 'save' : 'temp'} path={path}
      disabled={control.busy} onChange={(value) => control.change({ [id]: value })} toast={toast} /> : <>{t("读取中")}</>;
  }
  if (id === 'history') return <button className={buttonClass} onClick={() => control.setHistoryOpen(true)}>{t("查看记录")}</button>;
  if (id === 'autosave_enabled') return <label className="flex items-center gap-2" data-interactive="true">
    <input type="checkbox" aria-label={t("自动暂存")} checked={files?.autosave_enabled || false} disabled={!files || control.busy}
      onChange={(event) => void control.change({ autosave_enabled: event.target.checked })} />{files?.autosave_enabled ? t("开启") : t("关闭（自动暂存）")}
  </label>;
  if (id === 'idle_seconds' || id === 'retention_count') return <select aria-label={id === 'idle_seconds' ? t("暂存频率") : t("保留版本")}
    className="w-full bg-transparent outline-none" disabled={!files || control.busy} value={files?.[id] || 5}
    onChange={(event) => void control.change({ [id]: Number(event.target.value) })}>
    {(id === 'idle_seconds' ? [1, 5, 15, 30] : [1, 3, 5, 10, 20]).map((value) => <option key={value} value={value}>
      {id === 'idle_seconds' ? t("停止操作后 {0} 秒", {0: (value)}) : t("{0} 版", {0: (value)})}</option>)}
  </select>;
  if (id === 'wheel') return <button className={buttonClass} onClick={() => onCanvas({ invertWheelZoom: !canvas.invertWheelZoom })}>
    {canvas.invertWheelZoom ? t("向上缩小") : t("向上放大")}</button>;
  return <button className={buttonClass} onClick={() => onCanvas({ minimapMode: canvas.minimapMode === 'always' ? 'press_m' : 'always' })}>
    {canvas.minimapMode === 'always' ? t("常驻") : t("按 M 显示")}</button>;
}
