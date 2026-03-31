import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const QRCodeGenerator: React.FC = () => {
  const [showQR, setShowQR] = useState(false)
  const currentUrl = 'http://192.168.0.106:5173'

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas')
    if (!canvas) return
    
    const svg = canvas.querySelector('svg')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas2 = document.createElement('canvas')
    const ctx = canvas2.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas2.width = img.width
      canvas2.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngUrl = canvas2.toDataURL('image/png')
      
      const link = document.createElement('a')
      link.download = 'qrcode-site.png'
      link.href = pngUrl
      link.click()
    }
    
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl)
    alert('Ссылка скопирована в буфер обмена!')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowQR(!showQR)}
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] right-[max(0.75rem,env(safe-area-inset-right,0px))] z-[1000] max-w-[min(280px,calc(100vw-1rem))] truncate rounded-full border-0 bg-[#4CAF50] px-3 py-2.5 text-sm font-bold text-white shadow-md sm:px-6 sm:text-base"
      >
        📱 Поделиться
      </button>

      {showQR && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowQR(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              maxWidth: '90%',
              width: '320px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0' }}>Перейти на сайт</h3>
            
            <div id="qr-code-canvas" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <QRCodeSVG
                value={currentUrl}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            
            <p style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '16px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
              {currentUrl}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button onClick={downloadQR} style={{ flex: 1, background: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>
                💾 Скачать
              </button>
              <button onClick={copyUrl} style={{ flex: 1, background: '#FF9800', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>
                📋 Копировать
              </button>
            </div>
            
            <button onClick={() => setShowQR(false)} style={{ width: '100%', background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>
              ✖ Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default QRCodeGenerator