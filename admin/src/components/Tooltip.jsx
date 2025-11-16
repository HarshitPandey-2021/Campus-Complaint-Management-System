import { useState, useEffect, useRef } from 'react';

export default function Tooltip({ children, text, position = 'bottom' }) {
  const [show, setShow] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickAnywhere = () => {
      setShow(false);
    };

    if (show) {
      document.addEventListener('click', handleClickAnywhere);
    }

    return () => {
      document.removeEventListener('click', handleClickAnywhere);
    };
  }, [show]);

  if (!text) return <>{children}</>;

  const handleMouseEnter = () => {
    setShow(true);
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  const handleClick = (e) => {
    setShow(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      
      {show && (
        <div className={`absolute z-[100] pointer-events-none ${
          position === 'top' 
            ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' 
            : position === 'left'
            ? 'right-full top-1/2 -translate-y-1/2 mr-2'
            : position === 'right'
            ? 'left-full top-1/2 -translate-y-1/2 ml-2'
            : 'top-full left-1/2 -translate-x-1/2 mt-2'
        }`}>
          <div className="relative">
            {/* Tooltip box */}
            <div className="px-3 py-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap border border-gray-700 dark:border-gray-500 animate-tooltipFade">
              {text}
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-lg"></div>
            </div>
            
            {/* Arrow */}
            <div className={`absolute ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -mt-[3px]'
                : position === 'left'
                ? 'left-full top-1/2 -translate-y-1/2 -ml-[3px]'
                : position === 'right'
                ? 'right-full top-1/2 -translate-y-1/2 -mr-[3px]'
                : 'bottom-full left-1/2 -translate-x-1/2 -mb-[3px]'
            }`}>
              <div className={`w-0 h-0 ${
                position === 'top'
                  ? 'border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 dark:border-t-gray-700'
                  : position === 'left'
                  ? 'border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900 dark:border-l-gray-700'
                  : position === 'right'
                  ? 'border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-gray-900 dark:border-r-gray-700'
                  : 'border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-900 dark:border-b-gray-700'
              }`}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}