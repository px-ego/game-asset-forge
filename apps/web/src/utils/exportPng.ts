function loadSvgImage(sourceUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("SVG image could not be loaded."));
    image.src = sourceUrl;
  });
}

function createPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("PNG blob could not be created."));
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, fileName: string): void {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.download = fileName;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

export async function exportSvgToPng(
  svgElement: SVGSVGElement,
  fileName: string,
  size: number,
): Promise<void> {
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgClone.setAttribute("width", String(size));
  svgClone.setAttribute("height", String(size));

  const svgContent = new XMLSerializer().serializeToString(svgClone);
  const sourceUrl = URL.createObjectURL(
    new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" }),
  );

  try {
    const image = await loadSvgImage(sourceUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context is unavailable.");
    }

    canvas.width = size;
    canvas.height = size;
    context.imageSmoothingEnabled =
      svgElement.getAttribute("shape-rendering") !== "crispEdges";
    context.drawImage(image, 0, 0, size, size);

    const pngBlob = await createPngBlob(canvas);
    downloadBlob(pngBlob, fileName);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
