import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { capitalizeWords, extractBirthDateFromIsikukood } from "@/lib/utils";
import { Player } from "@/types/players";

interface NewPlayerDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    player: Player
    onPlayerUpdate?: (updatedPlayer: Player) => void;
}

interface PlayerData {
    first_name: string;
    last_name: string;
    isikukood: string;
    birth_date: string;
    sex: string;
    foreign_player: boolean;
}

interface ValidationErrors {
    first_name?: string;
    last_name?: string;
    isikukood?: string;
    birth_date?: string;
    sex?: string;
}

export function NewPlayerDialog({ isOpen, onOpenChange, player, onPlayerUpdate }: NewPlayerDialogProps) {
    const { t } = useTranslation();

    const [playerData, setPlayerData] = useState<PlayerData>({
        first_name: player.first_name,
        last_name: player.last_name,
        isikukood: "",
        birth_date: "",
        sex: "",
        foreign_player: false,
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [autoExtractedData, setAutoExtractedData] = useState<{
        birth_date?: string;
        sex?: string;
    }>({});

    useEffect(() => {
        if (isOpen) {
            setPlayerData({
                first_name: player.first_name,
                last_name: player.last_name,
                isikukood: "",
                birth_date: "",
                sex: "",
                foreign_player: false,
            });
            setErrors({});
            setAutoExtractedData({});
        }
    }, [isOpen, player]);

    useEffect(() => {
        if (playerData.isikukood && !playerData.foreign_player) {
            const extracted = extractBirthDateFromIsikukood(playerData.isikukood);
            if (extracted) {
                setAutoExtractedData({
                    birth_date: extracted.dateString,
                    sex: extracted.sex,
                });
                setPlayerData(prev => ({
                    ...prev,
                    birth_date: extracted.dateString,
                    sex: extracted.sex,
                }));
            } else {
                setAutoExtractedData({});
            }
        } else {
            setAutoExtractedData({});
        }
    }, [playerData.isikukood, playerData.foreign_player]);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!playerData.first_name.trim()) {
            newErrors.first_name = t("register.form.errors.first_name");
        }

        if (!playerData.last_name.trim()) {
            newErrors.last_name = t("register.form.errors.last_name");
        }

        if (!playerData.foreign_player) {
            if (!playerData.isikukood.trim()) {
                newErrors.isikukood = t("licenses.validation.invalid_isikukood");
            } else {
                const isOnlyNumbers = /^\d+$/.test(playerData.isikukood);
                if (!isOnlyNumbers) {
                    newErrors.isikukood = t("licenses.validation.invalid_isikukood");
                } else {
                    const extracted = extractBirthDateFromIsikukood(playerData.isikukood);
                    if (!extracted) {
                        newErrors.isikukood = t("licenses.validation.invalid_isikukood");
                    }
                }
            }
        } else {
            if (!playerData.birth_date) {
                newErrors.birth_date = t("register.form.errors.date_of_birth");
            }
            if (!playerData.sex) {
                newErrors.sex = t("register.form.errors.sex");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const updatedPlayer: Player = {
            ...player,
            first_name: capitalizeWords(playerData.first_name),
            last_name: capitalizeWords(playerData.last_name),
            isikukood: playerData.isikukood,
            sex: playerData.sex,
            birthdate: playerData.birth_date,
            extra_data: {
                ...player.extra_data,
                foreign_player: playerData.foreign_player,
            }
        }
        onPlayerUpdate?.(updatedPlayer)
        onOpenChange(false);
    };

    const handleFieldChange = (field: keyof PlayerData, value: string | boolean) => {
        setPlayerData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const showBirthDateField = playerData.foreign_player || !autoExtractedData.birth_date;
    const showSexField = playerData.foreign_player || !autoExtractedData.sex;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("admin.clubs.players_modal.create_new.title")}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">{t("admin.clubs.players_modal.create_new.form.first_name")}</Label>
                        <Input
                            id="first_name"
                            value={playerData.first_name}
                            onChange={(e) => handleFieldChange('first_name', e.target.value)}
                            className={errors.first_name ? "border-red-300" : ""}
                        />
                        {errors.first_name && (
                            <p className="text-sm text-red-600">{errors.first_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last_name">{t("admin.clubs.players_modal.create_new.form.last_name")}</Label>
                        <Input
                            id="last_name"
                            value={playerData.last_name}
                            onChange={(e) => handleFieldChange('last_name', e.target.value)}
                            className={errors.last_name ? "border-red-300" : ""}
                        />
                        {errors.last_name && (
                            <p className="text-sm text-red-600">{errors.last_name}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="foreign_player"
                            checked={playerData.foreign_player}
                            onCheckedChange={(checked) => {
                                handleFieldChange('foreign_player', checked as boolean);
                                if (checked) {
                                    setPlayerData(prev => ({ ...prev, isikukood: "", birth_date: "", sex: "" }));
                                    setAutoExtractedData({});
                                }
                            }}
                        />
                        <Label htmlFor="foreign_player" className="text-sm font-medium">
                            {t("rating.player_modal.values.foreigner")}
                        </Label>
                    </div>

                    {!playerData.foreign_player && (
                        <div className="space-y-2">
                            <Label htmlFor="isikukood">{t("admin.clubs.players_modal.create_new.form.estonian_id")}</Label>
                            <Input
                                id="isikukood"
                                value={playerData.isikukood}
                                onChange={(e) => handleFieldChange('isikukood', e.target.value)}
                                className={errors.isikukood ? "border-red-300" : ""}
                                placeholder="39001010001"
                            />
                            {errors.isikukood && (
                                <p className="text-sm text-red-600">{errors.isikukood}</p>
                            )}
                        </div>
                    )}

                    {showBirthDateField && (
                        <div className="space-y-2">
                            <Label htmlFor="birth_date">{t("admin.clubs.players_modal.create_new.form.birth_date")}</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={playerData.birth_date}
                                onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                                className={errors.birth_date ? "border-red-300" : ""}
                            />
                            {errors.birth_date && (
                                <p className="text-sm text-red-600">{errors.birth_date}</p>
                            )}
                        </div>
                    )}

                    {!showBirthDateField && autoExtractedData.birth_date && (
                        <div className="space-y-2">
                            <Label>{t("admin.clubs.players_modal.create_new.form.birth_date")}</Label>
                            <div className="px-3 py-2 border rounded-md bg-gray-50">
                                <div className="text-sm font-medium">{autoExtractedData.birth_date}</div>
                                <div className="text-xs text-gray-500">{t("licenses.add_player.auto_generated")}</div>
                            </div>
                        </div>
                    )}

                    {showSexField && (
                        <div className="space-y-2">
                            <Label htmlFor="sex">{t("admin.clubs.players_modal.create_new.form.gender.placeholder")}</Label>
                            <Select
                                value={playerData.sex}
                                onValueChange={(value) => handleFieldChange('sex', value)}
                            >
                                <SelectTrigger className={errors.sex ? "border-red-300" : ""}>
                                    <SelectValue placeholder={t("admin.clubs.players_modal.create_new.form.gender.placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">{t("admin.clubs.players_modal.create_new.form.gender.male")}</SelectItem>
                                    <SelectItem value="N">{t("admin.clubs.players_modal.create_new.form.gender.female")}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.sex && (
                                <p className="text-sm text-red-600">{errors.sex}</p>
                            )}
                        </div>
                    )}

                    {!showSexField && autoExtractedData.sex && (
                        <div className="space-y-2">
                            <Label>{t("admin.clubs.players_modal.create_new.form.gender.placeholder")}</Label>
                            <div className="px-3 py-2 border rounded-md bg-gray-50">
                                <div className="text-sm font-medium">
                                    {autoExtractedData.sex === 'M'
                                        ? t("admin.clubs.players_modal.create_new.form.gender.male")
                                        : t("admin.clubs.players_modal.create_new.form.gender.female")
                                    }
                                </div>
                                <div className="text-xs text-gray-500">{t("licenses.add_player.auto_generated")}</div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t("admin.clubs.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                    >
                        {t("admin.clubs.players_modal.create_new.form.add_button")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
