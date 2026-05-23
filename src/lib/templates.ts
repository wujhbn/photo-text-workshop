export type TemplateId = 'golden' | 'floral' | 'rainbow' | 'dawn' | 'sunset' | 'large';

export interface Template {
  id: TemplateId;
  name: string;
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
    id: 'golden', name: '金色祝福', 
    titleColor: '#FFF200', titleStroke: '#7A3E00', 
    textColor: '#FFFFFF', textStroke: '#4A2E00', 
    gradientTop: 'rgba(50,20,0,0)', gradientBottom: 'rgba(50,20,0,0.85)', 
    shadowColor: 'rgba(0,0,0,0.8)', decoration: 'sparkles', alignment: 'center' 
  },
  { 
    id: 'floral', name: '花草清新', 
    titleColor: '#69F0AE', titleStroke: '#004D40', 
    textColor: '#FFFFFF', textStroke: '#1B5E20', 
    gradientTop: 'rgba(0,50,0,0)', gradientBottom: 'rgba(0,50,10,0.8)', 
    shadowColor: 'rgba(0,0,0,0.6)', decoration: 'flowers', alignment: 'center' 
  },
  { 
    id: 'rainbow', name: '彩虹喜氣', 
    titleColor: '#FF6E40', titleStroke: '#FFFFFF', 
    textColor: '#FFFF00', textStroke: '#B71C1C', 
    gradientTop: 'rgba(255,100,0,0)', gradientBottom: 'rgba(150,0,50,0.85)', 
    shadowColor: 'rgba(0,0,0,0.7)', decoration: 'sun', alignment: 'center' 
  },
  { 
    id: 'dawn', name: '山水晨光', 
    titleColor: '#81D4FA', titleStroke: '#01579B', 
    textColor: '#FFFFFF', textStroke: '#006064', 
    gradientTop: 'rgba(0,100,150,0)', gradientBottom: 'rgba(0,40,80,0.9)', 
    shadowColor: 'rgba(0,0,0,0.8)', decoration: 'stars', alignment: 'right' 
  },
  { 
    id: 'sunset', name: '溫暖夕陽', 
    titleColor: '#FFCC80', titleStroke: '#4E342E', 
    textColor: '#FFFFFF', textStroke: '#BF360C', 
    gradientTop: 'rgba(200,50,0,0)', gradientBottom: 'rgba(100,20,0,0.9)', 
    shadowColor: 'rgba(0,0,0,0.8)', decoration: 'sparkles', alignment: 'left' 
  },
  { 
    id: 'large', name: 'LINE 大字版', 
    titleColor: '#FFFFFF', titleStroke: '#000000', 
    textColor: '#FFFFFF', textStroke: '#000000', 
    gradientTop: 'rgba(0,0,0,0.2)', gradientBottom: 'rgba(0,0,0,0.8)', 
    shadowColor: 'rgba(0,0,0,0)', decoration: 'none', alignment: 'center' 
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
