import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LicenseTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseTermsModal({ isOpen, onClose }: LicenseTermsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("licenses.terms.license_purchase_terms")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="prose prose-gray max-w-none text-sm leading-relaxed">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ELTL Litsents</h3>
              <p className="mb-4 font-medium">ELTL Litsentseeritud sportlasena* annan kinnituse, et:</p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>täidan ELTL-i reegleid, põhikirja, juhendeid, direktiive ning nende alusel ja nendega kooskõlas vastu võetud otsuseid;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>olen teadlik dopinguainete ja meetodite kasutamise keelust ning nõustun andma dopinguproove vastavalt Eesti dopinguvastastele reeglitele (EDR);</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>olen teadlik spordivõistluste manipuleerimise ja tõkestamise reeglitest ning nõustun alluma seadustele ja kordadele, mis võimaldavad vastavaid situatsioone vältima ning kohustun tegema ELTL-iga täielikku koostööd võitlemaks selliste tegude vastu;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>hoidun igasugusest käitumisest, mis kahjustab või võib kahjustada ELTL-i poolt organiseeritud või korraldatud võistluste Ausa mängu põhimõtet vastavalt ELTL-i distsiplinaarmäärusele ning kohustun tegema ELTL-iga täielikku koostööd võitlemaks selliste tegude vastu.</span>
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Isikuandmete kaitse:</h3>

              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>olen teadlik, et vastavalt Spordiseaduse mõistes „Sporditulemuste töötlemine" on spordi andmekogu(de)sse kantud spordiorganisatsioonil spordi eripära arvestades õigus spordi arendamiseks ja toetamiseks ning spordiajaloo jäädvustamiseks koguda, töödelda ja avalikustada spordialaliidu väljastatud sportlase litsentsiga sportlase sporditulemusi, mis on saavutatud spordialaliidu veebilehel avalikustatud võistluskalendris kajastatud võistlusel;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>olen teadlik, et minu nime, sünniaega, kodakondsust, pilti ja mängudega seotud andmeid avalikustatakse ELTL-i kodulehel;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>olen teadlik, et vastavalt Isikuandmete kaitse seadusest tulenevalt on ELTL-l õigus jäädvustada heli- ja pildimaterjali enda korraldatud lauatennisega seotud üritustel;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>olen teadlik ELTL-il on õigus tasuta mitteärilisel eesmärgil lauatennise arendamiseks ja ELTL-i poolt kindlaks määratud muudel mõistlikel eesmärkidel kasutada ja volitada kolmandaid isikuid kasutama minu fotosid ja minu kohta koostatud audiovisuaalseid ja visuaalseid materjale (kaasa arvatud minu nimi, spordi- statistika, andmed ja kujutised) koos klubi andmetega.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}