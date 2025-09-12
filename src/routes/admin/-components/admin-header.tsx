import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { PlusCircle, Search } from "lucide-react";

interface Props {
    title: string;
    description: string;
    href: string | (() => void);
    add_new?: string;
    input_placeholder?: string;
    searchTerm?: string;
    setSearchTerm?: (term: string) => void;
    feedback?: boolean;
    club?: boolean
}

export default function AdminHeader({ title, description, href, add_new, input_placeholder, searchTerm, setSearchTerm, feedback = false, club = false }: Props) {
    return (
        <>
            <div className="flex flex-col md:flex-row md:justify-between items-center mb-8">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h3 className="font-bold text-gray-900">
                        {title}
                    </h3>
                    <p className="text-gray-600 mt-1">{description}</p>
                </div>
                {!feedback && typeof href === "string" ? (
                    <Link to={href}>
                        <Button className="flex items-center text-white w-full sm:w-auto bg-[#4C97F1]">
                            <PlusCircle className="w-4 h-4 mr-1" />
                            {add_new}
                        </Button>
                    </Link>
                ) : !feedback ? (
                    <Button className="flex items-center text-white w-full sm:w-auto bg-[#4C97F1]" onClick={typeof href === "function" ? href : undefined}>
                        <PlusCircle className="w-4 h-4 mr-1" />
                        {add_new}
                    </Button>
                ) : null}
            </div>

            {(!feedback && !club) && <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 ">
                <div className="relative w-full sm:w-1/3">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={input_placeholder}
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm?.(e.target.value)}
                    />
                </div>
            </div>
            }
        </>
    )
}