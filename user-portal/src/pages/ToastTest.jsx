import React, { useState } from 'react';
import { RiCheckFill, RiCloseLine } from 'react-icons/ri';

const ToastTest = () => {
  const [toast, setToast] = useState(null);

  const showToast = () => {
    setToast('🎉 This is a test toast!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={showToast}
        className="px-8 py-4 bg-green-500 text-white font-bold text-xl rounded-lg hover:bg-green-600"
      >
        CLICK ME - SHOW TOAST
      </button>

      {/* INLINE TOAST - NO CONTEXT, NO PORTAL, NOTHING */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            backgroundColor: '#10B981',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <RiCheckFill style={{ fontSize: '24px' }} />
          <span style={{ flex: 1 }}>{toast}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RiCloseLine />
          </button>
        </div>
      )}
    </div>
  );
};

export default ToastTest;
