import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Trash2, Check } from 'lucide-react'
import { usePostGamedayImage } from '@/queries/images'
import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface ImageUploadProps {
    tournament_id: number
    gameDay: number
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const MAX_TOTAL_FILES = 50;
const BATCH_SIZE = 12; 

export default function ImageUpload({ tournament_id, gameDay }: ImageUploadProps) {
    const [images, setImages] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const postImageMutation = usePostGamedayImage(tournament_id, gameDay)
    const { t } = useTranslation()
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const [failedUploads, setFailedUploads] = useState<string[]>([])

    useEffect(() => {
        previewUrls.forEach(url => URL.revokeObjectURL(url))

        const firstFourImages = images.slice(0, 4)
        const newUrls = firstFourImages.map(file => URL.createObjectURL(file))
        setPreviewUrls(newUrls)

        return () => {
            newUrls.forEach(url => URL.revokeObjectURL(url))
        }
    }, [images])

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previewUrls])



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)

            const validFiles = newFiles.filter(file => {
                if (file.size > MAX_FILE_SIZE) {
                    toast.error(`${file.name} is too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`)
                    return false
                }
                return true
            })

            const totalFiles = images.length + validFiles.length
            if (totalFiles > MAX_TOTAL_FILES) {
                toast.error(`Maximum ${MAX_TOTAL_FILES} files allowed`)
                return
            }

            setImages(prevImages => [...prevImages, ...validFiles])
        }
    }


    const handleClearAll = () => {
        setImages([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleAddMoreClick = () => {
        fileInputRef.current?.click()
    }

    const uploadImageBatch = async (batch: File[], batchIndex: number, totalBatchCount: number) => {
        const formData = new FormData()
        batch.forEach((file) => {
            formData.append("images", file)
        })

        return postImageMutation.mutateAsync({
            formData,
            onProgress: (progress) => {
                const completedBatches = batchIndex
                const currentBatchProgress = progress / 100
                const overallProgress = ((completedBatches + currentBatchProgress) / totalBatchCount) * 100
                setUploadProgress(Math.round(overallProgress))
            }
        })
    }

    const uploadImages = async () => {
        setIsUploading(true)
        setUploadProgress(0)
        setFailedUploads([])

        const batches: File[][] = []
        for (let i = 0; i < images.length; i += BATCH_SIZE) {
            batches.push(images.slice(i, i + BATCH_SIZE))
        }

        const totalBatchCount = batches.length

        try {
            toast.message(t('admin.tournaments.groups.images.toasts.uploading_images'))

            for (let i = 0; i < batches.length; i++) {
                try {
                    await uploadImageBatch(batches[i], i, totalBatchCount)
                } catch (error) {
                    // Track failed batches but continue with others
                    const failedFiles = batches[i].map(file => file.name)
                    setFailedUploads(prev => [...prev, ...failedFiles])
                    console.error(`Batch ${i + 1} failed:`, error)
                }
            }

            if (failedUploads.length === 0) {
                toast.success(t('admin.tournaments.groups.images.toasts.upload_success'))
                setImages([])
            } else {
                toast.warning(`${images.length - failedUploads.length} images uploaded. ${failedUploads.length} failed.`)
            }

        } catch (error) {
            void error
            toast.error(t('admin.tournaments.groups.images.toasts.upload_error'))
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="w-full flex flex-col justify-center mx-auto p-4">
            <div className="relative flex flex-col items-center justify-center mb-4 border-2 border-dashed py-8 text-center">
                <Button
                    onClick={handleAddMoreClick}
                    variant="outline"
                >
                    <Upload className="mr-2 h-4 w-4" /> {t('admin.tournaments.groups.images.add_image')}
                </Button>
                <Input
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    type="file"
                    id="fileUpload"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                />
            </div>

            {images.length > 0 && (
                <div className='flex flex-col'>
                    <div className="text-center mb-4 p-6 border-2 border-dashed border-gray-300 rounded-lg">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-lg font-medium text-gray-900 mb-1">
                            {images.length} {images.length === 1 ? t('admin.tournaments.groups.images.image_added') : t('admin.tournaments.groups.images.images_added')}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            {t('admin.tournaments.groups.images.ready_to_upload')}
                        </p>

                        {previewUrls.length > 0 && (
                            <div className="relative flex justify-center items-center space-x-2 mb-4">
                                {previewUrls.map((url, index) => (
                                    <div
                                        key={index}
                                        className="w-12 h-12 rounded-md overflow-hidden border border-gray-200"
                                        style={{
                                            opacity: index === 3 && images.length > 4 ? 0.3 : 1 - (index * 0.1)
                                        }}
                                    >
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                                {images.length > 4 && (
                                    <div className="text-xs text-gray-400 ml-2">
                                        +{images.length - 4} {t('admin.tournaments.groups.images.more')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isUploading && (
                        <div className="my-4">
                            <p className="text-sm mb-2">
                                {t('admin.tournaments.groups.images.uploading')}: {uploadProgress}%
                            </p>
                            <Progress value={uploadProgress} className="w-full" />
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleClearAll}
                            className=''
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> {t('admin.tournaments.groups.images.remove_all')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={uploadImages}
                            className=''
                        >
                            <Check className="mr-2 h-4 w-4" /> {t('admin.tournaments.groups.images.save')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
