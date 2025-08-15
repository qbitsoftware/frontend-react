import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Club } from "@/types/clubs";
import { useTranslation } from "react-i18next";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClub: Club | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  selectedClub,
  onConfirm,
  isLoading,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("admin.clubs.alert_dialog.confirmation")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.clubs.alert_dialog.description")}{" "}
            <span className="font-semibold">{selectedClub?.name}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("admin.clubs.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading
              ? t("admin.clubs.deleting")
              : t("admin.clubs.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}