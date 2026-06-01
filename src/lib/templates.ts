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
export function generateSampleBackground(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'daily' = 'morning'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  let skyStart = '', skyEnd = '', sunColor = '', cloudColor = '';
  let fujiBase = '', fujiSnow = '', hillBack = '', hillFront = '';
  let toriiColor = '', toriiShadow = '', petalColor = '';
  let drawStars = false;
  let sunX = canvas.width * 0.8, sunY = canvas.height * 0.3;

  if (timeOfDay === 'morning') {
    skyStart = '#FFE4E1'; skyEnd = '#FFB6C1';
    sunColor = '#FFF59D'; 
    cloudColor = 'rgba(255, 255, 255, 0.8)';
    fujiBase = '#8CA3D1'; fujiSnow = '#FFFFFF';
    hillBack = '#81C784'; hillFront = '#4CAF50';
    toriiColor = '#EF5350'; toriiShadow = '#C62828';
    petalColor = '#FF80AB';
    sunY = canvas.height * 0.4;
  } else if (timeOfDay === 'evening') {
    skyStart = '#0B0F19'; skyEnd = '#241038';
    sunColor = '#FFF9C4'; 
    cloudColor = 'rgba(200, 200, 220, 0.15)';
    fujiBase = '#1B244A'; fujiSnow = '#9BA4B5';
    hillBack = '#1A2E2C'; hillFront = '#11221D';
    toriiColor = '#6A1B29'; toriiShadow = '#3E0A14';
    petalColor = '#BB86FC';
    drawStars = true;
    sunX = canvas.width * 0.2; sunY = canvas.height * 0.2;
  } else { // afternoon
    skyStart = '#4FC3F7'; skyEnd = '#B3E5FC';
    sunColor = '#FFCA28';
    cloudColor = 'rgba(255, 255, 255, 0.9)';
    fujiBase = '#5C85C8'; fujiSnow = '#FFFFFF';
    hillBack = '#66BB6A'; hillFront = '#43A047';
    toriiColor = '#F44336'; toriiShadow = '#C62828';
    petalColor = '#F48FB1';
    sunX = canvas.width * 0.8; sunY = canvas.height * 0.15;
  }

  // Sky
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, skyStart);
  grad.addColorStop(1, skyEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pseudoRandom = (seed: number) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Stars
  if (drawStars) {
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 150; i++) {
        const sx = pseudoRandom(i * 20) * canvas.width;
        const sy = pseudoRandom(i * 20 + 1) * (canvas.height * 0.6);
        const r = pseudoRandom(i * 20 + 2) * 2;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
    }
  }

  // Sun / Moon glow
  if (timeOfDay !== 'evening') {
     const sunGlow = ctx.createRadialGradient(sunX, sunY, 50, sunX, sunY, 150);
     sunGlow.addColorStop(0, sunColor + '80');
     sunGlow.addColorStop(1, 'transparent');
     ctx.fillStyle = sunGlow;
     ctx.beginPath();
     ctx.arc(sunX, sunY, 150, 0, Math.PI*2);
     ctx.fill();
  }

  // Sun / Moon body
  ctx.beginPath();
  ctx.arc(sunX, sunY, timeOfDay === 'evening' ? 80 : 100, 0, Math.PI * 2);
  ctx.fillStyle = sunColor;
  ctx.fill();

  if (timeOfDay === 'evening') {
    ctx.beginPath();
    ctx.arc(sunX + 25, sunY - 15, 75, 0, Math.PI * 2);
    ctx.fillStyle = skyStart;
    ctx.fill();
  }

  // Clouds
  ctx.fillStyle = cloudColor;
  const drawCloud = (cx: number, cy: number, scale: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 40 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 40 * scale, cy - 20 * scale, 50 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 80 * scale, cy, 40 * scale, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCloud(150, 200, 1.5);
  drawCloud(700, 300, 2);
  drawCloud(50, 450, 1.2);
  drawCloud(900, 150, 1);
  if (timeOfDay === 'daily') {
    drawCloud(400, 500, 1.8);
  }

  // Mount Fuji
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(100, canvas.height - 200);
  ctx.quadraticCurveTo(canvas.width / 2, canvas.height - 900, canvas.width - 100, canvas.height - 200);
  ctx.lineTo(canvas.width - 100, canvas.height);
  ctx.lineTo(100, canvas.height);
  ctx.closePath();
  ctx.fillStyle = fujiBase;
  ctx.fill();

  // Clip future drawing to the mountain's shape
  ctx.clip();

  // Snow on Mount Fuji
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 300, canvas.height - 450);
  ctx.quadraticCurveTo(canvas.width / 2 - 150, canvas.height - 400, canvas.width / 2 - 50, canvas.height - 460);
  ctx.quadraticCurveTo(canvas.width / 2 + 50, canvas.height - 410, canvas.width / 2 + 150, canvas.height - 470);
  ctx.quadraticCurveTo(canvas.width / 2 + 250, canvas.height - 420, canvas.width / 2 + 300, canvas.height - 480);
  ctx.lineTo(canvas.width / 2 + 300, canvas.height - 950);
  ctx.lineTo(canvas.width / 2 - 300, canvas.height - 950);
  ctx.closePath();
  ctx.fillStyle = fujiSnow;
  ctx.fill();
  
  ctx.restore();

  // Foreground hills
  ctx.beginPath();
  ctx.moveTo(-50, canvas.height);
  ctx.quadraticCurveTo(canvas.width / 3, canvas.height - 350, canvas.width * 0.7, canvas.height);
  ctx.fillStyle = hillBack;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(canvas.width + 50, canvas.height);
  ctx.quadraticCurveTo(canvas.width * 0.6, canvas.height - 400, 100, canvas.height);
  ctx.fillStyle = hillFront;
  ctx.fill();

  // Torii gate
  const tx = canvas.width * 0.25;
  const ty = canvas.height - 180;
  
  ctx.fillStyle = toriiShadow;
  ctx.fillRect(tx - 60, ty - 80, 15, 120); 
  ctx.fillRect(tx + 45, ty - 80, 15, 120); 
  
  ctx.fillStyle = toriiColor;
  ctx.fillRect(tx - 57, ty - 80, 10, 120); 
  ctx.fillRect(tx + 48, ty - 80, 10, 120); 
  
  ctx.fillStyle = toriiShadow;
  ctx.fillRect(tx - 70, ty - 60, 140, 15); 
  
  ctx.fillStyle = toriiColor;
  ctx.fillRect(tx - 68, ty - 58, 136, 11); 

  ctx.fillStyle = toriiShadow;
  ctx.beginPath();
  ctx.moveTo(tx - 80, ty - 90);
  ctx.quadraticCurveTo(tx, ty - 80, tx + 80, ty - 90);
  ctx.lineTo(tx + 80, ty - 105);
  ctx.quadraticCurveTo(tx, ty - 95, tx - 80, ty - 105);
  ctx.fill();

  ctx.fillStyle = toriiColor;
  ctx.beginPath();
  ctx.moveTo(tx - 78, ty - 92);
  ctx.quadraticCurveTo(tx, ty - 82, tx + 78, ty - 92);
  ctx.lineTo(tx + 78, ty - 103);
  ctx.quadraticCurveTo(tx, ty - 93, tx - 78, ty - 103);
  ctx.fill();

  // Atmospheric elements (dew drops in morning, flowers in afternoon, fireflies in evening)
  const drawAtmosphere = (x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    if (timeOfDay === 'morning') {
      // Cute Dew Drops
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(0, 3, 6, 0, Math.PI);
      ctx.quadraticCurveTo(6, -2, 0, -10);
      ctx.quadraticCurveTo(-6, -2, -6, 3);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(-2, 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (timeOfDay === 'afternoon' || timeOfDay === 'daily') {
      // Cute small flowers
      const colors = ['#FFFFFF', '#FFEB3B', '#FFCDD2'];
      ctx.fillStyle = colors[Math.floor(x + y) % colors.length];
      
      // Petals
      for (let p = 0; p < 5; p++) {
        ctx.beginPath();
        const angle = (p * Math.PI * 2) / 5;
        ctx.arc(Math.cos(angle) * 6, Math.sin(angle) * 6, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = '#FFC107';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (timeOfDay === 'evening') {
      // Fireflies
      ctx.fillStyle = petalColor + '80'; // soft glow
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const elementCount = timeOfDay === 'morning' ? 18 : (timeOfDay === 'evening' ? 25 : (timeOfDay === 'daily' ? 0 : 22));
  for (let i = 0; i < elementCount; i++) {
    const px = pseudoRandom(i * 10) * canvas.width;
    let py = pseudoRandom(i * 10 + 1) * canvas.height;
    
    // For afternoon, make flowers grow on the ground/hills instead of floating in the sky
    if (timeOfDay === 'afternoon' || timeOfDay === 'daily') {
      py = canvas.height - 400 + (pseudoRandom(i * 10 + 1) * 400);
    }

    const scale =  0.6 + pseudoRandom(i * 10 + 3) * (timeOfDay === 'evening' ? 0.4 : 0.8);
    drawAtmosphere(px, py, scale);
  }

  return canvas.toDataURL('image/jpeg', 0.8);
}
