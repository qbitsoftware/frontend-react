export default function LauatenniseReeglid() {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-6">
          <section className="bg-gray-50/50 border border-gray-200/30 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Mänguvahendid</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Pall, läbimõõduga 40mm, reket ja lauatenniselaud.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Lauatenniselaud on jagatud kaheks võrdseks pooleks võrguga.</span>
              </li>
            </ul>
          </section>
  
          <section className="bg-gray-50/50 border border-gray-200/30 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Punktiarvestus</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Seti võit läheb mängijale kes esimesena kogub 11 punkti välja arvatud juhul kui mõlemal mängijal on 10 punkti, sellisel juhul võidab mängija kes läheb juhtima 2 punktiga.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kohtumine koosneb paaritus arvust settidest.</span>
              </li>
            </ul>
          </section>
  
          <section className="bg-gray-50/50 border border-gray-200/30 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Servimine</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kohtumise alguses võetakse loosi. Loosi võitja valib poole või otsustab kes servib.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Aseta pall lahtisele peopesale ja viska üles vähemalt 16cm. Palli peab tabama kui viimane on hakanud langema.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Servides peab pall kõigepealt tabama servija lauapoolt, seejärel lendama üle või ümber võrgu ja siis tabama vastuvõtja lauapoolt.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Servimise alustamisel, enne kui palli lüüakse, peab pall asuma laua mängupinnast kõrgemal ja servija poolse laua otsajoone taga.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Iga 2 punkti järel vahetub servija, välja arvatud kui mõlemal mängijal on 10 punkti, siis vahetub servija iga 1 punkti järel.</span>
              </li>
            </ul>
          </section>
  
          <section className="bg-gray-50/50 border border-gray-200/30 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Tõrjumine</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Mängus ja servi vastuvõtul peab pall puudutama 1 korra mängija lauapoolt ennem kui võib sellel lüüa tagasi.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#4C97F1] rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängija tabab palli laua kohale nnem, kui pall puudutab tema lauapoolt, siis on see "löök lennult" ja ei ole määrustepärane.</span>
              </li>
            </ul>
          </section>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
          <section className="bg-green-50/50 border border-green-200/30 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Millal on punkt?</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängija ei suuda sooritada õiget servi.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängija ei suuda sooritada õiget tõrjet.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängija lööb palli lennult, ennem kui pall ületab tema lauapoole.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängija lööb meelega kaks või enam korda palli.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängija liigutab lauapinda.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängija käsi mis ei hoia reketit, puudutab lauapinda.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängija puudutab võrku. Võrkku ei tohi puudutada mängija riided või reket.</span>
              </li>
            </ul>
          </section>
  
          <section className="bg-orange-50/50 border border-orange-200/30 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Millal ei ole punkt?</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui servi ajal pall riivab võrkku või võrgu hoidjat, kuid maandub seejärel vastuvõtja poolel, siis punkti ei loeta ja serv läheb kordamisele.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui vastuvõtja püüab või lööb palli ennem kui see puudutab tema lauapoolt servi ajal peale võrgu puudet.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kui mängijat segab keegi või miski sooritamast määrustepärast lööki.</span>
              </li>
            </ul>
          </section>
  
          <section className="bg-purple-50/50 border border-purple-200/30 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Para lauatennis</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Kargu või kepiga ei tohi mängu lauda puudutada.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Ratastoolismängija vastu servides ei tohi pall vastuvõtja poolel tõusta vertikaalselt või liikuda võrgu poole tagasi. Samas ei tohi pall vastuvõtja poolel väljuda külgjoonest. See tähendab uut servi.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Ratastoolismängija istmik ja jalad ei tohi mängu ajal toelt tõusta. Punkt vastasele.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">Paarismängus ratastoolismängija poolel võib vastu võtta kes iganes, mitte vaheldumisi.</span>
              </li>
            </ul>
          </section>
          </div>
        </div>
      </div>
    )
  }
  
  