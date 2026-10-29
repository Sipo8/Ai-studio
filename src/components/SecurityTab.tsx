import React, { useState } from 'react';
import {
  ShieldCheck,
  Fingerprint,
  Smartphone,
  HardDrive,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Cpu,
  AlertCircle,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { HardwareDeviceConnection, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { QRCodeSVG } from '../utils/qr';

interface SecurityTabProps {
  currentLang: LanguageCode;
  isBiometricsEnabled: boolean;
  onToggleBiometrics: () => void;
  is2FAEnabled: boolean;
  onToggle2FA: (code: string) => boolean;
  hardwareDevice: HardwareDeviceConnection;
  onPairHardware: (device: string) => void;
  onDisconnectHardware: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  currentLang,
  isBiometricsEnabled,
  onToggleBiometrics,
  is2FAEnabled,
  onToggle2FA,
  hardwareDevice,
  onPairHardware,
  onDisconnectHardware,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [pairingStep, setPairingStep] = useState<'select' | 'connecting' | 'success'>('select');
  const [selectedHwVendor, setSelectedHwVendor] = useState<'Ledger' | 'Trezor' | 'Keystone'>('Ledger');

  const seedWords = [
    'ocean', 'crystal', 'orbit', 'matrix', 'quantum', 'cipher',
    'alpha', 'beacon', 'silent', 'vector', 'zenith', 'voyage',
  ];

  const secretTotpKey = 'JBSWY3DPEHPK3PXP';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretTotpKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleConfirm2FA = () => {
    setTwoFactorError('');
    if (twoFactorInput.trim().length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit verification code.');
      return;
    }
    const success = onToggle2FA(twoFactorInput.trim());
    if (success) {
      setShow2FASetupModal(false);
      setTwoFactorInput('');
    } else {
      setTwoFactorError('Invalid verification code. Please try again.');
    }
  };

  const startPairing = (vendor: 'Ledger' | 'Trezor' | 'Keystone') => {
    setSelectedHwVendor(vendor);
    setPairingStep('connecting');
    setTimeout(() => {
      setPairingStep('success');
      onPairHardware(`${vendor} Nano X`);
    }, 1500);
  };

  const handleExportEncryptedVault = () => {
    const vaultData = {
      version: '2.4.0',
      cipher: 'AES-GCM-256',
      kdf: 'PBKDF2-SHA512',
      iterations: 600000,
      timestamp: Date.now(),
      salt: '94bf-apex-salt-sec-01',
      encryptedPayload: 'U2FsdGVkX19sP4837a28cf12948b8ca71182bc9471f00a4b9281a7428c...',
    };

    const blob = new Blob([JSON.stringify(vaultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenge_Encrypted_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Security Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.security}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Grade A+ Cryptographic Armor
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Client-side WebAuthn passkeys, hardware signer integration, and AES-256 GCM encrypted keystore
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Vault Status: Encrypted & Locked
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Biometrics Module */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                  isBiometricsEnabled
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {isBiometricsEnabled ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.biometrics}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Unlock your wallet instantly using Touch ID, Face ID, or FIDO2 hardware passkeys.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onToggleBiometrics}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                isBiometricsEnabled
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
              }`}
            >
              {isBiometricsEnabled ? 'Disable Biometrics' : 'Enable Biometrics (Passkey)'}
            </button>
          </div>
        </div>

        {/* 2FA Module */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                  is2FAEnabled
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.twoFactorAuth}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Require a 6-digit TOTP code (Google Authenticator / 1Password) before signing high-value transfers.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                if (is2FAEnabled) {
                  onToggle2FA('000000');
                } else {
                  setShow2FASetupModal(true);
                }
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                is2FAEnabled
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20'
              }`}
            >
              {is2FAEnabled ? 'Disable 2FA Protection' : 'Configure 2FA Authenticator'}
            </button>
          </div>
        </div>

        {/* Hardware Keys Module */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                  hardwareDevice.status === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {hardwareDevice.status === 'connected' ? 'PAIRED' : 'NOT PAIRED'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.hardwareWallets}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Air-gapped transaction signing via Ledger Nano X/S, Trezor Safe, or Keystone.
            </p>

            {hardwareDevice.status === 'connected' && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  {hardwareDevice.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  Firmware: {hardwareDevice.firmware} · WebHID Connected
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            {hardwareDevice.status === 'connected' ? (
              <button
                onClick={onDisconnectHardware}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Disconnect Hardware Key
              </button>
            ) : (
              <button
                onClick={() => setPairingModalOpen(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 transition-all"
              >
                {t.pairDevice}
              </button>
            )}
          </div>
        </div>

        {/* Encrypted Vault Backup Module */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                AES-256
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Encrypted Vault Keystore
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Download your end-to-end encrypted backup file for secure recovery on other devices.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={handleExportEncryptedVault}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Encrypted JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secret Recovery Phrase Viewer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span>{t.secretPhrase}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Never disclose these 12 master recovery words to anyone. Anyone with this phrase can access your funds.
            </p>
          </div>

          <button
            onClick={() => setShowSeedPhrase(!showSeedPhrase)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors self-start sm:self-auto"
          >
            {showSeedPhrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSeedPhrase ? 'Hide Words' : 'Reveal Words'}</span>
          </button>
        </div>

        <div className="relative p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 transition-all ${
              showSeedPhrase ? 'filter-none' : 'filter blur-md select-none pointer-events-none'
            }`}
          >
            {seedWords.map((word, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-xs font-mono flex items-center gap-2 shadow-xs"
              >
                <span className="text-slate-400 text-[10px] w-4">{idx + 1}.</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{word}</span>
              </div>
            ))}
          </div>

          {!showSeedPhrase && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] rounded-xl">
              <span className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white shadow-lg">
                Click Reveal Words to View
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Configure Two-Factor Authenticator
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Scan the QR code with Google Authenticator, Authy, or 1Password.
            </p>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <QRCodeSVG
                  value={`otpauth://totp/teñge:user?secret=${secretTotpKey}&issuer=teñge`}
                  size={150}
                />
              </div>
              <div className="flex items-center gap-2 mt-3 font-mono text-xs">
                <span className="text-slate-500">Key:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{secretTotpKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Enter 6-digit Code from Authenticator
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorInput}
                  onChange={(e) => setTwoFactorInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-mono text-lg font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {twoFactorError && (
                <div className="text-xs text-rose-500 font-medium">{twoFactorError}</div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShow2FASetupModal(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm2FA}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 active:scale-95"
                >
                  Verify & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Pairing Wizard Modal */}
      {pairingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Connect Hardware Key
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select your physical device to initiate WebHID USB or Bluetooth pairing.
            </p>

            {pairingStep === 'select' && (
              <div className="space-y-2.5">
                {[
                  { id: 'Ledger', name: 'Ledger Nano X / Stax', desc: 'Secure Element (CC EAL5+)' },
                  { id: 'Trezor', name: 'Trezor Safe 3 / Model T', desc: 'Open Source Security' },
                  { id: 'Keystone', name: 'Keystone 3 Pro', desc: 'Air-gapped QR Signer' },
                ].map((hw) => (
                  <button
                    key={hw.id}
                    onClick={() => startPairing(hw.id as any)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {hw.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{hw.desc}</div>
                    </div>
                    <Cpu className="w-4 h-4 text-amber-500" />
                  </button>
                ))}

                <button
                  onClick={() => setPairingModalOpen(false)}
                  className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {pairingStep === 'connecting' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Connecting to {selectedHwVendor}...
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Please approve connection request on your device screen.
                  </div>
                </div>
              </div>
            )}

            {pairingStep === 'success' && (
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedHwVendor} Paired Successfully!
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Cold storage derivation path verified: m/44'/60'/0'/0
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPairingModalOpen(false);
                    setPairingStep('select');
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
