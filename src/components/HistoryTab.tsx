import React, { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Percent,
  CreditCard,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { Transaction, FiatCurrency, LanguageCode, WalletAccount } from '../types';
import { formatCrypto, formatFiat } from '../utils/currency';
import { downloadTransactionsCSV, printOrDownloadTaxPDF } from '../utils/export';
import { TRANSLATIONS } from '../i18n/translations';
import { CHAINS_CONFIG } from '../data/mockData';

interface HistoryTabProps {
  transactions: Transaction[];
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
  totalNetWorth: number;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  transactions,
  currentFiat,
  currentLang,
  activeAccount,
  totalNetWorth,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const filteredTxs = transactions.filter((tx) => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesQuery =
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.assetSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  });

  const getTxIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
      case 'swap':
        return <ArrowLeftRight className="w-4 h-4 text-indigo-500" />;
      case 'stake':
      case 'unstake':
      case 'reward':
        return <Percent className="w-4 h-4 text-amber-500" />;
      case 'buy':
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner & Exports */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.taxReport}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              IRS / KGD Compliant
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically signed ledger history ready for tax filing and audit
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => downloadTransactionsCSV(transactions, currentFiat)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={() =>
              printOrDownloadTaxPDF(transactions, currentFiat, activeAccount.name, totalNetWorth)
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'send', label: 'Sent' },
              { id: 'receive', label: 'Received' },
              { id: 'swap', label: 'Swaps' },
              { id: 'stake', label: 'Staking' },
              { id: 'buy', label: 'Onramp' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  typeFilter === f.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by hash, tag, note..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4 sm:px-6">Type & Network</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Valuation</th>
                <th className="py-3 px-4">Party / Tag</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 sm:px-6 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTxs.map((tx) => {
                const chain = CHAINS_CONFIG[tx.chainId];
                const isSent = tx.type === 'send';
                const isReceived = tx.type === 'receive' || tx.type === 'reward';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    {/* Type & Network */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {getTxIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                            {tx.type}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {chain?.name || tx.chainId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div
                        className={`font-mono font-bold tabular-nums ${
                          isSent ? 'text-rose-500' : isReceived ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isSent ? '-' : isReceived ? '+' : ''}
                        {tx.amount} {tx.assetSymbol}
                      </div>
                    </td>

                    {/* Valuation */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                        {formatFiat(tx.usdValue, currentFiat)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Fee: {formatFiat(tx.feeUsd, currentFiat)}
                      </div>
                    </td>

                    {/* Party / Tag */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {tx.recipientTag || tx.recipientPhone || tx.to}
                      </div>
                      {tx.note && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {tx.note}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {tx.category}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-[11px] text-slate-400">
                      {new Date(tx.timestamp).toLocaleDateString()}{' '}
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                    Transaction Details ({selectedTx.type})
                  </h3>
                  <div className="text-[11px] text-emerald-500 font-semibold">
                    Status: Verified on Blockchain
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Total Transferred:</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {selectedTx.amount} {selectedTx.assetSymbol} ({formatFiat(selectedTx.usdValue, currentFiat)})
                </span>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Network:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {CHAINS_CONFIG[selectedTx.chainId]?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Category:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTx.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Network Fee:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {formatFiat(selectedTx.feeUsd, currentFiat)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Timestamp:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {new Date(selectedTx.timestamp).toUTCString()}
                  </span>
                </div>
              </div>

              {/* Transaction Hash */}
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                  Transaction Hash
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate flex-1">
                    {selectedTx.hash}
                  </span>
                  <button
                    onClick={() => handleCopyHash(selectedTx.hash)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                    title="Copy Hash"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`${CHAINS_CONFIG[selectedTx.chainId]?.explorerUrl || '#'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-500"
                    title="View in Block Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
