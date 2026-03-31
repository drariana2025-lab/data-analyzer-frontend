import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const QRCodeShare = () => {
  const [showQR, setShowQR] = useState(false)
  
  const currentUrl = window.location.href

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
      ctx.drawImage(img, 0, 0)
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
    <div style={styles.container}>
      <button 
        onClick={() => setShowQR(!showQR)} 
        style={styles.button}
        title="Поделиться сайтом"
      >
        📱 Поделиться
      </button>

      {showQR && (
        <div style={styles.modal}>
          <div style={styles.qrContainer}>
            <h3 style={styles.title}>Перейти на сайт</h3>
            
            <div id="qr-code-canvas" style={styles.qrWrapper}>
              <QRCodeSVG 
                value={currentUrl}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            
            <p style={styles.url}>{currentUrl}</p>
            
            <div style={styles.buttons}>
              <button onClick={downloadQR} style={styles.downloadBtn}>
                💾 Скачать QR-код
              </button>
              <button onClick={copyUrl} style={styles.copyBtn}>
                📋 Скопировать ссылку
              </button>
            </div>
            
            <button 
              onClick={() => setShowQR(false)} 
              style={styles.closeBtn}
            >
              ✖ Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '12px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
    fontWeight: 'bold',
  },
  modal: {
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
  },
  qrContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    maxWidth: '90%',
    width: '320px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#333',
    fontSize: '18px',
  },
  qrWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  url: {
    fontSize: '12px',
    color: '#666',
    wordBreak: 'break-all',
    marginBottom: '16px',
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '4px',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
  },
  downloadBtn: {
    flex: 1,
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  copyBtn: {
    flex: 1,
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  closeBtn: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
  },
}

export default QRCodeShare