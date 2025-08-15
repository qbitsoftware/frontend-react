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

interface ClubFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  club?: Club;
  formData: CreateClubInput;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ClubFormDialog({
  isOpen,
  onClose,
  mode,
  formData,
  onFormChange,
  onSubmit,
  isLoading,
}: ClubFormDialogProps) {
  const { t } = useTranslation();

  const isEdit = mode === "edit";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`${mode}-image_url`} className="text-right">
              {t("admin.clubs.table.image")}
            </Label>
            <Input
              id={`${mode}-image_url`}
              name="image_url"
              value={formData.image_url}
              onChange={onFormChange}
              className="col-span-3"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("admin.clubs.cancel")}</Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading
              ? (isEdit ? t("admin.clubs.updating") : t("admin.clubs.creating"))
              : (isEdit ? t("admin.clubs.update") : t("admin.clubs.create"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
