import { createFileRoute } from '@tanstack/react-router'
import { axiosInstance } from '@/queries/axiosconf';
import { Button } from '@/components/ui/button'
import { Download, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import AdminHeader from '../-components/admin-header'

export const Route = createFileRoute('/admin/users/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation()
    const [isExporting, setIsExporting] = useState(false)
    // const [isExportingRatings, setIsExportingRatings] = useState(false)
    // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    const downloadUsersExcel = async () => {
        setIsExporting(true)
        try {
            const response = await axiosInstance.get("/api/v1/users/export_xml", {
                responseType: "blob",
                withCredentials: true,
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "users.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setIsExporting(false)
        }
    };

    // const downloadRatingsExcel = async () => {
    //     setIsExportingRatings(true)
    //     try {
    //         const response = await axiosInstance.get("/api/v1/ratings/export_xml", {
    //             responseType: "blob",
    //             withCredentials: true,
    //             params: {
    //                 timestamp: selectedDate
    //             }
    //         });

    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.setAttribute("download", "ratings.xml");
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (error) {
    //         console.error("Download failed", error);
    //     } finally {
    //         setIsExportingRatings(false)
    //     }
    // };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="container p-8">
                <AdminHeader
                    title={t('export.users.title')}
                    description={t('export.users.subtitle')}
                    href=""
                    feedback={true}
                />

                <div className='flex gap-4'>
                    <div className="max-w-lg">
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="text-slate-600 h-6 w-6" />
                                <h3 className="font-medium text-slate-900">{t('export.users.cardTitle')}</h3>
                            </div>
                            <p className="text-slate-600 text-sm mb-6">
                                {t('export.users.description')}
                            </p>
                            <Button
                                onClick={downloadUsersExcel}
                                disabled={isExporting}
                                className="w-full"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {isExporting ? t('export.users.exporting') : t('export.users.exportButton')}
                            </Button>
                        </div>
                    </div>

                    {/* Ratings Export Card */}
                    {/* <div className="max-w-lg">
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Star className="text-yellow-500 h-6 w-6" />
                                <h3 className="font-medium text-slate-900">{t('export.ratings.cardTitle', 'Export Ratings')}</h3>
                            </div>
                            <p className="text-slate-600 text-sm mb-6">
                                {t('export.ratings.description', 'Export ratings with timestamp after selected date')}
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('export.ratings.dateLabel', 'Select date')}
                                </label>
                                <input
                                    type="date"
                                    className="border border-slate-300 rounded px-3 py-2 w-full"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    min="2025-08-19"
                                />
                            </div>
                            <Button
                                onClick={downloadRatingsExcel}
                                disabled={isExportingRatings}
                                className="w-full"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {isExportingRatings ? t('export.ratings.exporting', 'Exporting...') : t('export.ratings.exportButton', 'Export Ratings')}
                            </Button>
                        </div>
                    </div> */}

                </div>
            </div>
        </div>
    );
}

