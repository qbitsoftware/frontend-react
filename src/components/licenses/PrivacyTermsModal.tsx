import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PrivacyTermsProps{
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyTermsModal({ isOpen, onClose }: PrivacyTermsProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="prose prose-gray max-w-none text-sm leading-relaxed">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ELTL Privaatsuspoliitika</h3>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">1. Üldsätted</h4>
              <p className="mb-3">
                1.1. Käesolev privaatsuspoliitika reguleerib isikuandmete kogumist, töötlemist ja säilitamist
                käsitlevaid põhimõtteid. Isikuandmeid kogub töötleb ja säilitab isikuandmete vastutav töötleja Eesti
                Lauatenniseliit, registrikood 80079180 (edaspidi andmetöötleja).
              </p>
              <p className="mb-3">
                1.2. Andmesubjekt privaatsuspoliitika tähenduses on klient või muu füüsiline isik, kelle isikuandmeid
                andmetöötleja töötleb.
              </p>
              <p className="mb-3">
                1.3. Klient privaatsuspoliitika tähenduses on igaüks, kes ostab andmetöötleja kodulehelt kaupu või
                teenuseid.
              </p>
              <p className="mb-3">
                1.4. Andmetöötleja järgib õigusaktides sätestatud andmete töötlemise põhimõtteid, muuhulgas
                töötleb andmetöötleja isikuandmeid seaduslikult, õiglaselt ja turvaliselt. Andmetöötleja on
                võimeline kinnitama, et isikuandmeid on töödeldud vastavalt õigusaktides sätestatule.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">2. Isikuandmete kogumine, töötlemine ja säilitamine</h4>
              <p className="mb-3">
                2.1. Isikuandmed, mida andmetöötleja kogub, töötleb ja säilitab, on kogutud elektrooniliselt,
                peamiselt kodulehe ja e-posti vahendusel.
              </p>
              <p className="mb-3">
                2.2. Oma isikuandmete jagamisega annab andmesubjekt andmetöötlejale õiguse koguda,
                korraldada, kasutada ja hallata privaatsuspoliitikas määratletud eesmärgil isikuandmeid, mida
                andmesubjekt otse või kaudselt kodulehel kaupu või teenuseid ostes andmetöötlejale jagab.
              </p>
              <p className="mb-3">
                2.3. Andmesubjekt vastutab selle eest, et tema poolt esitatud andmed oleksid täpsed, õiged ja
                terviklikud. Teadlikult valeandmete esitamist peetakse privaatsuspoliitika rikkumiseks.
                Andmesubjekt on kohustatud andmetöötlejat viivitamatult teavitama esitatud andmete
                muutumisest.
              </p>
              <p className="mb-3">
                2.4. Andmetöötleja ei vastuta andmesubjekti poolt valeandmete esitamisest põhjustatud kahju eest
                andmesubjektile või kolmandatele osapooltele.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">3. Klientide isikuandmete töötlemine</h4>
              <p className="mb-3">3.1. Andmetöötleja võib töödelda järgnevaid andmesubjekti isikuandmeid:</p>
              <ul className="space-y-1 mb-3">
                <li>3.1.1. Ees- ja perekonnanimi;</li>
                <li>3.1.2. Sünnikuupäev;</li>
                <li>3.1.3. Telefoninumber;</li>
                <li>3.1.4. E-posti aadress;</li>
                <li>3.1.5. Kohaletoimetamise aadress;</li>
                <li>3.1.6. Arvelduskonto number;</li>
                <li>3.1.7. Maksekaardi detailid;</li>
              </ul>
              <p className="mb-3">
                3.2. Lisaks eeltoodule on andmetöötlejal õigus koguda kliendi kohta andmeid, mis on kättesaadavad
                avalikes registrites.
              </p>
              <p className="mb-3">
                3.3. Isikuandmete töötlemise õiguslik alus on isikuandmete kaitse üldmääruse paragrahv 6 lg 1 p-d
                a), b), c) ja f):
              </p>
              <p className="mb-3">
                a) andmesubjekt on andnud nõusoleku töödelda oma isikuandmeid ühel või mitmel konkreetsel
                eesmärgil;
              </p>
              <p className="mb-3">
                b) isikuandmete töötlemine on vajalik andmesubjekti osalusel sõlmitud lepingu täitmiseks või
                lepingu sõlmimisele eelnevate meetmete võtmiseks vastavalt andmesubjekti taotlusele;
              </p>
              <p className="mb-3">
                c) isikuandmete töötlemine on vajalik vastutava töötleja juriidilise kohustuse täitmiseks;
              </p>
              <p className="mb-3">
                f) isikuandmete töötlemine on vajalik vastutava töötleja või kolmanda isiku õigustatud huvi korral,
                välja arvatud juhul, kui sellise huvi kaaluvad üles andmesubjekti huvid või põhiõigused ja -
                vabadused, mille nimel tuleb kaitsta isikuandmeid, eriti juhul kui andmesubjekt on laps.
              </p>
              <p className="mb-3">3.4. Isikuandmete töötlemine vastavalt töötlemise eesmärgile:</p>
              <ul className="space-y-2 mb-3">
                <li>3.4.1. Töötlemise eesmärk – julgeolek ja turvalisus<br />
                Isikuandmete säilitamise maksimaalne aeg – vastavalt seaduses nimetatud tähtaegadele</li>
                <li>3.4.2. Töötlemise eesmärk – tellimuse töötlemine<br />
                Isikuandmete säilitamise maksimaalne aeg – kuni 10 aastat</li>
                <li>3.4.3. Töötlemise eesmärk – e-poe teenuste toimimise tagamine<br />
                Isikuandmete säilitamise maksimaalne aeg – kuni 5 aastat</li>
                <li>3.4.4. Töötlemise eesmärk – kliendihaldus<br />
                Isikuandmete säilitamise maksimaalne aeg – kuni 5 aastat</li>
                <li>3.4.5. Töötlemise eesmärk – finantstegevus, raamatupidamine<br />
                Isikuandmete säilitamise maksimaalne aeg – vastavalt seaduses nimetatud tähtaegadele</li>
                <li>3.4.6. Töötlemise eesmärk – turundus - kuni 3 aastat</li>
              </ul>
              <p className="mb-3">
                3.5. Andmetöötlejal on õigus klientide isikuandmeid jagada kolmandate isikutega, kelleks on näiteks
                volitatud andmetöötlejad, raamatupidajad, transpordi- ja kullerettevõtted, ülekandeteenuseid
                pakkuvad ettevõtted Andmetöötleja on isikuandmete vastutav töötleja. Andmetöötleja edastab
                maksete teostamiseks vajalikud isikuandmed volitatud töötleja Maksekeskus AS-ile.
              </p>
              <p className="mb-3">
                3.6. Andmesubjekti isikuandmete töötlemisel ja säilitamisel rakendab andmetöötleja
                organisatoorseid ja tehnilisi meetmeid, mis tagavad isikuandmete kaitse juhusliku või ebaseadusliku
                hävitamise, muutmise, avalikustamise ja mis tahes muu ebaseadusliku töötlemise eest.
              </p>
              <p className="mb-3">
                3.7. Andmetöötleja säilitab andmesubjektide andmeid sõltuvalt töötlemise eesmärgist, kuid mitte
                kauem kui 10 aastat.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">4. Andmesubjekti õigused</h4>
              <p className="mb-3">4.1. Andmesubjektil on õigus saada ligipääs oma isikuandmetele ning nendega tutvuda.</p>
              <p className="mb-3">4.2. Andmesubjektil on õigus saada informatsiooni tema isikuandmete töötlemise kohta.</p>
              <p className="mb-3">4.3. Andmesubjektil on õigus täiendada või parandada ebatäpseid andmeid.</p>
              <p className="mb-3">
                4.4. Kui andmetöötleja töötleb andmesubjekti isikuandmeid andmesubjekti nõusoleku alusel, siis on
                andmesubjektil õigus igal ajal nõusolek tagasi võtta.
              </p>
              <p className="mb-3">
                4.5. Andmesubjekt saab õiguste teostamiseks pöörduda e-poe klienditoe poole aadressil
                <strong> info@eltl.ee</strong>.
              </p>
              <p className="mb-3">
                4.6. Andmesubjektil on oma õiguste kaitseks võimalik esitada kaebus Andmekaitse Inspektsioonile.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 mb-3">5. Lõppsätted</h4>
              <p className="mb-3">
                5.1. Käesolevad andmekaitsetingimused on koostatud kooskõlas Euroopa Parlamendi ja nõukogu
                määrusega (EL) nr 2016/679 füüsiliste isikute kaitse kohta isikuandmete töötlemisel ja selliste
                andmete vaba liikumise ning direktiivi 95/46 / EÜ kehtetuks tunnistamise kohta / EÜ (isikuandmete
                kaitse üldmäärus), Eesti Vabariigi isikuandmete kaitse seadusega ning Eesti Vabariigi ja Euroopa Liidu
                õigusaktidega.
              </p>
              <p className="mb-3">
                5.2. Andmetöötlejal on õigus andmekaitsetingimusi osaliselt või täielikult muuta, teavitades
                andmesubjekte muudatustest kodulehe eltl.ee kaudu.
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
