export interface ImageFilterSettings {
  brightness: number; // 0 to 200 (default 100)
  contrast: number;   // 0 to 200 (default 100)
  grayscale: number;  // 0 to 100 (default 0)
  sepia: number;      // 0 to 100 (default 0)
  saturate: number;   // 0 to 200 (default 100)
  blur: number;       // 0 to 20px (default 0)
}

export function getDefaultFilterSettings(): ImageFilterSettings {
  return {
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    sepia: 0,
    saturate: 100,
    blur: 0,
  };
}

export function processImageCanvas(
  imageSource: HTMLImageElement,
  options: {
    rotation?: number; // 0, 90, 180, 270
    flipH?: boolean;
    flipV?: boolean;
    filters?: ImageFilterSettings;
    targetWidth?: number;
    targetHeight?: number;
    cropRect?: { x: number; y: number; width: number; height: number };
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context unavailable');

      let sw = options.cropRect ? options.cropRect.width : imageSource.naturalWidth || imageSource.width;
      let sh = options.cropRect ? options.cropRect.height : imageSource.naturalHeight || imageSource.height;
      let sx = options.cropRect ? options.cropRect.x : 0;
      let sy = options.cropRect ? options.cropRect.y : 0;

      const dw = options.targetWidth || sw;
      const dh = options.targetHeight || sh;

      const rotation = options.rotation || 0;
      const isRotated90or270 = rotation === 90 || rotation === 270;

      canvas.width = isRotated90or270 ? dh : dw;
      canvas.height = isRotated90or270 ? dw : dh;

      ctx.save();

      // Apply Filter String
      if (options.filters) {
        const { brightness, contrast, grayscale, sepia, saturate, blur } = options.filters;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%) saturate(${saturate}%) blur(${blur}px)`;
      }

      // Handle Transform
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);

      ctx.drawImage(
        imageSource,
        sx,
        sy,
        sw,
        sh,
        -dw / 2,
        -dh / 2,
        dw,
        dh
      );

      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    } catch (e) {
      reject(e);
    }
  });
}

export function convertImageFormat(
  dataUrl: string,
  format: 'image/png' | 'image/jpeg' | 'image/webp',
  quality = 0.92
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
      }
      resolve(canvas.toDataURL(format, quality));
    };
    img.src = dataUrl;
  });
}
