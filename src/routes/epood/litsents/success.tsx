import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import {
  CheckCircle,
  Download,
  ArrowLeft,
  Mail,
  Receipt,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLicenseDetails } from '@/queries/licenses'

type PaymentSearchParams = {
  order_id?: string
  json?: string
  mac?: string
}

export const Route = createFileRoute('/epood/litsents/success')({
  component: PaymentSuccess,
  validateSearch: (search: Record<string, unknown>): PaymentSearchParams => {
    return {
      order_id: search.order_id as string,
      json: search.json as string,
      mac: search.mac as string,
    }
  },
})

function PaymentSuccess() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/epood/litsents/success' })
  const { data: licenseDetails } = useLicenseDetails(search.order_id)

  let paymentData = null
  try {
    if (search.json) {
      paymentData = JSON.parse(decodeURIComponent(search.json))
    }
  } catch (error) {
    console.warn('Failed to parse payment data:', error)
  }

  const totalAmount =
    licenseDetails?.data?.reduce((sum, record) => sum + record.amount * record.selected_license_duration, 0) || 0

  return (
    <div className="w-full mx-auto lg:px-4 max-w-[85%]">
      <div className="py-6">
        <div className="bg-white border border-gray-200/50 shadow-lg rounded-2xl px-6 sm:px-8 md:px-12 py-8 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('licenses.success.title')}
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              {t('licenses.success.subtitle')}
            </p>
          </div>

          {paymentData && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Receipt className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('licenses.success.order_details')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t('licenses.success.order_info.order_id')}
                    </span>
                    <span className="font-medium text-gray-900">
                      {search.order_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t('licenses.success.order_info.amount')}
                    </span>
                    <span className="font-medium text-gray-900">
                      {paymentData.amount} {paymentData.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t('licenses.success.order_info.status')}
                    </span>
                    <span
                      className={`font-medium ${paymentData.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-900'}`}
                    >
                      {paymentData.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t('licenses.success.order_info.customer')}
                    </span>
                    <span className="font-medium text-gray-900">
                      {paymentData.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t('licenses.success.order_info.reference')}
                    </span>
                    <span className="font-medium text-gray-900 break-all">
                      {paymentData.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t('licenses.success.order_info.transaction')}
                    </span>
                    <span className="font-medium text-gray-900 break-all">
                      {paymentData.transaction}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {licenseDetails?.data && licenseDetails.data.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('licenses.success.license_details')} (
                  {licenseDetails.data.length === 1
                    ? t('licenses.success.license_details_count', {
                      count: licenseDetails.data.length,
                    })
                    : t('licenses.success.license_details_count_plural', {
                      count: licenseDetails.data.length,
                    })}
                  )
                </h2>
              </div>

              <div className="space-y-3 mb-4">
                {licenseDetails.data.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-lg p-4 border border-emerald-100"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">
                          {record.user.first_name} {record.user.last_name}
                        </span>
                        <div className="text-gray-600">
                          {t('licenses.success.license_info.eltl_id')}{' '}
                          {record.user.eltl_id || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {t('licenses.success.license_info.license_type')}
                        </span>
                        <div className="font-medium text-gray-900 capitalize">
                          {record.license_type}
                        </div>
                      </div>
                      <div className="text-right md:text-left">
                        <span className="text-gray-600">
                          {t('licenses.success.license_info.cost')}
                        </span>
                        <div className="font-medium text-gray-900">
                          €{record.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-emerald-200 pt-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span className="text-gray-900">
                    {t('licenses.success.license_info.total_amount')}
                  </span>
                  <span className="text-emerald-600">
                    €{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('licenses.success.what_happens_next')}
              </h2>
            </div>

            <div className="space-y-3 text-gray-700">
              <p>• {t('licenses.success.next_steps.invoice_sent')}</p>
              <p>• {t('licenses.success.next_steps.processing_time')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('licenses.success.need_help')}
              </h2>
            </div>

            <div className="space-y-3 text-gray-700">
              <p>{t('licenses.success.help_info.questions')}</p>
              <p>• {t('licenses.success.help_info.contact_email')}</p>
              <p>• {t('licenses.success.help_info.include_reference')}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/epood/litsents"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('licenses.success.buttons.purchase_more')}
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {t('licenses.success.buttons.return_home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
