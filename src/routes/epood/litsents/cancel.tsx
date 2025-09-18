import { createFileRoute, Link } from '@tanstack/react-router'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/epood/litsents/cancel')({
  component: PaymentCancel,
})

function PaymentCancel() {
  const { t } = useTranslation()

  return (
    <div className="w-full mx-auto lg:px-4 max-w-[85%]">
      <div className="py-6">
        <div className="bg-white border border-gray-200/50 shadow-lg rounded-2xl px-6 sm:px-8 md:px-12 py-8 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('licenses.cancel.title')}
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              {t('licenses.cancel.subtitle')}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('licenses.cancel.what_you_can_do.title')}
              </h2>
            </div>

            <div className="space-y-3 text-gray-700">
              <p>• {t('licenses.cancel.what_you_can_do.try_again')}</p>
              <p>• {t('licenses.cancel.what_you_can_do.check_payment')}</p>
              <p>• {t('licenses.cancel.what_you_can_do.contact_support')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('licenses.cancel.need_assistance.title')}
              </h2>
            </div>

            <div className="space-y-3 text-gray-700">
              <p>{t('licenses.cancel.need_assistance.description')}</p>
              <p>• {t('licenses.cancel.need_assistance.contact_email')}</p>
              <p>• {t('licenses.cancel.need_assistance.help_text')}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/epood/litsents"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('licenses.cancel.buttons.try_again')}
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {t('licenses.cancel.buttons.return_home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
