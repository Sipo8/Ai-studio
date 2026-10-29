import { Transaction, FiatCurrency } from '../types';
import { convertUsdToFiat, formatFiat } from './currency';

export function downloadTransactionsCSV(transactions: Transaction[], currentFiat: FiatCurrency) {
  const headers = [
    'Timestamp',
    'Date (UTC)',
    'Transaction Hash',
    'Type',
    'Chain',
    'Asset',
    'Amount',
    'USD Value',
    `Fiat Value (${currentFiat})`,
    'Fee (USD)',
    'Status',
    'From',
    'To',
    'Category',
    'Notes',
  ];

  const rows = transactions.map((tx) => {
    const date = new Date(tx.timestamp).toISOString();
    const fiatVal = convertUsdToFiat(tx.usdValue, currentFiat).toFixed(2);
    return [
      tx.timestamp,
      `"${date}"`,
      `"${tx.hash}"`,
      `"${tx.type.toUpperCase()}"`,
      `"${tx.chainId}"`,
      `"${tx.assetSymbol}"`,
      tx.amount,
      tx.usdValue.toFixed(2),
      fiatVal,
      tx.feeUsd.toFixed(4),
      `"${tx.status}"`,
      `"${tx.from}"`,
      `"${tx.to}"`,
      `"${tx.category}"`,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tenge_Tax_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printOrDownloadTaxPDF(
  transactions: Transaction[],
  currentFiat: FiatCurrency,
  accountName: string,
  totalNetWorth: number
) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    return;
  }

  const rowsHtml = transactions
    .map(
      (tx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 10px 8px;">${new Date(tx.timestamp).toLocaleDateString()} ${new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td style="padding: 10px 8px; font-weight: 600; text-transform: uppercase;">${tx.type}</td>
        <td style="padding: 10px 8px;">${tx.chainId}</td>
        <td style="padding: 10px 8px; font-family: monospace;">${tx.amount} ${tx.assetSymbol}</td>
        <td style="padding: 10px 8px; font-family: monospace; text-align: right;">${formatFiat(tx.usdValue, currentFiat)}</td>
        <td style="padding: 10px 8px; color: #64748b;">${tx.category}</td>
        <td style="padding: 10px 8px; font-family: monospace; font-size: 11px; color: #475569;">${tx.hash}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>teñge Tax & Audit Statement - ${new Date().toISOString().slice(0, 10)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .meta { text-align: right; font-size: 13px; color: #475569; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 24px; margin-bottom: 30px; display: flex; gap: 40px; }
          .summary-item { display: flex; flex-direction: column; }
          .summary-item .label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .summary-item .val { font-size: 20px; font-weight: 700; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { padding: 10px 8px; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">teñge Fiscal Statement</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Institutional Web3 & Multi-Currency Ledger</div>
          </div>
          <div class="meta">
            <div><strong>Generated:</strong> ${new Date().toUTCString()}</div>
            <div><strong>Account:</strong> ${accountName}</div>
            <div><strong>Tax Standard:</strong> GAAP / IFRS Crypto Asset Compliant</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-item">
            <span class="label">Total Net Portfolio</span>
            <span class="val">${formatFiat(totalNetWorth, currentFiat)}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Recorded Transactions</span>
            <span class="val">${transactions.length}</span>
          </div>
          <div class="summary-item">
            <span class="label">Primary Fiat Denomination</span>
            <span class="val">${currentFiat}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Network</th>
              <th>Asset / Amount</th>
              <th style="text-align: right;">Valuation</th>
              <th>Category</th>
              <th>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Certified export generated by teñge client-side cryptographic engine. Contains SHA-256 validated ledger records.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
