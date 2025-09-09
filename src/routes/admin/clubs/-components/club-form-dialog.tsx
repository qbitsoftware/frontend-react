import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Club } from "@/types/clubs";
import { CreateClubInput } from "@/queries/clubs";
import { useTranslation } from "react-i18next";
import ClubImageUpload, { ClubImageUploadRef } from "./club-image-upload";
import { Separator } from "@/components/ui/separator";
import { useRef } from "react";

interface ClubFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  club?: Club;
  formData: CreateClubInput;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onImageUploaded?: (imageUrl: string) => void;
}

export function ClubFormDialog({
  isOpen,
  onClose,
  mode,
  club,
  formData,
  onFormChange,
  onSubmit,
  isLoading,
  onImageUploaded,
}: ClubFormDialogProps) {
  const { t } = useTranslation();
  const imageUploadRef = useRef<ClubImageUploadRef>(null);

  const isEdit = mode === "edit";

  const handleSubmit = async () => {
    // First handle the main form submission
    onSubmit();
    
    // Then upload image if there's one selected
    if (imageUploadRef.current?.hasSelectedImage()) {
      await imageUploadRef.current.uploadImage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("admin.clubs.edit") : t("admin.clubs.add_new")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("admin.clubs.edit_details") : t("admin.clubs.add_new_details")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`${mode}-name`} className="text-right">
              {t("admin.clubs.table.name")}
            </Label>
            <Input
              id={`${mode}-name`}
              name="name"
              value={formData.name}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`${mode}-contact_person`} className="text-right">
              {t("admin.clubs.table.contact_person")}
            </Label>
            <Input
              id={`${mode}-contact_person`}
              name="contact_person"
              value={formData.contact_person}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`${mode}-email`} className="text-right">
              {t("admin.clubs.table.email")}
            </Label>
            <Input
              id={`${mode}-email`}
              name="email"
              type="email"
              value={formData.email}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`${mode}-phone`} className="text-right">
              {t("admin.clubs.table.phone")}
            </Label>
            <Input
              id={`${mode}-phone`}
              name="phone"
              value={formData.phone}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`${mode}-address`} className="text-right">
              {t("admin.clubs.table.address")}
            </Label>
            <Input
              id={`${mode}-address`}
              name="address"
              value={formData.address}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`${mode}-website`} className="text-right">
              {t("admin.clubs.table.website")}
            </Label>
            <Input
              id={`${mode}-website`}
              name="website"
              value={formData.website}
              onChange={onFormChange}
              className="col-span-3"
            />
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2">
              {t("admin.clubs.image.upload")}
            </Label>
            <div className="col-span-3">
              <ClubImageUpload
                ref={imageUploadRef}
                club_id={club?.id}
                onImageUploaded={onImageUploaded}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("admin.clubs.cancel")}</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? (isEdit ? t("admin.clubs.updating") : t("admin.clubs.creating"))
              : (isEdit ? t("admin.clubs.update") : t("admin.clubs.create"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
