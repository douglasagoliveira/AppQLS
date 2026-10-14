import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Project } from '../types';
import { escapeHtml, safeUrl } from '../lib/escapeHtml';
import { buildBom, computeTotals } from '../lib/projectMath';
import { baseRfqCode, RFQ_DISCLAIMER } from '../lib/rfq';

/**
 * Generates and shares a formal Australian-standard Lighting Specification & RFQ Brief PDF.
 * Uses Lumen Method (AS/NZS 1680) preliminary estimate conventions.
 */
export async function generateProjectPdf(project: Project): Promise<string> {
  const totals = computeTotals(project.rooms, project.additionalItems ?? []);
  const bom = buildBom(project);
  const rfqCode = project.rfqCode || baseRfqCode(project.id);

  const roomsHtml = project.rooms
    .map((room, idx) => {
      const item = room.selectedItem;
      if (!item) return '';

      const p = item.product;
      const isContinuous = p.unit === 'm';
      const qtyLabel = isContinuous ? `${item.quantity} m` : `${item.quantity} units`;
      const sanitizedImg = safeUrl(p.imageUrl);

      const kitRows = (item.kit ?? [])
        .map(
          (k) => `
            <div style="font-size: 11px; color: #52525b; margin-top: 4px;">
              + ${escapeHtml(k.role.toUpperCase())}: <strong>${escapeHtml(k.product.name)}</strong> (${k.quantity} ${k.product.unit === 'm' ? 'm' : 'pc'} · $${k.subtotal.toFixed(2)} AUD)
            </div>
          `
        )
        .join('');

      return `
        <div class="room-card">
          <div class="room-header">
            <h3>${idx + 1}. ${escapeHtml(room.name)}</h3>
            <span class="room-dims">${room.length}m × ${room.width}m (${(room.length * room.width).toFixed(1)} m²) · H: ${room.height}m · ${escapeHtml(room.ceilingType)}</span>
          </div>
          
          <div class="room-body">
            ${sanitizedImg ? `<img src="${sanitizedImg}" class="product-img" alt="${escapeHtml(p.name)}" />` : ''}
            <div class="product-details">
              <div class="product-title">${escapeHtml(p.name)}</div>
              <div class="product-sku">SKU: <strong>${escapeHtml(p.sku)}</strong> · Finish: <strong>${escapeHtml(item.selectedFinish)}</strong></div>
              
              <div class="tech-grid">
                <div class="tech-item"><span class="lbl">Quantity:</span> <strong class="val">${qtyLabel}</strong></div>
                <div class="tech-item"><span class="lbl">Power:</span> <span class="val">${p.powerWatts}${isContinuous ? ' W/m' : ' W'}</span></div>
                <div class="tech-item"><span class="lbl">Output:</span> <span class="val">${p.lumens} lm${isContinuous ? '/m' : '/ea'}</span></div>
                <div class="tech-item"><span class="lbl">CCT:</span> <span class="val">${p.cctKelvin ? `${p.cctKelvin}K` : 'Variable'}</span></div>
                <div class="tech-item"><span class="lbl">CRI:</span> <span class="val">${p.cri ? `Ra ${p.cri}+` : 'N/A'}</span></div>
                <div class="tech-item"><span class="lbl">Beam:</span> <span class="val">${p.beamAngle ? `${p.beamAngle}°` : 'Diffuse'}</span></div>
                <div class="tech-item"><span class="lbl">IP Rating:</span> <span class="val">${escapeHtml(p.ipRating)}</span></div>
                <div class="tech-item"><span class="lbl">Dimming:</span> <span class="val">${escapeHtml(p.dimmingType.toUpperCase())}</span></div>
              </div>

              ${kitRows ? `<div style="margin-top: 8px; padding: 6px 10px; background: #f4f4f5; border-radius: 6px;"><strong>Kit Components:</strong>${kitRows}</div>` : ''}

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
  const bomRows = bom
    .map((line) => `
      <tr>
        <td>${escapeHtml(line.space)}</td>
        <td><strong>${escapeHtml(line.sku)}</strong></td>
        <td>${escapeHtml(line.name)}${line.finish ? ` (${escapeHtml(line.finish)})` : ''}</td>
        <td style="text-align: center;">${line.qty} ${line.unit}</td>
        <td style="text-align: right;">$${line.unitPrice.toFixed(2)} AUD</td>
        <td style="text-align: right; font-weight: bold;">$${line.subtotal.toFixed(2)} AUD</td>
      </tr>
    `)
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>QLS Lighting Specification - ${escapeHtml(project.projectName)}</title>
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body { padding: 30px; color: #18181b; background-color: #ffffff; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d9b277; padding-bottom: 20px; margin-bottom: 25px; }
          .logo-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #0e0e0e; }
          .logo-sub { font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1.5px; }
          .quote-meta { text-align: right; font-size: 13px; color: #52525b; }
          .quote-code { font-size: 16px; font-weight: bold; color: #d9b277; }
          
          .project-info { background: #f4f4f5; border-radius: 8px; padding: 18px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .info-item .label { font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 600; }
          .info-item .value { font-size: 15px; font-weight: 600; color: #0e0e0e; }

          h2 { font-size: 18px; color: #0e0e0e; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }

          .room-card { border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; }
          .room-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .room-header h3 { margin: 0; font-size: 16px; color: #0e0e0e; }
          .room-dims { font-size: 13px; color: #71717a; }
          .room-body { display: flex; gap: 18px; }
          .product-img { width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #e4e4e7; }
          .product-details { flex: 1; }
          .product-title { font-size: 15px; font-weight: 700; color: #0e0e0e; margin-bottom: 4px; }
          .product-sku { font-size: 12px; color: #71717a; margin-bottom: 10px; }
          .tech-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #fafafa; padding: 8px 12px; border-radius: 6px; font-size: 12px; }
          .tech-item .lbl { color: #71717a; }
          .tech-item .val { font-weight: 600; color: #18181b; }
          .lux-badge { margin-top: 10px; font-size: 12px; background: #fef9c3; color: #854d0e; padding: 4px 10px; border-radius: 4px; display: inline-block; font-weight: 500; }

          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background: #f4f4f5; text-align: left; padding: 10px; font-weight: 600; color: #3f3f46; border-bottom: 2px solid #e4e4e7; }
          td { padding: 10px; border-bottom: 1px solid #e4e4e7; }

          .totals-card { margin-top: 30px; background: #0e0e0e; color: #ffffff; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
          .totals-metric { font-size: 13px; color: #a1a1aa; }
          .totals-val { font-size: 24px; font-weight: 800; color: #d9b277; }

          .disclaimer-box { margin-top: 25px; background: #fafafa; border-left: 4px solid #d9b277; padding: 12px 16px; font-size: 12px; color: #52525b; line-height: 1.5; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #a1a1aa; border-top: 1px solid #e4e4e7; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-title">QLS LIGHTING</div>
            <div class="logo-sub">Technical Specification & RFQ Brief · Official LEDYi Reseller</div>
          </div>
          <div class="quote-meta">
            <div class="quote-code">${escapeHtml(rfqCode)}</div>
            <div>Date: ${new Date().toLocaleDateString('en-AU')}</div>
            <div>Standard: AS/NZS 1680.1 Compliant</div>
          </div>
        </div>

        <div class="project-info">
          <div class="info-item">
            <div class="label">Project Name</div>
            <div class="value">${escapeHtml(project.projectName)}</div>
          </div>
          <div class="info-item">
            <div class="label">Client / Reference</div>
            <div class="value">${escapeHtml(project.clientName || 'Direct Specification')}</div>
          </div>
          <div class="info-item">
            <div class="label">Site Address</div>
            <div class="value">${escapeHtml(project.projectAddress || 'Australia')}</div>
          </div>
          <div class="info-item">
            <div class="label">Spaces Engineered</div>
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
            <div class="totals-metric">LUMINAIRES: ${totals.pieces} PCS · LINEAR: ${totals.linearMetres} M · CONNECTED LOAD: ${totals.watts} W</div>
            <div style="font-size: 13px; color: #d4d4d8; margin-top: 4px;">Request for Quote (RFQ) — Indicative Pricing</div>
          </div>
          <div style="text-align: right;">
            <div class="totals-metric">ESTIMATED TOTAL (EX. GST)</div>
            <div class="totals-val">$${totals.cost.toFixed(2)} AUD</div>
          </div>
        </div>

        <div class="disclaimer-box">
          <strong>Important Notice:</strong> ${escapeHtml(RFQ_DISCLAIMER)}
        </div>

        <div class="footer">
          QLS Lighting Pty Ltd · Official LEDYi Lighting Reseller · AS/NZS 1680.1 Specification Assistant · Valid for 30 days.
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
      dialogTitle: `Share QLS Specification - ${project.projectName}`,
    });
  }

  return uri;
}
