import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "@/types/users";
import { Calculator, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner'

interface Props {
    isRatingCalculatorOpen: boolean;
    setIsRatingCalculatorOpen: (isOpen: boolean) => void;
    users: User[];
}

export default function RatingCalculator({ isRatingCalculatorOpen, setIsRatingCalculatorOpen, users }: Props) {
    const { t } = useTranslation()
    const [openWinner, setOpenWinner] = useState(false);
    const [openLoser, setOpenLoser] = useState(false);
    const [calculatorResult, setCalculatorResult] = useState<{
        winner: { name: string; change: number; rating: number; hv: number; rawChange: number };
        loser: { name: string; change: number; rating: number; hk: number; rawChange: number };
    } | null>(null);

    const [calculatorForm, setCalculatorForm] = useState({
        winner: "",
        loser: "",
        date: "",
    });


    const handleCalculatorSubmit = () => {
        if (
            !calculatorForm.winner ||
            !calculatorForm.loser ||
            !calculatorForm.date
        ) {
            toast.error(t("rating.calculator.fill_all_fields"));
            return;
        }

        const winnerPlayer = users.find(
            (u) => `${u.first_name} ${u.last_name}` === calculatorForm.winner
        );
        const loserPlayer = users.find(
            (u) => `${u.first_name} ${u.last_name}` === calculatorForm.loser
        );

        if (winnerPlayer?.sex !== loserPlayer?.sex) {
            toast.error(t("rating.calculator.players_same_sex"));
            return
        }

        if (!winnerPlayer || !loserPlayer) {
            toast.error(t("rating.calculator.players_not_found"));
            return;
        }

        if (winnerPlayer.id === loserPlayer.id) {
            toast.error(t("rating.calculator.players_same"));
            return;
        }

        const ratingChange = calculateRatingGain(
            winnerPlayer.rate_points,
            loserPlayer.rate_points,
            winnerPlayer.rate_weigth,
            loserPlayer.rate_weigth
        );

        setCalculatorResult({
            winner: {
                name: `${winnerPlayer.first_name} ${winnerPlayer.last_name}`,
                change: ratingChange.winnerGain,
                rating: winnerPlayer.rate_points,
                hv: ratingChange.winnerHv,
                rawChange: ratingChange.winnerRawChange,
            },
            loser: {
                name: `${loserPlayer.first_name} ${loserPlayer.last_name}`,
                change: ratingChange.loserLoss,
                rating: loserPlayer.rate_points,
                hk: ratingChange.loserHk,
                rawChange: ratingChange.loserRawChange,
            },
        });
    };

    const resetCalculatorForm = () => {
        setCalculatorForm({
            winner: "",
            loser: "",
            date: "",
        });
        setOpenWinner(false);
        setOpenLoser(false);
        setCalculatorResult(null);
    };

    const calculateRatingGain = (winnerRating: number, loserRating: number, winnerWeight: number, loserWeight: number) => {
        const Rv = Math.abs(winnerRating - loserRating);
        let Hv = 0; // win value for winner
        let Hk = 0; // loss value for loser (positive, will be made negative)

        if (winnerRating >= loserRating) {
            if (Rv <= 10) {
                Hv = 2;
                Hk = 2;
            } else if (Rv >= 11 && Rv <= 30) {
                Hv = 1;
                Hk = 1;
            } else {
                Hv = 0;
                Hk = 0;
            }
        } else {
            const points = Math.round((Rv + 5) / 3);
            Hv = points;
            if (Hv > 15) {
                Hv = 15
            }
            Hk = points;
        }

        const coef = 1;
        let winnerKa = Math.min(winnerWeight, 30);
        const loserKa = Math.min(loserWeight, 30);
        winnerKa = 20

        const winnerRatingChange = (((Hv - 0) * 10) + (Hv * coef)) / (winnerKa + (Hv + 0));

        const loserRatingChange = (((0 - Hk) * 10) + (0 * coef)) / (loserKa + (0 + Hk));

        return {
            winnerGain: Math.round(winnerRatingChange),
            loserLoss: Math.round(loserRatingChange),
            winnerHv: Hv,
            loserHk: Hk,
            winnerRawChange: Hv,
            loserRawChange: -Hk
        };
    };


    return (
        <Dialog
            open={isRatingCalculatorOpen}
            onOpenChange={setIsRatingCalculatorOpen}
        >
            <DialogContent className="w-[85vw] max-w-sm mx-auto max-h-[85vh] overflow-y-auto rounded-xl animate-in fade-in-0 zoom-in-95 duration-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#4C97F1]">
                        <Calculator className="h-5 w-5" />
                        {t("rating.calculator.title")}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-3">
                    <div className="space-y-2">
                        <Label htmlFor="winner">{t("rating.calculator.winner")}</Label>
                        <Popover open={openWinner} onOpenChange={setOpenWinner}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openWinner}
                                    className="w-full justify-between"
                                >
                                    {calculatorForm.winner ||
                                        t("rating.calculator.select_player")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0">
                                <Command>
                                    <CommandInput
                                        placeholder={t("rating.calculator.search_player")}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            {t("rating.calculator.no_player_found")}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {users.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={`${user.first_name} ${user.last_name}`}
                                                    onSelect={(currentValue) => {
                                                        setCalculatorForm((prev) => ({
                                                            ...prev,
                                                            winner: currentValue,
                                                        }));
                                                        setOpenWinner(false);
                                                    }}
                                                    className="px-2 py-2 text-sm"
                                                >
                                                    <Check
                                                        className={`mr-2 h-3 w-3 sm:h-4 sm:w-4 ${calculatorForm.winner ===
                                                            `${user.first_name} ${user.last_name}`
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <span className="text-xs sm:text-sm">
                                                        {user.first_name} {user.last_name} ({user.rate_points} RP)
                                                    </span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="loser">{t("rating.calculator.loser")}</Label>
                        <Popover open={openLoser} onOpenChange={setOpenLoser}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openLoser}
                                    className="w-full justify-between"
                                >
                                    {calculatorForm.loser ||
                                        t("rating.calculator.select_player")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0">
                                <Command>
                                    <CommandInput
                                        placeholder={t("rating.calculator.search_player")}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            {t("rating.calculator.no_player_found")}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {users.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={`${user.first_name} ${user.last_name}`}
                                                    onSelect={(currentValue) => {
                                                        setCalculatorForm((prev) => ({
                                                            ...prev,
                                                            loser: currentValue,
                                                        }));
                                                        setOpenLoser(false);
                                                    }}
                                                    className="px-2 py-2 text-sm"
                                                >
                                                    <Check
                                                        className={`mr-2 h-3 w-3 sm:h-4 sm:w-4 ${calculatorForm.loser ===
                                                            `${user.first_name} ${user.last_name}`
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <span className="text-xs sm:text-sm">
                                                        {user.first_name} {user.last_name} ({user.rate_points} RP)
                                                    </span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">{t("rating.calculator.date")}</Label>
                        <Input
                            id="date"
                            type="date"
                            value={calculatorForm.date}
                            onChange={(e) =>
                                setCalculatorForm((prev) => ({
                                    ...prev,
                                    date: e.target.value,
                                }))
                            }
                            className="w-full"
                        />
                    </div>

                    {calculatorResult && (
                        <div className="mt-4 p-3 bg-[#4C97F1]/5 border border-[#4C97F1]/20 rounded-lg animate-in slide-in-from-top-2 fade-in-0 duration-300">
                            <h3 className="text-base sm:text-lg font-semibold text-[#4C97F1] mb-2 sm:mb-3 flex items-center gap-2">
                                <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-sm sm:text-base">{t("rating.calculator.result_title")}</span>
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="p-2 sm:p-3 bg-white rounded-md border">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 text-sm sm:text-base">
                                                {calculatorResult.winner.name} (Võitja)
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-600">
                                                {calculatorResult.winner.rating} RP
                                            </span>
                                        </div>
                                        <div
                                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto ${calculatorResult.winner.change >= 0
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {calculatorResult.winner.change >= 0 ? "+" : ""}
                                            {calculatorResult.winner.change}{" "}
                                            {t("rating.calculator.points")}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">Hv (võidupunktid):</span>
                                            <span className="font-mono text-xs">{calculatorResult.winner.hv}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">Enne kaalude arvestust:</span>
                                            <span className="font-mono text-xs">+{calculatorResult.winner.rawChange}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">Pärast kaalude arvestust:</span>
                                            <span className="font-mono text-xs">{calculatorResult.winner.change >= 0 ? "+" : ""}{calculatorResult.winner.change}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-white rounded-md border">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 text-sm sm:text-base">
                                                {calculatorResult.loser.name} (Kaotaja)
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-600">
                                                {calculatorResult.loser.rating} RP
                                            </span>
                                        </div>
                                        <div
                                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto ${calculatorResult.loser.change >= 0
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {calculatorResult.loser.change >= 0 ? "+" : ""}
                                            {calculatorResult.loser.change}{" "}
                                            {t("rating.calculator.points")}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">Hk (kaotuspunktid):</span>
                                            <span className="font-mono text-xs">{calculatorResult.loser.hk}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">Enne kaalude arvestust:</span>
                                            <span className="font-mono text-xs">{calculatorResult.loser.rawChange}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">Pärast kaalude arvestust:</span>
                                            <span className="font-mono text-xs">{calculatorResult.loser.change >= 0 ? "+" : ""}{calculatorResult.loser.change}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between gap-2 pt-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetCalculatorForm();
                                setIsRatingCalculatorOpen(false);
                            }}
                            className="w-full sm:w-auto"
                        >
                            {t("rating.calculator.cancel")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCalculatorSubmit}
                            className="w-full sm:w-auto bg-[#4C97F1] hover:bg-[#4C97F1]/90"
                        >
                            {t("rating.calculator.calculate")}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    )
}