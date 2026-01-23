// components/TextMask.jsx
import React, { useEffect, useRef, useCallback, useState } from 'react';

const TextMask = ({ 
  text, 
  fontSize = 48, 
  fontWeight = 'bold', 
  fontFamily = 'Arial, sans-serif',
  className = '',
  smoothing = true // Включить сглаживание
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationIdRef = useRef(null);
  const updateCounterRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);

  // Функция для получения основного Three.js canvas
  const getThreeCanvas = useCallback(() => {
    return document.querySelector('canvas');
  }, []);

  // Функция для сглаживания текста
  const applyTextSmoothing = useCallback((ctx) => {
    if (smoothing) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.textRendering = 'optimizeLegibility';
      ctx.fontKerning = 'normal';
      ctx.fontStretch = 'normal';
      ctx.fontVariant = 'normal';
    }
  }, [smoothing]);

  // Функция обновления маски с улучшенной отрисовкой текста
  const updateTextMask = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const threeCanvas = getThreeCanvas();
    
    if (!canvas || !container || !threeCanvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Получаем размеры текста через временный span
    const tempSpan = document.createElement('span');
    tempSpan.style.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    tempSpan.style.position = 'absolute';
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.textContent = text;
    document.body.appendChild(tempSpan);
    
    const textWidth = Math.ceil(tempSpan.offsetWidth);
    const textHeight = Math.ceil(tempSpan.offsetHeight);
    document.body.removeChild(tempSpan);
    
    // Добавляем отступы
    const padding = fontSize * 0.5;
    const width = textWidth + padding * 2;
    const height = textHeight + padding * 2;

    if (width !== dimensions.width || height !== dimensions.height) {
      setDimensions({ width, height });
    }

    // Устанавливаем размеры canvas с учетом DPI для четкости
    const dpr = window.devicePixelRatio || 2; // Используем минимум 2x для четкости
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Настраиваем сглаживание
      applyTextSmoothing(ctx);
      ctx.scale(dpr, dpr);
    }

    // Получаем позицию
    const rect = container.getBoundingClientRect();
    
    // Копируем область из Three.js canvas только если видим
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      try {
        // Очищаем canvas
        ctx.clearRect(0, 0, width, height);
        
        // Копируем фон с высоким DPI
        ctx.save();
        ctx.scale(1/dpr, 1/dpr); // Временный scale для точного копирования
        ctx.drawImage(
          threeCanvas,
          rect.left * dpr,
          rect.top * dpr,
          width * dpr,
          height * dpr,
          0,
          0,
          canvasWidth,
          canvasHeight
        );
        ctx.restore();
        ctx.scale(dpr, dpr); // Возвращаем scale

        // Создаем текстовую маску на отдельном canvas
        const textCanvas = document.createElement('canvas');
        textCanvas.width = canvasWidth;
        textCanvas.height = canvasHeight;
        const textCtx = textCanvas.getContext('2d', { alpha: true });
        
        if (!textCtx) return;

        applyTextSmoothing(textCtx);
        textCtx.scale(dpr, dpr);
        
        // Рисуем текст с тенью для лучшего сглаживания
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        
        // Сначала рисуем тонкую черную обводку для антиалиасинга
        if (smoothing) {
          textCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          textCtx.strokeStyle = 'black';
          textCtx.lineWidth = 0.5;
          textCtx.strokeText(text, width / 2, height / 2);
        }
        
        // Затем заливаем белым
        textCtx.fillStyle = 'white';
        textCtx.fillText(text, width / 2, height / 2);

        // Получаем маску текста
        const textData = textCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const bgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        // Применяем инверсию только к области текста с плавными краями
        for (let i = 0; i < bgData.data.length; i += 4) {
          const alpha = textData.data[i + 3];
          
          if (alpha > 0) {
            // Инверсия цвета с учетом альфа-канала для плавных краев
            const alphaRatio = alpha / 255;
            bgData.data[i] = 255 - bgData.data[i];     // R
            bgData.data[i + 1] = 255 - bgData.data[i + 1]; // G
            bgData.data[i + 2] = 255 - bgData.data[i + 2]; // B
            bgData.data[i + 3] = alpha; // Сохраняем альфу для плавных краев
          } else {
            bgData.data[i + 3] = 0; // Полностью прозрачный вне текста
          }
        }

        ctx.putImageData(bgData, 0, 0);
        
        if (!isReady) setIsReady(true);
        
      } catch (e) {
        console.log('Canvas error:', e);
      }
    }
  }, [fontSize, fontWeight, fontFamily, dimensions, smoothing, applyTextSmoothing, getThreeCanvas, isReady, text]);

  // Оптимизированный цикл анимации
  const animate = useCallback(() => {
    updateCounterRef.current++;
    
    // Обновляем только каждый 4-й кадр для производительности
    if (updateCounterRef.current % 4 === 0) {
      updateTextMask();
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [updateTextMask]);

  // Инициализация
  useEffect(() => {
    // Небольшая задержка для инициализации Three.js
    const initTimeout = setTimeout(() => {
      animate();
    }, 500);

    // Обработчики событий
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateTextMask();
      }, 200);
    };

    const handleScroll = () => {
      if (updateCounterRef.current % 3 === 0) {
        updateTextMask();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [animate, updateTextMask]);

  return (
    <div 
      ref={containerRef} 
      className={`text-mask-container ${className} ${isReady ? 'ready' : 'loading'}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        lineHeight: 0,
        whiteSpace: 'nowrap',
        width: dimensions.width > 0 ? `${dimensions.width}px` : 'auto',
        height: dimensions.height > 0 ? `${dimensions.height}px` : 'auto',
        transition: 'opacity 0.3s ease'
      }}
      data-text={text}
    >
      <canvas
        ref={canvasRef}
        className="text-mask-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          imageRendering: smoothing ? 'auto' : 'crisp-edges'
        }}
      />
      
      {/* Fallback текст пока canvas не готов */}
      <span 
        className="text-fallback"
        style={{
          visibility: isReady ? 'hidden' : 'visible',
          fontSize: `${fontSize}px`,
          fontWeight,
          fontFamily,
          color: 'white',
          opacity: 0.7,
          position: isReady ? 'absolute' : 'relative',
          padding: `${fontSize * 0.25}px ${fontSize * 0.5}px`
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default TextMask;