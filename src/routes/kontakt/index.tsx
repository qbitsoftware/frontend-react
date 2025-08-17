import { createFileRoute } from '@tanstack/react-router'
import { Home, Mail, Landmark, Phone, MapPin, Clock, ExternalLink } from 'lucide-react'
import { useEffect } from "react"
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/kontakt/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="w-full mx-auto lg:px-4 max-w-[98%]">
      <div className="py-2 sm:py-4">
        <div className="lg:rounded-lg px-2 sm:px-4 lg:px-12 py-4 sm:py-6">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200/50">
              <div className="w-1 h-8 bg-[#4C97F1] rounded-full"></div>
              <h1 className="text-2xl font-bold text-gray-900">{t("contact.page_title")}</h1>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#4C97F1]/5 to-blue-50/50 border border-[#4C97F1]/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">{t("contact.organization_info.title")}</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-200/50 hover:border-[#4C97F1]/50 transition-all">
                    <div className="w-10 h-10 bg-[#4C97F1] rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{t("contact.organization_info.name")}</p>
                      <p className="text-gray-600">Laki 3</p>
                      <p className="text-gray-600">10621 Tallinn</p>
                      <p className="text-gray-600">{t("contact.organization_info.country")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-200/50 hover:border-[#4C97F1]/50 transition-all">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t("contact.organization_info.phone")}</p>
                      <a href="tel:+37251434554" className="text-[#4C97F1] hover:text-blue-700 font-medium transition-colors">
                        +372 514 3454
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-200/50 hover:border-[#4C97F1]/50 transition-all">
                    <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t("contact.organization_info.email")}</p>
                      <a href="mailto:eltl@lauatennis.ee" className="text-[#4C97F1] hover:text-blue-700 font-medium transition-colors">
                        eltl@lauatennis.ee
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-200/50">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">{t("contact.office_hours.title")}</p>
                      <p className="text-gray-600">{t("contact.office_hours.weekdays")} 09:00-17:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">{t("contact.banking.title")}</h2>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-green-200/50">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Landmark className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">{t("contact.banking.bank")}: AS SEB Pank</p>
                    <p className="text-gray-600">{t("contact.banking.address")}: Tornimäe 2, 15010 Tallinn, Estonia</p>
                    <p className="text-gray-600">SWIFT (BIC): EEUHEE2X</p>
                    <p className="text-gray-600">{t("contact.banking.account")}: EE4310 10002047681001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">{t("contact.location.title")}</h2>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2028.2986543739744!2d24.729942316078643!3d59.42926838167742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4692934b9c7f1a1b%3A0x4b9b9b9b9b9b9b9b!2sLaki%203%2C%2010621%20Tallinn%2C%20Estonia!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t("contact.location.map_title")}
                  ></iframe>
                </div>
                
                <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Laki 3, 10621 Tallinn</p>
                    <a 
                      href="https://maps.google.com/?q=Laki+3,+10621+Tallinn,+Estonia" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4C97F1] hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      {t("contact.location.view_in_maps")} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#4C97F1]/5 to-blue-50/50 border border-[#4C97F1]/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">{t("contact.quick_contact.title")}</h3>
                </div>
                <p className="text-gray-600 mb-4">{t("contact.quick_contact.description")}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">• {t("contact.quick_contact.tournaments")}</p>
                  <p className="text-sm text-gray-500">• {t("contact.quick_contact.memberships")}</p>
                  <p className="text-sm text-gray-500">• {t("contact.quick_contact.general")}</p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
