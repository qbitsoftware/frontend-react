import { Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ShareSection({ tournamentId }: { tournamentId: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleShare = async () => {
    const url = `${window.location.origin}/voistlused/${tournamentId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL');
      }

      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="border-t pt-6">
      <p className="text-sm text-gray-500 mb-3">
        {t('competitions.share.title')}
      </p>
      <button
        type="button"
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-3 px-4 font-medium transition-all duration-200"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-green-600">
              {t('competitions.share.copied')}
            </span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>{t('competitions.share.button')}</span>
          </>
        )}
      </button>
    </div>
  );
}