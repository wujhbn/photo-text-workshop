import { Template } from './templates';

export interface CanvasRenderOptions {
  canvas: HTMLCanvasElement;
  imageElement: HTMLImageElement | null;
  template: Template;
  texts: { title: string; message: string };
  fontSizeFactor: number;
  fontFamily: string;
  strokeStrength: number;
  strokeColor: string;
  showDate: boolean;
  textVerticalPos: number;
  textAlign: CanvasTextAlign;
}

export function renderCanvas({
  canvas,
  imageElement,
  template,
  texts,
  fontSizeFactor,
  fontFamily,
  strokeStrength,
  strokeColor,
  showDate,
  textVerticalPos,
  textAlign,
}: CanvasRenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Draw Image
  if (imageElement) {
    const imgAspect = imageElement.width / imageElement.height;
    const canvasAspect = width / height;
    let drawW, drawH, drawX, drawY;

    if (imgAspect > canvasAspect) {
      drawH = height;
      drawW = imageElement.width * (height / imageElement.height);
      drawX = (width - drawW) / 2;
      drawY = 0;
    } else {
      drawW = width;
      drawH = imageElement.height * (width / imageElement.width);
      drawX = 0;
      drawY = (height - drawH) / 2;
    }
    ctx.drawImage(imageElement, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Decoration beneath text gradient
  drawDecorations(ctx, width, height, template.decoration);

  // Draw Gradient Overlay for Text Readability
  const grad = ctx.createLinearGradient(0, height * 0.3, 0, height);
  grad.addColorStop(0, template.gradientTop);
  grad.addColorStop(1, template.gradientBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Configuration for Text
  const marginX = 80;
  const safeWidth = width - marginX * 2;
  const baseTitleSize = template.id === 'large' ? 300 : 220;
  const baseTextSize = template.id === 'large' ? 90 : 70;

  // Draw Title
  const titleY = height * (textVerticalPos / 100);
  drawOutlinedText(
    ctx, 
    texts.title, 
    width / 2, 
    titleY, 
    template.titleColor, 
    strokeColor, 
    baseTitleSize * fontSizeFactor,
    fontFamily,
    'center',
    strokeStrength,
    template.shadowColor
  );

  const actualTitleSize = baseTitleSize * fontSizeFactor;
  const actualTextSize = baseTextSize * fontSizeFactor;

  let currentTop = titleY + actualTitleSize * 0.5 + 80 * fontSizeFactor;
  const paragraphGap = 15 * fontSizeFactor;

  // Alignments
  let textX = width / 2;
  if (textAlign === 'left') textX = marginX + 20; // adding slightly more margin
  if (textAlign === 'right') textX = width - marginX - 20;

  // Draw Message
  if (texts.message) {
    const rawLines = texts.message.split('\n');
    let isFirstLine = true;

    rawLines.forEach((textLine) => {
      // For each paragraph/line, split by width
      const subLines = wrapText(ctx, textLine, safeWidth, actualTextSize, fontFamily);
      subLines.forEach(line => {
        // If it's a completely empty line from user pressing enter, just add gap
        if (line.trim() === '') {
          currentTop += actualTextSize * 0.8;
          return;
        }
        drawOutlinedText(ctx, line, textX, currentTop + actualTextSize * 0.5, template.textColor, strokeColor, actualTextSize, fontFamily, textAlign, strokeStrength, template.shadowColor);
        currentTop += actualTextSize * 1.35;
      });
      // Add gap between paragraphs
      currentTop += paragraphGap;
    });
  }

  // Draw Date
  if (showDate) {
    const d = new Date();
    const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    const dateY = height - 60;
    drawOutlinedText(ctx, dateStr, width - 60, dateY, 'rgba(255,255,255,0.8)', 'rgba(0,0,0,0.5)', 40, fontFamily, 'right', strokeStrength * 0.5, 'transparent');
  }
}

function drawOutlinedText(
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  fillColor: string, 
  strokeColor: string, 
  fontSize: number,
  fontFamily: string,
  align: CanvasTextAlign,
  strokeStrength: number,
  shadowColor: string
) {
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  
  // Shadow
  if (shadowColor !== 'transparent' && shadowColor !== 'rgba(0,0,0,0)') {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Stroke
  const actualStrokeWidth = (strokeStrength / 100) * (fontSize * 0.25);
  if (actualStrokeWidth > 0 && strokeColor !== 'transparent') {
    ctx.lineWidth = actualStrokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
  }

  // Remove shadow for fill to avoid double shadow blur
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number, fontFamily: string): string[] {
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const chars = text.split('');
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = chars[n];
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
}

function drawDecorations(ctx: CanvasRenderingContext2D, width: number, height: number, type: string) {
  if (type === 'none') return;
  
  const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawFlower = (cx: number, cy: number, radius: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for(let i=0; i<5; i++) {
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(i * Math.PI * 0.4) * radius*0.8, 
                  cy + Math.sin(i * Math.PI * 0.4) * radius*0.8, 
                  radius, radius*0.4, i * Math.PI * 0.4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius*0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 235, 59, 0.8)';
    ctx.fill();
  };

  // Fixed random seed for consistency
  const randoms = [0.1, 0.5, 0.8, 0.2, 0.9, 0.4, 0.7, 0.3, 0.6];
  let rIdx = 0;
  const rand = () => { rIdx = (rIdx + 1) % randoms.length; return randoms[rIdx]; };

  if (type === 'sparkles') {
    for(let i=0; i<15; i++) {
      const cx = rand() * width;
      const cy = rand() * height * 0.5 + height * 0.5; // lower half
      const r = rand() * 20 + 10;
      drawStar(cx, cy, 4, r, r*0.3, 'rgba(255, 255, 255, 0.8)');
    }
  } else if (type === 'flowers') {
     for(let i=0; i<8; i++) {
      const cx = rand() * width;
      const cy = rand() * height;
      const r = rand() * 40 + 20;
      drawFlower(cx, cy, r);
    }
  } else if (type === 'stars') {
     for(let i=0; i<20; i++) {
      const cx = rand() * width;
      const cy = (rand() * height) / 2; // upper half
      const r = rand() * 10 + 5;
      drawStar(cx, cy, 5, r, r*0.4, 'rgba(255, 255, 100, 0.9)');
    }
  } else if (type === 'sun') {
     // Draw a big halo in top right
     ctx.beginPath();
     ctx.arc(width, 0, 400, 0, Math.PI * 2);
     const grad = ctx.createRadialGradient(width, 0, 50, width, 0, 400);
     grad.addColorStop(0, 'rgba(255,255,255,0.8)');
     grad.addColorStop(1, 'rgba(255,200,0,0)');
     ctx.fillStyle = grad;
     ctx.fill();
  }
}
