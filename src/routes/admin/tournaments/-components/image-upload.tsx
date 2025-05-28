import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload, Trash2, Check } from 'lucide-react'
import { usePostGamedayImage } from '@/queries/images'
import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface ImageUploadProps {
    tournament_id: number
    gameDay: number
}

export default function ImageUpload({ tournament_id, gameDay }: ImageUploadProps) {
    const [images, setImages] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const postImageMutation = usePostGamedayImage(tournament_id, gameDay)
    const { t } = useTranslation()
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(prevImages => [...prevImages, ...Array.from(e.target.files || [])])
        }
    }

    const handleRemoveImage = (index: number) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index))
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

    const uploadImages = async () => {
        setIsUploading(true)
        setUploadProgress(0)

        const formData = new FormData()
        images.map((file) => {
            formData.append("images", file)
        })
        try {
            toast.message(t('admin.tournaments.groups.images.toasts.uploading_images'))
            await postImageMutation.mutateAsync({
                formData,
                onProgress: (progress) => {
                    setUploadProgress(progress);
                }
            })
            toast.message(t('admin.tournaments.groups.images.toasts.upload_success'))
            setImages([])
        } catch (error) {
            void error;
            toast.error(t('admin.tournaments.groups.images.toasts.upload_error'))
        } finally {
            setIsUploading(false);
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-4">
                        {images.map((file, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index}`}
                                    className=" h-auto object-cover rounded-md"
                                />
                                <button
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <p className="text-sm truncate mt-1">{file.name}</p>
                            </div>
                        ))}
                    </div>

                    {isUploading && (
                        <div className="my-4">
                            <p className="text-sm mb-2">{t('admin.tournaments.groups.images.uploading')}: {uploadProgress}%</p>
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