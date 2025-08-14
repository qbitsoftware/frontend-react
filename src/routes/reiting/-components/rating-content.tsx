import { Button } from "@/components/ui/button";

interface Props {
    onClose: () => void;
}
export default function RatingContent({ onClose }: Props) {
    return (
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    ELTL REITINGU ARVESTAMISE KORD
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Reitingu eesmärgiks on:</strong></p>
                    <ul className="ml-4 space-y-1">
                        <li>1. Võistlejate paremusjärjestuse moodustamiseks ja võistlustabelisse paigutamiseks.</li>
                        <li>2. Anda treeneritele ja mängijatele tagasisidet võistlustulemuste analüüsiks.</li>
                        <li>3. Anda abivahend ELTL'ile klubide ja mängijate tulemuste hindamiseks.</li>
                    </ul>
                    <p className="mt-3">
                        Reitingu edetabelisse kantakse kõik ELTL mängija litsentsi omavad mängijad, kes osalevad ELTL kalendrivõistlustel. ELTL reitingu edetabelisse kantakse ka kõik ELTL välismängija litsentsi omavad mängijad, kuid neid ei arvestata Eesti paremusjärjestuse edetabelis.
                    </p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    REITINGU ARVESTAMISE METOODIKA
                </h3>
                <div className="space-y-4 text-sm text-gray-700">
                    <p className="font-medium">Peamised reeglid ja valemid</p>

                    <div>
                        <p className="font-medium mb-2">REITINGU (Ra) JA KAALU (Ka) MUUTUSTE ARVUTAMINE</p>
                        <p className="text-red-600 font-medium mb-3">
                            NB! Kõik reitingu muudatused arvutatakse iga nädala teisipäeva hommikul vahemikus kell 6:00 – 12:00 !
                        </p>

                        <p className="mb-3">Leitakse võistluse võidu ja kaotuste hindade summade absoluutväärtused:</p>
                        <ul className="ml-4 space-y-1 mb-3">
                            <li>• Võitude hindade summa: Hvs=ΣHv</li>
                            <li>• Kaotuste hindade summa: Hks= (ΣHk) * -1</li>
                        </ul>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <p className="font-medium mb-2">Reitingu muutuse (^R) arvutamine:</p>
                            <div className="flex justify-center items-center font-mono text-blue-800 font-semibold">
                                <div className="text-sm pr-2 text-blue-700">^R =</div>
                                <div className="flex flex-col">
                                    <div className="text-center mb-1">((Hvs - Hks) * 10) + Hvs * Coef</div>
                                    <div className="w-[260px] h-px bg-blue-800 mb-1"></div>
                                    <div className="text-center">Ka + Hvs + Hks</div>
                                </div>
                            </div>
                            <p className="text-xs mt-2">• Kui võistleja algkaal (Ka) &gt;30, siis võetakse kaalude väärtuseks valemis 30.</p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <p className="font-medium mb-2">Reiting võistluse lõpuks (Rl) leidmiseks liidetakse reitingu muutus (^R) algreitingule (Ra)</p>
                            <div className="font-mono text-center text-green-800 font-semibold">
                                Reiting võistluse lõpuks (Rl) = Ra +^R
                            </div>
                            <p className="text-xs mt-2">Positiivsed ^R väärtused suurendavad ja negatiivsed ^R väärtused vähendavad lõppreitingut.</p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <p className="font-medium mb-2">Kaalu muutuse (^K) arvutamine:</p>
                            <div className="font-mono text-center text-yellow-800 font-semibold">
                                Kaalu muutus( ^K) = Hvs+ Hks
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="font-medium mb-2">Kaalu (Kl) arvutamiseks võistluse lõpuks, liidetakse algkaalule (Ka) kaalude muutus (^K):</p>
                            <div className="font-mono text-center text-purple-800 font-semibold">
                                Kl=Ka+^K
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    Kaalu korrigeerimine
                </h3>
                <div className="space-y-4 text-sm text-gray-700">
                    <div>
                        <p className="font-medium mb-2">Kui Ka &gt; 10:</p>
                        <p className="mb-2">
                            Kaalusid korrigeeritakse iga nädala teisipäeva seisuga enne uute tulemuste arvutamist järgmise valemi alusel, kus Ka on kaal enne korrigeerimist ja Ku kaal peale korrigeerimist.
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="font-mono text-center text-red-800 font-semibold">
                                Ku = Ka - ( (Ka * Ka) / 900 )
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-medium mb-2">Kui Ka&lt;11:</p>
                        <p className="mb-2">Kaalusid korrigeeritakse kord nädalas, teisipäeviti</p>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                            <div className="font-mono text-center text-indigo-800 font-semibold">
                                Ku = Ka – 0.08
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    Reitingu koostamine
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <p>Reiting koostatakse paigutuspunktide (P) alusel, kus Rl on reitingupunktid ja Ku on korrigeeritud kaalud.</p>

                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-3">
                        <div className="font-mono text-center text-teal-800 font-semibold">
                            Paigutuspunktide muutus (^P) = (Rl – (3 * Ku) ) /6
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="font-mono text-center text-green-800 font-semibold text-sm">
                                Kui ^P&gt;0 siis P = Rl - ^P
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="font-mono text-center text-gray-800 font-semibold text-sm">
                                Kui ^P&lt;=0 siis P = Rl
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    Reitingu punktide muutused
                </h3>

                <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-700">
                        <strong>Kui kõrgema reitinguga mängija võidab:</strong>
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-[#4C97F1]/10">
                                    <th className="border border-gray-300 px-3 py-2 text-left">
                                        Reitingu punktide vahe
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-center">
                                        Võitja (+X)
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-center">
                                        Kaotaja (-X)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2">
                                        0 – 10
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">
                                        +2
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">
                                        -2
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 px-3 py-2">
                                        11 – 30
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">
                                        +1
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">
                                        -1
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2">
                                        üle 30
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">
                                        0
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">
                                        0
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                        NB! Kui vahe on suurem, siis ei saa suuremate punktidega mängija plusse - ebavõrdsed vastased.
                    </p>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-3">
                        <strong>Kui madalama reitinguga mängija võidab:</strong>
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="font-mono text-center text-blue-800 font-semibold mb-2">
                            (Reitingu punktide erinevuse absoluutväärtus + 5) ÷ 3
                        </div>
                        <p className="text-sm text-blue-700 text-center mb-2">
                            Võitja teenib ülaltoodud valemiga arvutatud arvu võidupunkte ja kaotaja kaotab sama arvu punkte.
                        </p>
                        <div className="space-y-1 text-xs">
                            <p>Võitja reitingu muutus = (|kaotaja reiting - võitja reiting| + 5) ÷ 3</p>
                            <p>Kaotaja reitingu muutus = - (sama summa kui võitjal)</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        Juhul kui mängijate punktide vahe on suurem kui 30 punkti, saab madalamate reitingupunktidega mängija punkte vastavalt ülaltoodud arvestusele ja on piiratud absoluutväärtuses maksimaalselt 15 punktiga.
                    </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="font-medium mb-2 text-orange-800">Reitingumuutust ei toimu kui:</p>
                    <ul className="space-y-1 text-sm text-orange-700">
                        <li>• Võidab suuremate reitingu punktidega mängija ja reitingu vahe on üle 30 punkti - ebavõrdne kohtumine.</li>
                    </ul>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    Turniiri/võistluste koefitsiendid
                </h3>

                <div className="overflow-x-auto mb-3">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead>
                            <tr className="bg-[#4C97F1]/10">
                                <th className="border border-gray-300 px-3 py-2 text-left">
                                    Võistlus/Turniir
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center">
                                    Punktide koefitsient
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center">
                                    Kaalu koefitsient (ei muutu)
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center">
                                    Lisapunktid - 1. koht
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-3 py-2 font-medium">
                                    Est MV
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    x 1,4
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    x 1
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">
                                    +2
                                </td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="border border-gray-300 px-3 py-2 font-medium">
                                    ELTL GP (Etapp)
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    x 1,1
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    x 1
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">
                                    +1
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-3 py-2 font-medium">
                                    Top 10 (16)
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    x 1,2
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    x 1
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">
                                    +2
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-gray-600">
                    *Võistluste koefitsendid kehtivad vaid täiskasvanute võistlustel täiskasvanute absoluutjärjestuses.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    Uue mängija reitingu arvestus
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <p>Kui turniiril osales mängija, kes ei oma algreitingut, määratakse talle algreiting.</p>
                    <p>Algreiting määratakse kõigile ELTL reitingu/kalendri võistlustel osalenud mängijatele.</p>
                    <p>Esmasel reitingu võistlusel osalejale määratakse algreiting järgnevalt:</p>

                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-[#4C97F1]/10">
                                    <th className="border border-gray-300 px-3 py-2 text-center">
                                        Võitja (+X)
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-center">
                                        Kaotaja (-X)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">
                                        +1
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">
                                        0
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-3">
                        Juhul kui mängijale on algreiting juba määratud (k.a. 0 reitingupunkti) toimub edaspidine reitingu arvestus üldise reitingu arvutamise metoodika alusel.
                    </p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    Välismängija reitingu arvestus
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <p>
                        ELTL välismängija litsentsi omavad mängijad kantakse ELTL reitingu andmebaasi arvestusse, kuid neid ei arvestata Eesti paremusjärjestuse edetabelis.
                    </p>
                    <p>
                        Viimase 365 päeva jooksul ELTL reitinguvõistlusel osalenud välismängijate osas arvestatakse reitingupunktid vastavalt reitingu arvestuse põhimõtetele võrreldes seda olemasoleva statistilise andmebaasiga.
                    </p>
                    <p>
                        Välismängijale, kes on omandanud ELTL välismängija litsentsi, kuid ei ole 365 päeva jooksul ELTL reitingu võistlusel osalenud määratakse punktid võistluste kohtuniku parima teadmise alusel võistluste(le) paigutustabeli alusel.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="font-medium mb-2">Näide:</p>
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-300 text-xs">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-2 py-1">Võistluse paigutus</th>
                                        <th className="border border-gray-300 px-2 py-1">R</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1">X+1 Mängija EST</td>
                                        <td className="border border-gray-300 px-2 py-1">70</td>
                                    </tr>
                                    <tr className="bg-blue-50">
                                        <td className="border border-gray-300 px-2 py-1">X+2 Mängija (VÄLIS)</td>
                                        <td className="border border-gray-300 px-2 py-1">(70+60)/2 =65</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1">X+3 Mängija EST</td>
                                        <td className="border border-gray-300 px-2 py-1">60</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p>
                        Välismängijad kellel on kehtiv ELTL välismängija litsents kuvatakse filtreeritavas reitingu arvestuse tabelis. Välismängijaid kellel kehtivat litsentsi ei ole filtreeritavas reitingu arvestuse tabelis ei kuvata, kuid nende osas on võimalik teha andmebaasi päringut võistlus(t)ele paigutamise eesmärgil.
                    </p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    Reitingust väljalangemine
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <p>
                        Mängija langeb reitingust välja kui ta ei ole 365 päeva jooksul reitinguturniiril mänginud (võistlustele lihtsalt kirjapanemine ei ole aluseks reitingus püsimiseks).
                    </p>
                    <p>
                        Mängija väljalangemisel reitingust tema reitingupunktid ei kao.
                    </p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    WO (walkover) – loobumisvõidu arvestus
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <p>
                        Loobumisvõidu puhul tegelikku statistilist sündmust (ehk mängu) ei toimunud ning lisaks võib olla sündmuse mitte toimumine seotud mänguga kaudselt toimuva sündmusega, mille tõttu selles osas ei õige täiemahulist punktide kaotust/võitu rakendata.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-[#4C97F1]/10">
                                    <th className="border border-gray-300 px-3 py-2 text-center">
                                        Mängija 1
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-center">
                                        Hind (Punkti)
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-center">
                                        Mängija 2
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                        Loobub
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">
                                        -1
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                        0
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                        Loobub
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">
                                        -1
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                        Loobub
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                        0
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">
                                        - 1
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                        Loobub
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-3">
                        Loobumisvõidu korral arvestatakse vaid esimest loobutud mängu.
                    </p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#4C97F1] mb-3">
                    Muud reeglid
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <ul className="space-y-1">
                        <li>● WO e. loobumisvõidu korral saab loobuja -1 punkti. (kehtib vaid esimesel WO loobumisel)</li>
                        <li>● Absoluutväärtuses ei saa punktid minna negatiivseks e. minimaalne kehtiva litsentsiga mängija punktide arv on 0.</li>
                        <li>● Maksimaalne algreiting on piiratud väärtusega 15.</li>
                        <li>● Välismängijate puhul algreitingu piirangut ei rakendata.</li>
                    </ul>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button
                    onClick={onClose}
                    className="bg-[#4C97F1] hover:bg-[#4C97F1]/90"
                >
                    Sulge
                </Button>
            </div>
        </div>
    );
}