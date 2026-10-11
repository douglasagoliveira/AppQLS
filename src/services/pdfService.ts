import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Project } from '../types';

/**
 * Generates and shares a formal Australian-standard Lighting Specification & RFQ Proposal PDF
 */
export async function generateProjectPdf(project: Project): Promise<string> {
  const roomsHtml = project.rooms
    .map((room, idx) => {
      const item = room.selectedItem;
      if (!item) return '';

      return `
        <div class="room-card">
          <div class="room-header">
            <h3>${idx + 1}. ${room.name}</h3>
            <span class="room-dims">${room.length}m × ${room.width}m (${(room.length * room.width).toFixed(1)} m²) · H: ${room.height}m</span>
          </div>
          
          <div class="room-body">
            <img src="${item.product.imageUrl}" class="product-img" alt="${item.product.name}" />
            <div class="product-details">
              <div class="product-title">${item.product.name}</div>
              <div class="product-sku">SKU: <strong>${item.product.sku}</strong> · Finish: <strong>${item.selectedFinish}</strong></div>
              
              <div class="tech-grid">
                <div class="tech-item"><span class="lbl">Qty:</span> <strong class="val">${item.quantity} units</strong></div>
                <div class="tech-item"><span class="lbl">Power:</span> <span class="val">${item.product.powerWatts}W</span></div>
                <div class="tech-item"><span class="lbl">Output:</span> <span class="val">${item.product.lumens} lm/ea</span></div>
                <div class="tech-item"><span class="lbl">CCT:</span> <span class="val">${item.product.cctKelvin}K</span></div>
                <div class="tech-item"><span class="lbl">CRI:</span> <span class="val">Ra ${item.product.cri}+</span></div>
                <div class="tech-item"><span class="lbl">Beam:</span> <span class="val">${item.product.beamAngle}°</span></div>
                <div class="tech-item"><span class="lbl">IP Rating:</span> <span class="val">${item.product.ipRating}</span></div>
                <div class="tech-item"><span class="lbl">Dimming:</span> <span class="val">${item.product.dimmingType.toUpperCase()}</span></div>
              </div>

              <div class="lux-badge">
                Achieved: <strong>${item.luxAchieved} Lux</strong> (Target Standard: ${room.targetLux} Lux)
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // Bill of Materials (BOM) summary table
  const bomRows = project.rooms
    .map((room) => {
      const item = room.selectedItem;
      if (!item) return '';
      return `
        <tr>
          <td>${room.name}</td>
          <td><strong>${item.product.sku}</strong></td>
          <td>${item.product.name} (${item.selectedFinish})</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">$${item.unitPrice.toFixed(2)} AUD</td>
          <td style="text-align: right; font-weight: bold;">$${item.subtotal.toFixed(2)} AUD</td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>QLS Lighting Proposal - ${project.projectName}</title>
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body { padding: 30px; color: #18181b; background-color: #ffffff; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c29223; padding-bottom: 20px; margin-bottom: 25px; }
          .logo-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #09090b; }
          .logo-sub { font-size: 13px; color: #71717a; text-transform: uppercase; letter-spacing: 1.5px; }
          .quote-meta { text-align: right; font-size: 13px; color: #52525b; }
          .quote-code { font-size: 16px; font-weight: bold; color: #c29223; }
          
          .project-info { background: #f4f4f5; border-radius: 8px; padding: 18px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .info-item .label { font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 600; }
          .info-item .value { font-size: 15px; font-weight: 600; color: #09090b; }

          h2 { font-size: 18px; color: #09090b; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }

          .room-card { border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; }
          .room-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .room-header h3 { margin: 0; font-size: 16px; color: #09090b; }
          .room-dims { font-size: 13px; color: #71717a; }
          .room-body { display: flex; gap: 18px; }
          .product-img { width: 100px; height: 100px; object-fit: cover; border-radius: 6px; border: 1px solid #e4e4e7; }
          .product-details { flex: 1; }
          .product-title { font-size: 15px; font-weight: 700; color: #09090b; margin-bottom: 4px; }
          .product-sku { font-size: 12px; color: #71717a; margin-bottom: 10px; }
          .tech-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #fafafa; padding: 8px 12px; border-radius: 6px; font-size: 12px; }
          .tech-item .lbl { color: #71717a; }
          .tech-item .val { font-weight: 600; color: #18181b; }
          .lux-badge { margin-top: 10px; font-size: 12px; background: #fef9c3; color: #854d0e; padding: 4px 10px; border-radius: 4px; display: inline-block; font-weight: 500; }

          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background: #f4f4f5; text-align: left; padding: 10px; font-weight: 600; color: #3f3f46; border-bottom: 2px solid #e4e4e7; }
          td { padding: 10px; border-bottom: 1px solid #e4e4e7; }

          .totals-card { margin-top: 30px; background: #09090b; color: #ffffff; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
          .totals-metric { font-size: 13px; color: #a1a1aa; }
          .totals-val { font-size: 24px; font-weight: 800; color: #c29223; }

          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #a1a1aa; border-top: 1px solid #e4e4e7; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-title">QLS LIGHTING</div>
            <div class="logo-sub">Factory Architectural & Commercial Specification</div>
          </div>
          <div class="quote-meta">
            <div class="quote-code">RFQ-${project.id.slice(-6).toUpperCase()}</div>
            <div>Date: ${new Date().toLocaleDateString('en-AU')}</div>
            <div>Standard: AS/NZS 1680.1 Compliant</div>
          </div>
        </div>

        <div class="project-info">
          <div class="info-item">
            <div class="label">Project Name</div>
            <div class="value">${project.projectName}</div>
          </div>
          <div class="info-item">
            <div class="label">Client / Reference</div>
            <div class="value">${project.clientName || 'Direct Specification'}</div>
          </div>
          <div class="info-item">
            <div class="label">Site Address</div>
            <div class="value">${project.projectAddress || 'Australia'}</div>
          </div>
          <div class="info-item">
            <div class="label">Total Rooms</div>
            <div class="value">${project.rooms.length} Spaces Engineered</div>
          </div>
        </div>

        <h2>1. Luminaire Schedule & Photometric Summary</h2>
        ${roomsHtml}

        <h2>2. Bill of Materials (BOM) & Quotation Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Space</th>
              <th>SKU Code</th>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Trade Price</th>
              <th style="text-align: right;">Total AUD</th>
            </tr>
          </thead>
          <tbody>
            ${bomRows}
          </tbody>
        </table>

        <div class="totals-card">
          <div>
            <div class="totals-metric">TOTAL FIXTURES: ${project.totalFixturesCount} PCS | CONNECTED LOAD: ${project.totalPowerWatts}W</div>
            <div style="font-size: 14px; color: #d4d4d8; margin-top: 4px;">Formal Request for Quote (RFQ) - Factory Direct Pricing</div>
          </div>
          <div style="text-align: right;">
            <div class="totals-metric">ESTIMATED TOTAL (EX. GST)</div>
            <div class="totals-val">$${project.totalEstimatedCost.toFixed(2)} AUD</div>
          </div>
        </div>

        <div class="footer">
          QLS Lighting Pty Ltd · Certified Australian Standard AS/NZS 1680 Specification · Valid for 30 days from date of issue.
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
    base64: false,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Share QLS Proposal - ${project.projectName}`,
    });
  }

  return uri;
}
