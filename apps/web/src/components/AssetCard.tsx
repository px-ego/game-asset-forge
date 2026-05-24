import { useCallback, useRef, useState } from "react";
import {
  assetTypeLabels,
  styleLabels,
  themeLabels,
} from "../features/asset-generator/assetOptions";
import { type GeneratedAsset } from "../types/asset";
import { exportSvgToPng } from "../exporters/exportPng";
import { AssetPreview } from "./AssetPreview";

interface AssetCardProps {
  asset: GeneratedAsset;
  onPreviewReady?: (assetId: string, element: SVGSVGElement | null) => void;
}

export function AssetCard({ asset, onPreviewReady }: AssetCardProps) {
  const previewRef = useRef<SVGSVGElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const handlePreviewRef = useCallback(
    (element: SVGSVGElement | null) => {
      previewRef.current = element;
      onPreviewReady?.(asset.id, element);
    },
    [asset.id, onPreviewReady],
  );

  const handleDownload = async () => {
    if (!previewRef.current) {
      setExportError("PNG 导出失败，请重试");
      return;
    }

    const fileName = `gameasset_${asset.type}_${asset.theme}_${asset.style}_${asset.size}_${asset.seed}.png`;

    setIsExporting(true);
    setExportError("");

    try {
      await exportSvgToPng(previewRef.current, fileName, asset.size);
    } catch {
      setExportError("PNG 导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <article className="asset-card">
      <AssetPreview asset={asset} ref={handlePreviewRef} />
      <div className="asset-card-body">
        <h3>{asset.name ?? assetTypeLabels[asset.type]}</h3>
        {asset.variant && <p className="asset-variant">{asset.variant}</p>}
        <dl className="asset-details">
          <div>
            <dt>类型</dt>
            <dd>{asset.type}</dd>
          </div>
          <div>
            <dt>主题</dt>
            <dd>{`${themeLabels[asset.theme]} (${asset.theme})`}</dd>
          </div>
          <div>
            <dt>风格</dt>
            <dd>{`${styleLabels[asset.style]} (${asset.style})`}</dd>
          </div>
          <div>
            <dt>尺寸</dt>
            <dd>{`${asset.size} x ${asset.size}`}</dd>
          </div>
          <div>
            <dt>seed</dt>
            <dd>{asset.seed}</dd>
          </div>
        </dl>
        <button
          className="download-button"
          disabled={isExporting}
          onClick={handleDownload}
          type="button"
        >
          {isExporting ? "正在导出..." : "下载 PNG"}
        </button>
        {exportError && (
          <p className="export-error" role="alert">
            {exportError}
          </p>
        )}
      </div>
    </article>
  );
}
