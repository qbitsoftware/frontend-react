import { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload } from 'lucide-react'
import { addClubImage } from '@/queries/images'
import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export interface ClubImageUploadRef {
    uploadImage: () => Promise<void>
    hasSelectedImage: () => boolean
}

interface ClubImageUploadProps {
    club_id?: number
    onImageUploaded?: (imageUrl: string) => void
    selectedImage?: File | null
    onImageSelected?: (file: File | null) => void
}

const ClubImageUpload = forwardRef<ClubImageUploadRef, ClubImageUploadProps>(({ club_id, onImageUploaded, selectedImage: externalSelectedImage, onImageSelected }, ref) => {
    const [internalSelectedImage, setInternalSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    
    const selectedImage = externalSelectedImage ?? internalSelectedImage
    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageUploadMutation = addClubImage()
    const { t } = useTranslation()
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (onImageSelected) {
                onImageSelected(file)
            } else {
                setInternalSelectedImage(file)
            }
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleRemoveImage = () => {
        if (onImageSelected) {
            onImageSelected(null)
        } else {
            setInternalSelectedImage(null)
        }
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const uploadImage = async () => {
        if (!selectedImage || !club_id) return

        setIsUploading(true)
        setUploadProgress(0)

        try {
            toast.message(t('admin.clubs.image.uploading'))
            const response = await imageUploadMutation.mutateAsync({
                club_id,
                image_file: selectedImage
            })
            
            toast.message(t('admin.clubs.image.upload_success'))
            
            if (response?.data?.image_url && onImageUploaded) {
                onImageUploaded(response.data.image_url)
            }
            
            handleRemoveImage()
        } catch (error) {
            void error
            toast.error(t('admin.clubs.image.upload_error'))
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    useImperativeHandle(ref, () => ({
        uploadImage,
        hasSelectedImage: () => !!selectedImage
    }))

    return (
        <div className="w-full flex flex-col justify-center">
            <div className="relative flex flex-col items-center justify-center mb-4 border-2 border-dashed rounded-md p-4 text-center">
                {!selectedImage ? (
                    <>
                        <Button
                            onClick={handleUploadClick}
                            variant="outline"
                            type="button"
                        >
                            <Upload className="mr-2 h-4 w-4" /> {t('admin.clubs.image.select_image')}
                        </Button>
                        <Input
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                        />
                    </>
                ) : (
                    <div className="relative">
                        <img
                            src={previewUrl!}
                            alt="Club preview"
                            className="max-w-full max-h-32 object-cover rounded-md"
                        />
                        <button
                            onClick={handleRemoveImage}
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {isUploading && (
                <div className="mb-4">
                    <p className="text-sm mb-2">{t('admin.clubs.image.uploading')}: {uploadProgress}%</p>
                    <Progress value={uploadProgress} className="w-full" />
                </div>
            )}

        </div>
    )
})

ClubImageUpload.displayName = 'ClubImageUpload'

export default ClubImageUpload
