import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function LanguageDropdown() {
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState("en");

    useEffect(() => {
        const storedLanguage = localStorage.getItem("i18nextLng");
        if (storedLanguage) {
            setCurrentLanguage(storedLanguage);
        }

        // Listen for language changes from other instances
        const handleLanguageChange = (lng: string) => {
            setCurrentLanguage(lng);
        };

        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setCurrentLanguage(lng);
    };

    const estFlag = <svg width="16" height="12" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">

        <g clipPath="url(#clip0_270_67356)">
            <rect width="32" height="24" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="#F7FCFF" />
            <mask id="mask0_270_67356" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="24">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="white" />
            </mask>
            <g mask="url(#mask0_270_67356)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 0V8H32V0H0Z" fill="#40A8FF" />
                <path fillRule="evenodd" clipRule="evenodd" d="M0 8V16H32V8H0Z" fill="#272727" />
            </g>
        </g>
        <defs>
            <clipPath id="clip0_270_67356">
                <rect width="32" height="24" fill="white" />
            </clipPath>
        </defs>
    </svg>


    const engFlag = <svg width="16" height="12" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_270_67366)">
            <rect width="32" height="24" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="#2E42A5" />
            <mask id="mask0_270_67366" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="24">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="white" />
            </mask>
            <g mask="url(#mask0_270_67366)">
                <path d="M-3.56311 22.2854L3.47858 25.2635L32.1598 3.23787L35.8741 -1.18761L28.3441 -2.18297L16.6457 7.3085L7.22968 13.7035L-3.56311 22.2854Z" fill="white" />
                <path d="M-2.59912 24.3719L0.988295 26.1001L34.5403 -1.59881H29.5032L-2.59912 24.3719Z" fill="#F50100" />
                <path d="M35.5631 22.2854L28.5214 25.2635L-0.159817 3.23787L-3.87415 -1.18761L3.65593 -2.18297L15.3543 7.3085L24.7703 13.7035L35.5631 22.2854Z" fill="white" />
                <path d="M35.3229 23.7829L31.7355 25.5111L17.4487 13.6518L13.2129 12.3267L-4.23151 -1.17246H0.805637L18.2403 12.0063L22.8713 13.5952L35.3229 23.7829Z" fill="#F50100" />
                <mask id="path-7-inside-1_270_67366" fill="white">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.7778 -2H12.2222V8H-1.97247V16H12.2222V26H19.7778V16H34.0275V8H19.7778V-2Z" />
                </mask>
                <path fillRule="evenodd" clipRule="evenodd" d="M19.7778 -2H12.2222V8H-1.97247V16H12.2222V26H19.7778V16H34.0275V8H19.7778V-2Z" fill="#F50100" />
                <path d="M12.2222 -2V-4H10.2222V-2H12.2222ZM19.7778 -2H21.7778V-4H19.7778V-2ZM12.2222 8V10H14.2222V8H12.2222ZM-1.97247 8V6H-3.97247V8H-1.97247ZM-1.97247 16H-3.97247V18H-1.97247V16ZM12.2222 16H14.2222V14H12.2222V16ZM12.2222 26H10.2222V28H12.2222V26ZM19.7778 26V28H21.7778V26H19.7778ZM19.7778 16V14H17.7778V16H19.7778ZM34.0275 16V18H36.0275V16H34.0275ZM34.0275 8H36.0275V6H34.0275V8ZM19.7778 8H17.7778V10H19.7778V8ZM12.2222 0H19.7778V-4H12.2222V0ZM14.2222 8V-2H10.2222V8H14.2222ZM-1.97247 10H12.2222V6H-1.97247V10ZM0.0275269 16V8H-3.97247V16H0.0275269ZM12.2222 14H-1.97247V18H12.2222V14ZM14.2222 26V16H10.2222V26H14.2222ZM19.7778 24H12.2222V28H19.7778V24ZM17.7778 16V26H21.7778V16H17.7778ZM34.0275 14H19.7778V18H34.0275V14ZM32.0275 8V16H36.0275V8H32.0275ZM19.7778 10H34.0275V6H19.7778V10ZM17.7778 -2V8H21.7778V-2H17.7778Z" fill="white" mask="url(#path-7-inside-1_270_67366)" />
            </g>
        </g>
        <defs>
            <clipPath id="clip0_270_67366">
                <rect width="32" height="24" fill="white" />
            </clipPath>
        </defs>
    </svg>



    const getCurrentFlag = () => {
        return currentLanguage === 'et' ? estFlag : engFlag;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="cursor-pointer px-4 py-4 mt-[2px] hover:bg-stone-100 rounded-[6px] flex items-center justify-center gap-2">
                    {getCurrentFlag()}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="flex items-center text-center gap-2">
                    {engFlag} <span>{t('navbar.language.english')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('et')} className="flex items-center text-center gap-2">
                    {estFlag} <span>{t('navbar.language.estonian')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}