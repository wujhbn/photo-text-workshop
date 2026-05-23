import { ImagePlus, Images, LayoutTemplate, Share2, Download, RefreshCcw, Type, PenLine, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { generateCopy, getCurrentTimeOfDay, TimeOfDay } from '../lib/copy';
import { getTemplate, generateSampleBackground, TEMPLATES, TemplateId } from '../lib/templates';
import { renderCanvas } from '../lib/canvas';

const FONT_OPTIONS = [
  { label: '系統黑體', value: '"PingFang TC", "Helvetica Neue", "Microsoft JhengHei", sans-serif' },
  { label: '經典楷體', value: '"BiauKai", "DFKai-SB", serif' },
  { label: '圓潤圓體', value: '"YuanTi TC", "STYuan", "Microsoft JhengHei", sans-serif' },
  { label: '古典宋體', value: '"Songti TC", "LiSong Pro", "PMingLiU", serif' }
];

export default function Editor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getCurrentTimeOfDay());
  const [texts, setTexts] = useState(generateCopy(timeOfDay));
  const [templateId, setTemplateId] = useState<TemplateId>('golden');
  const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0].value);
  const [fontSizeFactor, setFontSizeFactor] = useState(1.0);
  const [strokeStrength, setStrokeStrength] = useState(50);
  const [textVerticalPos, setTextVerticalPos] = useState(25);
  const [textAlign, setTextAlign] = useState<CanvasTextAlign>('center');
  const [customStrokeColor, setCustomStrokeColor] = useState<string | null>(null);
  const [showDate, setShowDate] = useState(true);

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
      renderCanvas({
        canvas: canvasRef.current,
        imageElement,
        template: getTemplate(templateId),
        texts,
        fontSizeFactor,
        fontFamily,
        strokeStrength,
        strokeColor: customStrokeColor || getTemplate(templateId).textStroke,
        showDate,
        textVerticalPos,
        textAlign
      });
    }
  }, [imageElement, templateId, texts, fontSizeFactor, fontFamily, strokeStrength, customStrokeColor, showDate, textVerticalPos, textAlign]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>(resolve => canvasRef.current!.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not create blob');

      const file = new File([blob], `greeting_${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: '滿滿正能量',
          text: '與您分享溫暖的祝福！',
          files: [file],
        });
      } else {
        alert('您的瀏覽器不支援直接分享圖片，請先點擊「下載」儲存後，再傳到 LINE 哦！');
      }
    } catch (error) {
      console.error('Share failed', error);
      alert('分享失敗，請改用「下載」功能。');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <header className="bg-gray-50 flex-shrink-0 flex items-center justify-start px-4 pt-6 pb-2 z-10 pt-safe">
        <div className="px-6 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-full font-bold tracking-wider text-2xl shadow-sm">
          長輩圖工坊
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto w-full max-w-[500px] mx-auto px-4 pb-24 space-y-6 pt-4">
        
        {/* Canvas Preview */}
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative" style={{ aspectRatio: '4/5' }}>
           <canvas 
            ref={canvasRef}
            width={1080}
            height={1350}
            className="w-full h-full object-contain"
           />
           {!imageElement && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
               <span className="text-gray-500 animate-pulse">正在載入畫布...</span>
             </div>
           )}
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-green-50 text-green-700 border-2 border-green-200 py-3 px-4 rounded-xl font-bold hover:bg-green-100 transition active:scale-95"
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
            className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 border-2 border-orange-200 py-3 px-4 rounded-xl font-bold hover:bg-orange-100 transition active:scale-95"
          >
            <Images size={20} />
            範例背景
          </button>
        </div>

        {/* Time Segments */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
          {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map(time => (
            <button
              key={time}
              onClick={() => setTimeOfDay(time)}
              className={`flex-1 py-2 text-center rounded-lg font-bold transition ${timeOfDay === time ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {time === 'morning' ? '⛅️ 早安' : time === 'afternoon' ? '☀️ 午安' : '🌙 晚安'}
            </button>
          ))}
        </div>

        {/* Template Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-sm font-bold text-gray-600 flex items-center gap-1">
                <LayoutTemplate size={16} /> 佈景主題
             </h2>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full border-2 text-sm font-bold whitespace-nowrap snap-center transition ${
                  templateId === t.id 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Text Inputs */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-gray-600 flex items-center gap-1">
              <PenLine size={16} /> 自訂祝福語
            </h2>
            <button 
              onClick={handleRegenerateText}
              className="flex items-center justify-center gap-1 bg-blue-50 text-blue-700 py-1.5 px-3 rounded-lg text-sm font-bold hover:bg-blue-100 transition active:scale-95"
            >
              <RefreshCcw size={14} />
              重抽文案
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">標題 (大字)</label>
              <input 
                type="text" 
                value={texts.title} 
                onChange={e => setTexts({...texts, title: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">祝福語句 (支援多行)</label>
              <textarea 
                value={texts.message} 
                onChange={e => setTexts({...texts, message: e.target.value})} 
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-600 flex items-center gap-1">
              <Type size={16} /> 字體與排版
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">字型選擇</label>
              <select 
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
              >
                {FONT_OPTIONS.map(opt => (
                  <option key={opt.label} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">對齊方式</label>
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1 h-[36px]">
                <button title="靠左" onClick={() => setTextAlign('left')} className={`flex-1 flex justify-center items-center rounded-md transition ${textAlign === 'left' ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-green-600' : 'text-gray-500 hover:bg-gray-200'}`}><AlignLeft size={18} /></button>
                <button title="置中" onClick={() => setTextAlign('center')} className={`flex-1 flex justify-center items-center rounded-md transition ${textAlign === 'center' ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-green-600' : 'text-gray-500 hover:bg-gray-200'}`}><AlignCenter size={18} /></button>
                <button title="靠右" onClick={() => setTextAlign('right')} className={`flex-1 flex justify-center items-center rounded-md transition ${textAlign === 'right' ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-green-600' : 'text-gray-500 hover:bg-gray-200'}`}><AlignRight size={18} /></button>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-100 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">文字大小 ({Math.round(fontSizeFactor * 100)}%)</label>
                <input 
                  type="range" min="0.5" max="1.5" step="0.05" 
                  value={fontSizeFactor} 
                  onChange={(e) => setFontSizeFactor(parseFloat(e.target.value))}
                  className="w-full accent-green-600 mt-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">文字位置 (上下)</label>
                <input 
                  type="range" min="5" max="80" step="1" 
                  value={textVerticalPos} 
                  onChange={(e) => setTextVerticalPos(parseInt(e.target.value))}
                  className="w-full accent-green-600 mt-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">文字描邊 ({strokeStrength})</label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={strokeStrength} 
                  onChange={(e) => setStrokeStrength(parseInt(e.target.value))}
                  className="w-full accent-green-600 mt-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">描邊顏色</label>
                <div className="h-[20px] flex items-center mt-2">
                  <input 
                    type="color" 
                    value={customStrokeColor || getTemplate(templateId).textStroke} 
                    onChange={(e) => setCustomStrokeColor(e.target.value)}
                    className="w-full h-2 rounded-full cursor-pointer border-none p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full overflow-hidden block"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm font-bold text-gray-600">顯示日期</span>
            <button 
              onClick={() => setShowDate(!showDate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showDate ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDate ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

      </main>

      {/* Fixed Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe-offset-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-[500px] mx-auto flex gap-3">
           <button 
            onClick={downloadImage}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-4 rounded-xl font-bold hover:bg-gray-700 transition active:scale-95"
          >
            <Download size={20} />
            儲存圖片
          </button>
          <button 
            onClick={shareImage}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-green-600 transition active:scale-95 shadow-md shadow-green-500/30"
          >
            <Share2 size={20} />
            分享至 LINE
          </button>
        </div>
      </footer>
    </div>
  );
}
