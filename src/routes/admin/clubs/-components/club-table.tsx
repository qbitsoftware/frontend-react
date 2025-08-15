import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Club } from "@/types/clubs";
import { useTranslation } from "react-i18next";

interface ClubTableProps {
  clubs: Club[];
  variant: "my-clubs" | "all-clubs";
  onEditClub?: (club: Club) => void;
  onManagePlayers?: (club: Club) => void;
}

export function ClubTable({ clubs, variant, onEditClub, onManagePlayers }: ClubTableProps) {
  const { t } = useTranslation();

  const isMyClubs = variant === "my-clubs";

  return (
    <Table className={isMyClubs ? "mb-8" : ""}>
      <TableHeader>
        <TableRow>
          {isMyClubs && <TableHead>{t("admin.clubs.table.actions")}</TableHead>}
          <TableHead>{t("admin.clubs.table.image")}</TableHead>
          <TableHead>{t("admin.clubs.table.name")}</TableHead>
          <TableHead>{t("admin.clubs.table.contact_person")}</TableHead>
          <TableHead>{t("admin.clubs.table.email")}</TableHead>
          <TableHead>{t("admin.clubs.table.phone")}</TableHead>
          {!isMyClubs && (
            <>
              <TableHead>{t("admin.clubs.table.address")}</TableHead>
              <TableHead>{t("admin.clubs.table.website")}</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {clubs
          .slice()
          .reverse()
          .map((club) => (
            <TableRow key={club.id}>
              {isMyClubs && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClub?.(club)}
                      className="flex items-center gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      {t("admin.clubs.buttons.manage_info")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManagePlayers?.(club)}
                      className="flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      {t("admin.clubs.buttons.manage_players")}
                    </Button>
                  </div>
                </TableCell>
              )}
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={club.image_url} alt={club.name} />
                  <AvatarFallback>
                    {club.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{club.name}</TableCell>
              <TableCell className="truncate">{club.contact_person}</TableCell>
              <TableCell className="truncate">{club.email}</TableCell>
              <TableCell className="truncate">{club.phone}</TableCell>
              {!isMyClubs && (
                <>
                  <TableCell className="truncate">{club.address}</TableCell>
                  <TableCell>
                    <a
                      href={club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {club.website.replace(/^https?:\/\//, "")}
                    </a>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
