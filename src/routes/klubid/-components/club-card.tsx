import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Club } from "@/types/clubs";
import { ChevronRight } from "lucide-react";

interface Props {
    setSelectedClub: (club: Club | null) => void;
    setIsModalOpen: (isOpen: boolean) => void;
    club: Club;
}
export default function ClubCard({ setSelectedClub, setIsModalOpen, club }: Props) {
    return (
        <Card
            onClick={() => {
                setSelectedClub(club);
                setIsModalOpen(true);
            }}
            className="flex flex-col h-full cursor-pointer"
        >
            <CardHeader className="flex-grow">
                <CardTitle className="text-lg font-semibold flex flex-row items-center justify-between gap-10 text-ellipsis">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={club.image_url} alt={club.name} />
                        <AvatarFallback>
                            {club.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {truncateName(club.name, 20)}
                    <ChevronRight className="text-stone-700 h-6" />
                </CardTitle>
            </CardHeader>
        </Card>

    )
}

function truncateName(name: string, maxLength = 15) {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "..";
}