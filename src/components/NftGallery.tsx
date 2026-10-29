import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Send,
  Layers,
  ShieldCheck,
  X,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NFTItem, FiatCurrency, LanguageCode, Transaction, WalletAccount } from '../types';
import { formatFiat } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';
import { CHAINS_CONFIG } from '../data/mockData';

interface NftGalleryProps {
  nfts: NFTItem[];
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
  onTransferNft: (nft: NFTItem, recipient: string, newTx: Transaction) => void;
}

export const NftGallery: React.FC<NftGalleryProps> = ({
  nfts,
  currentFiat,
  currentLang,
  activeAccount,
  onTransferNft,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('@daryn_kz');
  const [isTransferring, setIsTransferring] = useState(false);

  const totalNftValueUsd = nfts.reduce((sum, item) => sum + item.estimatedUsd, 0);

  const handleExecuteTransfer = () => {
    if (!selectedNft || !transferRecipient.trim()) return;

    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);

      const newTx: Transaction = {
        id: `tx-nft-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        type: 'send',
        chainId: selectedNft.chainId,
        assetSymbol: selectedNft.name,
        amount: 1,
        usdValue: selectedNft.estimatedUsd,
        timestamp: Date.now(),
        status: 'completed',
        from: activeAccount.address,
        to: transferRecipient,
        feeUsd: 0.12,
        category: 'Transfers',
        note: `Transferred ${selectedNft.name} (${selectedNft.collection})`,
        recipientTag: transferRecipient.startsWith('@') ? transferRecipient : undefined,
      };

      try {
        confetti({ particleCount: 75, spread: 55, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      onTransferNft(selectedNft, transferRecipient, newTx);
      setTransferModalOpen(false);
      setSelectedNft(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.nftCollection}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Cross-Chain ERC-721 / Metaplex
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Certified digital collectibles verified on Ethereum, Solana, Base, and TON.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Total Portfolio Floor</div>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatFiat(totalNftValueUsd, currentFiat)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {nfts.length} Collectibles Verified
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {nfts.map((nft) => {
          const chain = CHAINS_CONFIG[nft.chainId];

          return (
            <div
              key={nft.id}
              onClick={() => setSelectedNft(nft)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Image Frame with fallback container */}
              <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                <img
                  src={nft.imageUrl}
                  alt={nft.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to geometric canvas if image missing
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: chain?.iconBg || '#A855F7' }}
                  />
                  <span>{chain?.name}</span>
                </div>

                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono font-semibold text-purple-300 border border-purple-500/30">
                  {nft.rarityRank}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium truncate">
                    {nft.collection}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {nft.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      {t.floorPrice}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {nft.floorPrice} {nft.floorCurrency}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Valuation</div>
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatFiat(nft.estimatedUsd, currentFiat)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NFT Detail Modal */}
      {selectedNft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {selectedNft.collection}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-400 font-mono">{selectedNft.tokenId}</span>
              </div>
              <button
                onClick={() => setSelectedNft(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left Column: Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                <img
                  src={selectedNft.imageUrl}
                  alt={selectedNft.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Column: Details & Actions */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {selectedNft.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-mono">
                      Rarity Score: {selectedNft.rarityScore}/100
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono">
                      {CHAINS_CONFIG[selectedNft.chainId]?.name}
                    </span>
                  </div>

                  {/* Attributes Matrix */}
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">
                      Traits & Attributes
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedNft.attributes.map((attr, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                        >
                          <div className="text-[10px] text-slate-400 uppercase">{attr.trait_type}</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {attr.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Valuation & Transfer Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estimated Market Value:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatFiat(selectedNft.estimatedUsd, currentFiat)}
                    </span>
                  </div>

                  <button
                    onClick={() => setTransferModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.transferNft}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer NFT Modal */}
      {transferModalOpen && selectedNft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Transfer Collectible
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Transfer {selectedNft.name} to another wallet or @CryptoTag
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Recipient Tag or Address
                </label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="@tag or 0x..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setTransferModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteTransfer}
                  disabled={isTransferring || !transferRecipient.trim()}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isTransferring ? 'Broadcasting...' : 'Confirm Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
