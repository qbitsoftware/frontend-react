import React from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlayerForm, UsePlayerFormOptions } from "@/hooks/usePlayerForm";
import { useTranslation } from "react-i18next";
import { PlayerFormData } from "@/lib/player-validation";

export interface PlayerManualEntryFormProps extends UsePlayerFormOptions {
  onBack?: () => void;
  onCancel?: () => void;
  showBackButton?: boolean;
  showCancelButton?: boolean;
  submitButtonText?: string;
  submitButtonIcon?: React.ReactNode;
  submitButtonClassName?: string;
  formClassName?: string;
  translationPrefix?: string;
  initialData?: Partial<PlayerFormData>;
  disabled?: boolean;
}

export function PlayerManualEntryForm({
  onBack,
  onCancel,
  showBackButton = true,
  showCancelButton = false,
  submitButtonText,
  submitButtonIcon,
  submitButtonClassName = "",
  formClassName = "",
  translationPrefix = "player_form",
  initialData,
  disabled = false,
  ...formOptions
}: PlayerManualEntryFormProps) {
  const { t } = useTranslation();
  
  const {
    playerData,
    setPlayerData,
    validationErrors,
    noEstonianId,
    handleSubmit,
    handleIsikukoodChange,
    handleBirthDateChange,
    handleNoEstonianIdToggle,
    updatePlayerField,
  } = usePlayerForm({
    ...formOptions,
    t,
  });

  React.useEffect(() => {
    if (initialData) {
      setPlayerData({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        birth_date: initialData.birth_date || "",
        isikukood: initialData.isikukood || "",
        club_name: initialData.club_name || "",
        sex: initialData.sex || "",
      });
    }
  }, [initialData, setPlayerData]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className={formClassName}>
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="flex order-2 sm:order-1 items-center gap-2">
          <div className="w-2 h-6 bg-green-600 rounded-full"></div>
          <h4 className="font-semibold text-gray-900 text-base">
            {t(`${translationPrefix}.title`)}
          </h4>
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2 w-full justify-between sm:justify-end sm:w-auto">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover:bg-blue-50 hover:text-[#4C97F1]"
              disabled={disabled}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t(`${translationPrefix}.back_button`)}
            </Button>
          )}
          {showCancelButton && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="hover:bg-red-50 hover:text-red-600"
              disabled={disabled}
            >
              {t(`${translationPrefix}.cancel_button`)}
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder={t(`${translationPrefix}.first_name`)}
            value={playerData.first_name}
            onChange={(e) => updatePlayerField("first_name", e.target.value)}
            disabled={disabled}
            required
          />
          <Input
            type="text"
            placeholder={t(`${translationPrefix}.last_name`)}
            value={playerData.last_name}
            onChange={(e) => updatePlayerField("last_name", e.target.value)}
            disabled={disabled}
            required
          />

          {noEstonianId && (
            <Input
              type="date"
              placeholder={t(`${translationPrefix}.birth_date`)}
              value={playerData.birth_date}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              className={
                validationErrors.birth_date ? "border-red-300" : ""
              }
              disabled={disabled}
              required
            />
          )}

          {!noEstonianId && playerData.birth_date && (
            <div className="px-3 py-2 border rounded-md bg-gray-50">
              <div className="text-xs text-gray-600 mb-1">
                {t(`${translationPrefix}.birth_date`)}
              </div>
              <div className="text-sm font-medium">{playerData.birth_date}</div>
              <div className="text-xs text-gray-500">
                {t(`${translationPrefix}.auto_generated`)}
              </div>
            </div>
          )}

          <Input
            type="text"
            placeholder={t(`${translationPrefix}.estonian_id`)}
            value={playerData.isikukood}
            onChange={(e) => handleIsikukoodChange(e.target.value)}
            disabled={noEstonianId || disabled}
            className={
              validationErrors.isikukood ? "border-red-300" : ""
            }
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="noEstonianId"
              checked={noEstonianId}
              onChange={(e) => handleNoEstonianIdToggle(e.target.checked)}
              className="w-4 h-4"
              disabled={disabled}
            />
            <label htmlFor="noEstonianId" className="text-sm font-medium">
              {t(`${translationPrefix}.no_estonian_id`)}
            </label>
          </div>

          {noEstonianId ? (
            <select
              value={playerData.sex}
              onChange={(e) => updatePlayerField("sex", e.target.value)}
              className="px-3 py-2 border rounded-md"
              disabled={disabled}
              required
            >
              <option value="">{t(`${translationPrefix}.gender.placeholder`)}</option>
              <option value="M">{t(`${translationPrefix}.gender.male`)}</option>
              <option value="N">{t(`${translationPrefix}.gender.female`)}</option>
            </select>
          ) : (
            playerData.sex && (
              <div className="px-3 py-2 border rounded-md bg-gray-50">
                <div className="text-xs text-gray-600 mb-1">
                  {t(`${translationPrefix}.gender.placeholder`)}
                </div>
                <div className="text-sm font-medium">
                  {playerData.sex === "M"
                    ? t(`${translationPrefix}.gender.male`)
                    : t(`${translationPrefix}.gender.female`)}
                </div>
                <div className="text-xs text-gray-500">
                  {t(`${translationPrefix}.auto_generated`)}
                </div>
              </div>
            )
          )}
        </div>

        {(validationErrors.isikukood || validationErrors.birth_date) && (
          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-red-700">
              {validationErrors.isikukood || validationErrors.birth_date}
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button
            type="submit"
            disabled={disabled}
            className={`w-full ${submitButtonClassName}`}
          >
            {submitButtonIcon || <Plus className="w-4 h-4 mr-2" />}
            {submitButtonText || t(`${translationPrefix}.submit_button`)}
          </Button>
        </div>
      </form>
    </div>
  );
}
