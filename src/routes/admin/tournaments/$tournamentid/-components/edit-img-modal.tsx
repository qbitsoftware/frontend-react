import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { addPlayerImage } from '@/queries/images';
import { useToast } from '@/hooks/use-toast';
import { useToastNotification } from "@/components/toast-notification"
import { useTranslation } from 'react-i18next';


// Allowed image formats
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface EditImgModalProps {
  playerId: string;
  playerName: string;
  playerImg?: string;
  onSuccess?: () => void;
}

const EditImgModal = ({ playerId, playerName, playerImg, onSuccess }: EditImgModalProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast()
  const { successToast, errorToast } = useToastNotification(toast)

  const { mutate: uploadImage } = addPlayerImage();
  const { t } = useTranslation()

  // Set initial preview from playerImg prop when dialog opens
  useEffect(() => {
    if (isOpen && playerImg) {
      setPreview(playerImg);
    }
  }, [isOpen, playerImg]);

  const validateFile = (file: File): boolean => {
    // Reset previous error
    setError("");

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(t('admin.tournaments.groups.img_modal.errors.invalid_type'));
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t("admin.tournaments.groups.img_modal.errors.file_too_large"));
      return false;
    }

    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Clear the file input if validation fails
      e.target.value = '';
      setImage(null);
      setPreview(playerImg || "");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (!image) return;

    setIsLoading(true);
    setError("");

    uploadImage(
      {
        player_id: playerId,
        image_file: image
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setIsLoading(false);
          if (onSuccess) onSuccess();
          successToast(t("admin.tournaments.groups.img_modal.notifications.upload_success"))
        },
        onError: (error) => {
          void error;
          setError(t("admin.tournaments.groups.img_modal.errors.upload_failed"));
          setIsLoading(false);
          errorToast(t("admin.tournaments.groups.img_modal.errors.upload_failed"))
        }
      }
    );
  };

  const resetForm = () => {
    setImage(null);
    setPreview(playerImg || "");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetForm();
    } else {
      // When opening the dialog, set the preview to the existing image
      if (playerImg) {
        setPreview(playerImg);
      }
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {t("admin.tournaments.groups.img_modal.title")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("admin.tournaments.groups.img_modal.sentence_1.1")} {playerName}{t("admin.tournaments.groups.img_modal.sentence_1.2")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.tournaments.groups.img_modal.description")}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="mt-2">
            <input
              type="file"
              id="profilepic"
              name="profilepic"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              className="w-full"
              disabled={isLoading}
            >
              {t('admin.tournaments.groups.img_modal.choose_img')}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin.tournaments.groups.img_modal.file_types')}
          </p>

          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}
            </p>
          )}

          <div className="flex justify-center mt-4">
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                <span className="text-gray-400">
                  {t('admin.tournaments.groups.img_modal.errors.no_image')}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              {t('admin.tournaments.groups.img_modal.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!image || isLoading}
            >
              {isLoading ?
                t('admin.tournaments.groups.img_modal.notifications.uploading')
                :
                t('admin.tournaments.groups.img_modal.save')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditImgModal