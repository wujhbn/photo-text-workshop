import { ImagePlus, Images, LayoutTemplate, Share2, Download, RefreshCcw, Type, PenLine, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyCenter } from 'lucide-react';
import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { generateCopy, getCurrentTimeOfDay, TimeOfDay } from '../lib/copy';
import { getTemplate, generateSampleBackground, TEMPLATES, TemplateId } from '../lib/templates';
import { renderCanvas } from '../lib/canvas';

const FONT_OPTIONS = [
  { label: 'Q版圓潤', value: '"Zen Maru Gothic", sans-serif' },
  { label: '系統黑體', value: '"Noto Sans TC", sans-serif' },
  { label: '古典明體', value: '"Noto Serif TC", serif' },
  { label: '經典楷體', value: '"LXGW WenKai TC", serif' },
  { label: '手寫行書', value: '"Zhi Mang Xing", "Yuji Syuku", "LXGW WenKai TC", cursive' }
];

export default function Editor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageOpacity, setImageOpacity] = useState(1.0);
  const [imageExposure, setImageExposure] = useState(1.0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getCurrentTimeOfDay());
  const [texts, setTexts] = useState(generateCopy(timeOfDay));
  const [templateId, setTemplateId] = useState<TemplateId>('normal');
  const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0].value);
  const [fontSizeFactor, setFontSizeFactor] = useState(1.0);
  const [strokeStrength, setStrokeStrength] = useState(50);
  const [textVerticalPos, setTextVerticalPos] = useState(25);
  const [textAlign, setTextAlign] = useState<CanvasTextAlign>('center');
  const [isVertical, setIsVertical] = useState(false);
  const [customStrokeColor, setCustomStrokeColor] = useState<string | null>(null);
  const [showDate, setShowDate] = useState(true);
  const [signature, setSignature] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Pre-load fonts and force canvas redraw when ready
  useEffect(() => {
    // Explicitly load known web fonts to ensure canvas has them ready
    const fontsToLoad = ['"Zen Maru Gothic"', '"Noto Sans TC"', '"Noto Serif TC"', '"LXGW WenKai TC"', '"Zhi Mang Xing"', '"Yuji Syuku"'];
    
    Promise.all(
      fontsToLoad.map(f => document.fonts.load(`16px ${f}`).catch(console.error))
    ).then(() => {
      document.fonts.ready.then(() => {
        // Small state toggle to force canvas re-render now that fonts are loaded
        setFontSizeFactor(prev => prev + 0.0001);
        setTimeout(() => setFontSizeFactor(prev => prev - 0.0001), 100);
        setTimeout(() => setFontSizeFactor(prev => prev + 0.0001), 500);
        setTimeout(() => setFontSizeFactor(prev => prev - 0.0001), 1000);
      });
    });
  }, []);

  // Load sample background on mount if no image
  useEffect(() => {
    if (!imageElement) {
      loadSampleImage();
    }
  }, []);

  // Re-generate text when time of day changes manually
  useEffect(() => {
    setTexts(generateCopy(timeOfDay));
  }, [timeOfDay]);

  // Reset custom colors when template changes
  useEffect(() => {
    setCustomStrokeColor(null);
  }, [templateId]);

  // Render to canvas whenever dependencies change
  useEffect(() => {
    if (canvasRef.current) {
      const doRender = () => {
        if (!canvasRef.current) return;
        renderCanvas({
          canvas: canvasRef.current,
          imageElement,
          imageOpacity,
          imageExposure,
          template: getTemplate(templateId),
          texts,
          signature,
          fontSizeFactor,
          fontFamily,
          strokeStrength,
          strokeColor: customStrokeColor || getTemplate(templateId).textStroke,
          showDate,
          textVerticalPos,
          textAlign,
          isVertical
        });
      };

      // Render immediately with whatever fonts are available
      doRender();

      // Ensure we re-render once fonts have fully loaded. Since we inject dynamic text 
      // into the DOM, the browser will fetch needed unicode ranges.
      if (document.fonts) {
        document.fonts.ready.then(() => {
          doRender();
          // Fallback timer: Canvas sometimes needs a short delay after document.fonts.ready 
          // to fully synthesize/render new characters in some browsers (e.g. Safari).
          setTimeout(doRender, 150);
          setTimeout(doRender, 500);
        });
      }
    }
  }, [imageElement, imageOpacity, imageExposure, templateId, texts, signature, fontSizeFactor, fontFamily, strokeStrength, customStrokeColor, showDate, textVerticalPos, textAlign, isVertical]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setImageElement(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSampleImage = () => {
    const img = new Image();
    img.onload = () => setImageElement(img);
    img.src = generateSampleBackground();
  };

  const handleRegenerateText = () => {
    setTexts(generateCopy(timeOfDay));
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `greeting_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const shareImage = async () => {
    if (!canvasRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const blob = await new Promise<Blob | null>(resolve => canvasRef.current!.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not create blob');

      const file = new File([blob], `greeting_${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
        });
      } else {
        alert('您的瀏覽器不支援直接分享圖片，請先點擊「下載」儲存後，再傳到 LINE 哦！');
      }
    } catch (error: any) {
      if (error && (error.name === 'AbortError' || error.message?.toLowerCase().includes('canc') || error.message?.toLowerCase().includes('abort'))) {
        console.log('Share was cancelled by the user:', error);
      } else {
        console.error('Share failed', error);
        alert('分享失敗，請改用「下載」功能。');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#fff7f9] font-['Zen_Maru_Gothic',sans-serif]">
      {/* Hidden Font Preloader to force network requests */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden' }}>
        {FONT_OPTIONS.map((font, idx) => (
          <span key={idx} style={{ fontFamily: font.value }}>
            字體載入 preload {texts.title} {texts.message} 0123456789
          </span>
        ))}
      </div>
      
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 shadow-sm flex-shrink-0 flex items-center justify-center px-4 py-3 z-10 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <h1 className="text-white font-black tracking-widest text-[20px] drop-shadow-[0_2px_4px_rgba(255,100,150,0.4)]" style={{ fontFamily: '"Zen Maru Gothic", sans-serif', fontWeight: 900 }}>
          相片文字工房
        </h1>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full max-w-[500px] lg:max-w-5xl mx-auto">
        
        {/* Canvas Section - Fixed on mobile, side-by-side on desktop */}
        <div className="flex-shrink-0 z-10 w-full lg:w-1/2 h-[38vh] min-h-[220px] lg:h-full flex items-center justify-center border-b-2 border-pink-100 lg:border-b-0 lg:border-r border-pink-100/50 bg-[#fff7f9] relative p-5 lg:p-8">
          <div className="relative w-full h-full flex items-center justify-center">
             <canvas 
              ref={canvasRef}
              width={1080}
              height={1350}
              className="bg-white rounded-[20px] shadow-[0_8px_20px_rgba(255,150,180,0.15)] border-[4px] border-white transition-all duration-300 block"
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
             />
             {!imageElement && (
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 z-10">
                 <span className="animate-pulse bg-white/90 px-4 py-2 rounded-xl font-bold text-sm shadow-sm">正在載入畫布...</span>
               </div>
             )}
          </div>
        </div>

        {/* Scrollable Settings Section */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-[120px] lg:w-1/2 hide-scrollbar">

        {/* Input Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-[#e0f7fa] text-cyan-700 border-2 border-cyan-200 py-3 px-4 rounded-2xl font-black hover:bg-cyan-100 transition shadow-[0_4px_0_theme(colors.cyan.200)] q-btn mb-1"
          >
            <ImagePlus size={20} />
            選擇照片
          </button>
          <input 
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />
          <button 
            onClick={loadSampleImage}
            className="flex items-center justify-center gap-2 bg-[#fff9c4] text-amber-700 border-2 border-yellow-200 py-3 px-4 rounded-2xl font-black hover:bg-yellow-100 transition shadow-[0_4px_0_theme(colors.yellow.300)] q-btn mb-1"
          >
            <Images size={20} />
            範例背景
          </button>
        </div>

        {/* Time Segments */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-pink-100 flex gap-2">
          {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map(time => (
            <button
              key={time}
              onClick={() => setTimeOfDay(time)}
              className={`flex-1 py-2 text-center rounded-xl font-bold transition-all ${timeOfDay === time ? 'bg-pink-400 text-white shadow-[0_3px_0_theme(colors.pink.500)] scale-105' : 'text-gray-400 bg-gray-50 hover:bg-pink-50'}`}
            >
              {time === 'morning' ? '⛅️ 早安' : time === 'afternoon' ? '☀️ 午安' : '🌙 晚安'}
            </button>
          ))}
        </div>

        {/* Template Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-sm font-bold text-pink-500 flex items-center gap-1">
                <Images size={16} /> 相片風格
             </h2>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl border-2 text-sm font-bold whitespace-nowrap snap-center transition-all ${
                  templateId === t.id 
                  ? 'border-pink-400 bg-pink-50 text-pink-600 shadow-[0_2px_0_theme(colors.pink.200)]' 
                  : 'border-white bg-white text-gray-500 shadow-sm'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          
          <div className="mt-3 bg-white p-4 rounded-2xl shadow-sm border border-pink-100 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-pink-400 font-bold mb-2 flex items-center gap-1">不透明度 ({Math.round(imageOpacity * 100)}%)</label>
              <input 
                type="range" min="0.1" max="1.0" step="0.05" 
                value={imageOpacity} 
                onChange={(e) => setImageOpacity(parseFloat(e.target.value))}
                className="w-full accent-pink-400"
              />
            </div>
            <div>
              <label className="text-xs text-pink-400 font-bold mb-2 flex items-center gap-1">曝光度 ({Math.round(imageExposure * 100)}%)</label>
              <input 
                type="range" min="0" max="2.0" step="0.1" 
                value={imageExposure} 
                onChange={(e) => setImageExposure(parseFloat(e.target.value))}
                className="w-full accent-pink-400"
              />
            </div>
          </div>
        </div>

        {/* Custom Text Inputs */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-pink-500 flex items-center gap-1">
              <PenLine size={16} /> 自訂祝福語
            </h2>
            <button 
              onClick={handleRegenerateText}
              className="flex items-center justify-center gap-1 bg-[#f3e8ff] text-purple-600 py-1.5 px-3 rounded-xl border-2 border-purple-200 text-sm font-bold hover:bg-purple-100 transition q-btn shadow-[0_2px_0_theme(colors.purple.200)]"
            >
              <RefreshCcw size={14} />
              重抽
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 font-bold mb-1 block">標題 (大字)</label>
              <input 
                type="text" 
                value={texts.title} 
                onChange={e => setTexts({...texts, title: e.target.value})} 
                className="w-full bg-[#fffcfd] border-2 border-pink-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-pink-400 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold mb-1 block">祝福語句 (支援多行)</label>
              <textarea 
                value={texts.message} 
                onChange={e => setTexts({...texts, message: e.target.value})} 
                rows={4}
                className="w-full bg-[#fffcfd] border-2 border-pink-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-pink-400 outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-pink-500 flex items-center gap-1">
              <Type size={16} /> 字體與排版
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-5 border-b border-pink-50 pb-5">
            <div>
              <label className="text-xs text-gray-400 font-bold mb-2 block">字型選擇</label>
              <select 
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className="w-full bg-[#fffcfd] border-2 border-pink-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-pink-400 outline-none transition"
              >
                {FONT_OPTIONS.map(opt => (
                  <option key={opt.label} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold mb-2 block">排版方向</label>
              <div className="bg-[#fff7f9] p-1 rounded-xl flex gap-1 h-[40px] border border-pink-100">
                <button title="橫書" onClick={() => setIsVertical(false)} className={`flex-1 flex justify-center items-center rounded-lg text-sm font-bold transition ${!isVertical ? 'bg-white shadow-sm text-pink-500' : 'text-gray-400 hover:bg-pink-50'}`}>橫向</button>
                <button title="直書" onClick={() => setIsVertical(true)} className={`flex-1 flex justify-center items-center rounded-lg text-sm font-bold transition ${isVertical ? 'bg-white shadow-sm text-pink-500' : 'text-gray-400 hover:bg-pink-50'}`}>直向</button>
              </div>
            </div>
            <div className="col-span-2 pt-1">
              <label className="text-xs text-gray-400 font-bold mb-2 block">對齊方式</label>
              <div className="bg-[#fff7f9] p-1 rounded-xl flex gap-1 h-[40px] border border-pink-100">
                <button title="靠左" onClick={() => setTextAlign('left')} className={`flex-1 flex justify-center items-center rounded-lg transition ${textAlign === 'left' ? 'bg-white shadow-sm text-pink-500' : 'text-gray-400 hover:bg-pink-50'}`}><AlignLeft size={18} /></button>
                <button title="置中" onClick={() => setTextAlign('center')} className={`flex-1 flex justify-center items-center rounded-lg transition ${textAlign === 'center' ? 'bg-white shadow-sm text-pink-500' : 'text-gray-400 hover:bg-pink-50'}`}><AlignCenter size={18} /></button>
                <button title="靠右" onClick={() => setTextAlign('right')} className={`flex-1 flex justify-center items-center rounded-lg transition ${textAlign === 'right' ? 'bg-white shadow-sm text-pink-500' : 'text-gray-400 hover:bg-pink-50'}`}><AlignRight size={18} /></button>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-pink-50 pb-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-gray-400 font-bold mb-2 block">文字大小 ({Math.round(fontSizeFactor * 100)}%)</label>
                <input 
                  type="range" min="0.5" max="1.5" step="0.05" 
                  value={fontSizeFactor} 
                  onChange={(e) => setFontSizeFactor(parseFloat(e.target.value))}
                  className="w-full accent-pink-400 mt-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold mb-2 block">上下位置</label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={textVerticalPos} 
                  onChange={(e) => setTextVerticalPos(parseInt(e.target.value))}
                  className="w-full accent-pink-400 mt-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-gray-400 font-bold mb-2 block">文字描邊 ({strokeStrength})</label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={strokeStrength} 
                  onChange={(e) => setStrokeStrength(parseInt(e.target.value))}
                  className="w-full accent-pink-400 mt-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold mb-2 block">描邊顏色</label>
                <div className="h-[20px] flex items-center mt-2">
                  <input 
                    type="color" 
                    value={customStrokeColor || getTemplate(templateId).textStroke} 
                    onChange={(e) => setCustomStrokeColor(e.target.value)}
                    className="w-full h-4 rounded-full cursor-pointer border-none p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full overflow-hidden block relative shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-1 mb-2">
            <div>
              <label className="text-xs text-gray-400 font-bold mb-1 block">自訂署名 (選填)</label>
              <input 
                type="text" 
                value={signature} 
                onChange={e => setSignature(e.target.value)} 
                placeholder="例如：小明 敬上"
                className="w-full bg-[#fffcfd] border-2 border-pink-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-pink-400 outline-none transition"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-pink-50">
            <span className="text-sm font-bold text-gray-500">顯示日期印章</span>
            <button 
              onClick={() => setShowDate(!showDate)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${showDate ? 'bg-pink-400' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showDate ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#fffcfd]/90 backdrop-blur-md border-t-2 border-pink-100 p-4 pb-safe-offset-4 shadow-[0_-10px_20px_rgba(255,150,180,0.05)] z-20">
        <div className="max-w-[500px] mx-auto flex gap-4 pr-1 pl-1">
           <button 
            onClick={downloadImage}
            className="flex-1 flex items-center justify-center gap-2 bg-[#90caf9] text-white py-3.5 px-4 rounded-2xl font-black transition active:scale-95 shadow-[0_4px_0_theme(colors.blue.400)] q-btn mb-1"
          >
            <Download size={20} strokeWidth={2.5} />
            儲存圖片
          </button>
          <button 
            onClick={shareImage}
            disabled={isSharing}
            className={`flex-[1.5] flex items-center justify-center gap-2 bg-[#ff80ab] text-white py-3.5 px-4 rounded-2xl font-black transition shadow-[0_4px_0_theme(colors.pink.500)] q-btn mb-1 ${isSharing ? 'opacity-50 cursor-not-allowed shadow-none translate-y-1' : ''}`}
          >
            <Share2 size={20} strokeWidth={2.5} className={isSharing ? "animate-spin" : ""} />
            {isSharing ? '啟動中...' : '分享至 LINE'}
          </button>
        </div>
      </footer>
    </div>
  );
}
