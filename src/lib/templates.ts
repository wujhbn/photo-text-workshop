export type TemplateId = 'normal' | 'film' | 'airy' | 'golden' | 'moody' | 'fineart' | 'vintage';

export interface Template {
  id: TemplateId;
  name: string;
  imageFilter: string;
  vignette?: number;
  // keep remaining for backward compatibility/graceful degradation if needed,
  // but set them to neutral defaults so text is always readable
  titleColor: string;
  titleStroke: string;
  textColor: string;
  textStroke: string;
  gradientTop: string;
  gradientBottom: string;
  shadowColor: string;
  decoration: 'sparkles' | 'flowers' | 'sun' | 'stars' | 'none';
  alignment: 'center' | 'left' | 'right';
}

export const TEMPLATES: Template[] = [
  { 
    id: 'normal', name: '原圖', 
    imageFilter: 'contrast(1.05) saturate(1.05)', vignette: 0.1,
    titleColor: '#FFFFFF', titleStroke: '#000000', textColor: '#FFFFFF', textStroke: '#000000', 
    gradientTop: 'rgba(0,0,0,0)', gradientBottom: 'rgba(0,0,0,0.7)', 
    shadowColor: 'rgba(0,0,0,0.8)', decoration: 'none', alignment: 'center' 
  },
  { 
    id: 'film', name: '電影感', 
    imageFilter: 'contrast(1.25) saturate(1.2) sepia(0.25) brightness(0.9)', vignette: 0.5,
    titleColor: '#FFD54F', titleStroke: '#3E2723', textColor: '#FFFFFF', textStroke: '#212121', 
    gradientTop: 'rgba(0,0,0,0)', gradientBottom: 'rgba(0,0,0,0.85)', 
    shadowColor: 'rgba(0,0,0,0.9)', decoration: 'none', alignment: 'center' 
  },
  { 
    id: 'airy', name: '日系輕透', 
    imageFilter: 'brightness(1.25) contrast(0.85) saturate(0.7)', vignette: 0,
    titleColor: '#455A64', titleStroke: '#FFFFFF', textColor: '#263238', textStroke: '#FFFFFF', 
    gradientTop: 'rgba(255,255,255,0)', gradientBottom: 'rgba(255,255,255,0.7)', 
    shadowColor: 'rgba(255,255,255,0.8)', decoration: 'none', alignment: 'center' 
  },
  { 
    id: 'golden', name: '晨昏暖陽', 
    imageFilter: 'sepia(0.6) saturate(1.6) contrast(1.15) brightness(1.1) hue-rotate(-15deg)', vignette: 0.3,
    titleColor: '#FFF59D', titleStroke: '#4E342E', textColor: '#FFFFFF', textStroke: '#3E2723', 
    gradientTop: 'rgba(40,20,0,0)', gradientBottom: 'rgba(40,20,0,0.8)', 
    shadowColor: 'rgba(0,0,0,0.8)', decoration: 'none', alignment: 'center' 
  },
  { 
    id: 'moody', name: '深邃暗調', 
    imageFilter: 'brightness(0.7) contrast(1.4) saturate(0.5)', vignette: 0.7,
    titleColor: '#E0E0E0', titleStroke: '#000000', textColor: '#9E9E9E', textStroke: '#000000', 
    gradientTop: 'rgba(0,0,0,0)', gradientBottom: 'rgba(0,0,0,0.9)', 
    shadowColor: 'rgba(0,0,0,0.9)', decoration: 'none', alignment: 'center' 
  },
  { 
    id: 'fineart', name: '藝術黑白', 
    imageFilter: 'grayscale(1) contrast(1.5) brightness(0.9)', vignette: 0.6,
    titleColor: '#FFFFFF', titleStroke: '#000000', textColor: '#E0E0E0', textStroke: '#000000', 
    gradientTop: 'rgba(0,0,0,0)', gradientBottom: 'rgba(0,0,0,0.8)', 
    shadowColor: 'rgba(0,0,0,0.8)', decoration: 'none', alignment: 'center' 
  },
  { 
    id: 'vintage', name: '復古膠片', 
    imageFilter: 'sepia(0.8) contrast(0.85) brightness(0.9) saturate(0.5) hue-rotate(-10deg)', vignette: 0.4,
    titleColor: '#FFCC80', titleStroke: '#4E342E', textColor: '#F5F5F5', textStroke: '#3E2723', 
    gradientTop: 'rgba(30,20,10,0)', gradientBottom: 'rgba(30,20,10,0.8)', 
    shadowColor: 'rgba(0,0,0,0.8)', decoration: 'none', alignment: 'center' 
  },
];

export function getTemplate(id: TemplateId): Template {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}

// Draw a sample background onto a canvas and return dataUrl
export function generateSampleBackground(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Draw gradient
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#A1C4FD');
  grad.addColorStop(1, '#C2E9FB');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw some abstract hills
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  ctx.quadraticCurveTo(canvas.width / 2, canvas.height - 400, canvas.width, canvas.height - 200);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.fillStyle = '#6BA9E9';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 100);
  ctx.quadraticCurveTo(canvas.width / 2, canvas.height - 200, canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.fillStyle = '#4B8CD1';
  ctx.fill();

  // Draw Sun
  ctx.beginPath();
  ctx.arc(canvas.width * 0.8, canvas.height * 0.3, 150, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();

  return canvas.toDataURL('image/jpeg', 0.8);
}
