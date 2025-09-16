import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SalesTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SalesTermsModal({ isOpen, onClose }: SalesTermsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {t("licenses.terms.sales_terms")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="prose prose-gray max-w-none text-sm leading-relaxed">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ELTL ePood MÜÜGITINGIMUSED</h3>

            <p className="mb-4">
              Veebipoe "ELTL ePood" (edaspidi Veebipood) omanik on <strong>Eesti Lauatenniseliit</strong> (registrikood 80079180).
            </p>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">Müügilepingu kehtivus, kauba- ja hinnainfo</h4>
              <p className="mb-3">
                Käesolevad Eesti Lauatenniseliidu (edaspidi ELTL) müügitingimused kehtivad internetiaadressil www.eltl.ee asuvas Veebipoes ostja (edaspidi Klient) ja müüja ELTL (edaspidi ka müüja) vahel müügitehingu sõlmimisel kaupade ja teenuste ostmiseks.
              </p>
              <ul className="space-y-2 mb-3">
                <li>• Veebipoes müüdavate toodete hinnad on märgitud toodete juurde</li>
                <li>• Hinnale lisandub tasu kauba kättetoimetamise eest</li>
                <li>• Kõik Veebipoes müüdavate kaupade hinnad on eurodes</li>
                <li>• Teave kauba ja/või teenuse kohta on esitatud Veebipoes vahetult toote juures</li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">Tellimuse vormistamine</h4>
              <p className="mb-3">
                Tellimuse esitamiseks valib Klient soovitud teenused ja/või tooted ehk lisab need ostukorvi. Tellimuse vormistamiseks tuleb vajutada ostukorvis lingile „Maksma".
              </p>
              <p className="mb-3">
                Avanenud ankeedil tuleb Kliendil sisestada oma info. Sisestatud andmetele vormistatakse tellimus ning väljastatakse vajadusel arve. Enne tellimuse sooritamist peab Klient nõustuma käesolevate müügitingimustega, märkides „Nõustun tingimustega".
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">Maksevõimalused</h4>
              <p className="mb-3">Veebipoes saab tasuda turvaliselt läbi järgnevate makseviiside:</p>
              <ul className="space-y-1 mb-3">
                <li>• Eesti pangamaksed</li>
                <li>• Soome pangamaksed</li>
                <li>• Läti pangamaksed</li>
                <li>• Leedu pangamaksed</li>
                <li>• Visa/Mastercard kaardimaksed</li>
                <li>• Apple Pay ja Google Pay</li>
                <li>• Maksa hiljem lahendused</li>
              </ul>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>NB!</strong> Pangalingiga tasumisel vajutada kindlasti panga lehel nupule „Tagasi kaupmehe juurde".
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">Kohaletoimetamine</h4>
              <p className="mb-3">
                Kaupade kohaletoimetamist posti teenuse, pakiautomaatide ja kullerfirmade kaudu üldjuhul ei toimu – füüsiliste kaupade kättesaamine toimub ELTLi kontorist kokkulepitud ajal.
              </p>
              <p className="mb-3">
                Elektrooniliste kaupade puhul ei toimu kauba kohaletoimetamist, vaid kliendile tagatakse peale kauba eest tasumist ligipääs toodete/teenuste kasutamiseks elektroonilises ELTL keskkonnas.
              </p>
              <p className="mb-3">
                Ostetud litsentsid kuvatakse peale ostu sooritamist klubi sportlaste nimistus, isiklike sportlaste nimistus või isiklike litsentside nimistus.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">Taganemisõigus</h4>
              <p className="mb-3">
                Pärast tellimuse kättesaamist on Kliendil (võlaõigusseaduse § 1 lg 5 tähenduses) õigus ELTLiga sõlmitud lepingust füüsilise toote ostmiseks taganeda põhjust avaldamata 14. päeva jooksul alates kauba kättesaamisest.
              </p>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-3">
                <p className="text-sm text-red-800">
                  <strong>Tähelepanu:</strong> Sportlase litsentsi, koolituse ostmisest ja võistlusele registreerumisest taganeda pole võimalik.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">Isikuandmete töötlemine</h4>
              <p className="mb-3">
                Klient annab Veebipoes andmeid sisestades ning vastava kinnitusega õiguse koguda ja töödelda enda isikuandmeid (nimi, kontakttelefon, paki kättetoimetamise ja/või kodune aadress, e-postiaadress, tarbijaeelistused).
              </p>
              <p className="mb-3">
                Täpsem informatsioon isikuandmete töötlemise kohta on toodud ELTLi kliendiandmete töötlemise põhimõtetes, mis on kättesaadavad Veebipoe kodulehel.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">Vaidluste lahendamine</h4>
              <p className="mb-3">
                Kui ostjal on Veebipoe osas pretensioone, tuleb need saata e-kirja aadressile <strong>info@eltl.ee</strong>.
              </p>
              <p className="mb-3">
                Kui ostja ja Veebipood ei suuda lahendada vaidlust kokkuleppe teel, siis on ostjal võimalik pöörduda Tarbijavaidluste komisjoni poole. Ostja kaebuse läbivaatamine komisjonis on tasuta.
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
