import QRCode from 'qrcode';

export const printQRCodeToBlankSheet = async (url: string, title?: string) => {
  try {
    const qrDataURL = await QRCode.toDataURL(url, {
      width: 500,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${title || 'Bracket'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px;
            }
            
            .qr-card {
              background: white;
              border-radius: 24px;
              padding: 48px 40px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              text-align: center;
              max-width: 500px;
              width: 100%;
              position: relative;
              overflow: hidden;
            }
            
            .qr-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
            }
            
            .title {
              font-size: 45px;
              font-weight: 700;
              color: #1a202c;
              margin-bottom: 8px;
              letter-spacing: -0.025em;
            }

            .subtitle-1 {
              font-size: 35px;
              color: #555f6fff;
              margin-bottom: 16px;
              font-weight: 500;
            }

            .subtitle {
              font-size: 30px;
              color: #718096;
              margin-bottom: 16px;
              font-weight: 500;
            }
            
            .qr-wrapper {
              background: #f8fafc;
              border-radius: 20px;
              padding: 10px;
              margin: 24px 0 0px 0;
              display: inline-block;
              border: 3px solid #e2e8f0;
            }
            
            .qr-code img {
              display: block;
              border-radius: 12px;
            }
            
            .url-section {
              background: #f7fafc;
              border-radius: 12px;
              padding: 16px;
              margin: 24px 0;
              border: 1px solid #e2e8f0;
            }
            
            .url-label {
              font-size: 12px;
              font-weight: 600;
              color: #4a5568;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
            }
            
            .url {
              font-size: 14px;
              color: #2d3748;
              word-break: break-all;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              line-height: 1.4;
            }
            
            .instructions {
              font-size: 18px;
              color: #4a5568;
              line-height: 1.6;
              padding: 0px 0;
              margin-top: 8px;
            }
            
            .scan-icon {
              width: 18px;
              height: 18px;
              display: inline-block;
              margin-right: 8px;
              vertical-align: middle;
            }
            
            @media print {
              body {
                background: white !important;
                padding: 20px !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .qr-card {
                box-shadow: none !important;
                border: 2px solid #e2e8f0 !important;
                page-break-inside: avoid;
              }
              
              
              @page {
                margin: 0.5in;
                size: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            ${title ? `
              <div class="title">${title}</div>
              <div class="subtitle-1">Reaalajas Turniiri Tabel Sinu Telefonis</div>
              <div class="subtitle-1">Live Tournament Bracket On Your Phone</div>
            ` : ''}
            
            <div class="qr-wrapper">
              <div class="qr-code">
                <img src="${qrDataURL}" alt="QR Code" width="300" height="300" />
              </div>
            </div>
            
            <div class="url-section">
              <div class="url">${url}</div>
            </div>
            
            <div class="instructions">
              Skänni oma nutivahendiga QR-koodi, et näha turniiritabelit. 
            </div>
            <div class="instructions">
              Scan this QR code with your mobile device camera to access the tournament bracket
            </div>

          </div>
        </body>
      </html>
    `;

    const doc = printWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();

    const img = new Image();
    img.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 100);
    };
    img.src = qrDataURL;

  } catch (error) {
    console.error('Error generating QR code for print:', error);
    throw error;
  }
};
