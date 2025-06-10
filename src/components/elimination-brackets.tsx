import { Bracket, BracketType } from "@/types/brackets";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import { SingleElimination } from "./single-elimination";
import { DoubleElimination } from "./double-elimination";
import { parseTableType } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useRef } from "react";
import { Button } from "./ui/button";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PrintPDF } from "./print-pdf";
import { toast } from "sonner";

interface TournamentTableProps {
  admin?: boolean;
  data: Bracket;
  tournament_table: TournamentTable;
  handleSelectMatch?: (match: MatchWrapper) => void;
}

export const EliminationBrackets = ({
  admin = false,
  data,
  tournament_table,
  handleSelectMatch,
}: TournamentTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handlePrint = async () => {
    try {
      const title = tournament_table
        ? `${tournament_table.class} Tournament`
        : "Tournament Bracket";
      await PrintPDF("bracket-container", title, true);
    } catch (error) {
      void error;
      toast.error("Failed to print brackets");
    }
  };

  return (
    <div>
      <div className="z-40 top-0 w-full flex xl:justify-end ">
        <div className=" px-4 flex flex-col w-full bg-[#F8F9FA] rounded-t pdf-background">
          <div className="flex justify-between mt-2 items-center"></div>
          <div className="flex justify-between z-10">
            <h1 className="text-base font-medium">{tournament_table.class}</h1>
            <Button
              variant="outline"
              className="self-end"
              onClick={handlePrint}
            >
              <Printer className="mr-1 h-4 w-4" />
              {t("admin.tournaments.groups.tables.print")}
            </Button>
          </div>
          <div className="z-10 pdf-remove-in-print">
            <h2 className="pdf-remove-in-print text-xs">
              {parseTableType(tournament_table.type)}
            </h2>
          </div>
          <Separator className="my-1 z-10" />
          <Tabs
            defaultValue={data?.eliminations[0]?.elimination[0].name}
            className="z-10"
          >
            <TabsList className="flex w-full justify-start gap-6 px-0 text-black bg-transparent overflow-x-auto">
              {data.eliminations.map((item, index) => (
                <TabsTrigger
                  key={index}
                  value={item.elimination[0].name}
                  className="px-0 text-sm data-[state=active]:underline data-[state=active]:bg-transparent data-[state=active]:text-gray-500 data-[state=active]:shadow-none data-[state=active]:border-none bg-transparent"
                  onClick={() => {
                    const container = scrollContainerRef.current;
                    const targetElement = document.getElementById(
                      item.elimination[0].name,
                    );

                    if (container && targetElement) {
                      const containerRect = container.getBoundingClientRect();
                      const targetRect = targetElement.getBoundingClientRect();
                      const scrollTop =
                        targetRect.top -
                        containerRect.top +
                        container.scrollTop -
                        50;
                      container.scrollTo({
                        top: scrollTop,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  {item.elimination[0].name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="bg-[#F8F9FA] relative h-[70vh] flex flex-col overflow-auto"
      >
        <div className="flex flex-col gap-10 px-10">
          {data.eliminations.map((eliminations, eliminationIndex) => {
            return eliminations.elimination.map((table, tableIndex) => {
              const uniqueKey = `elimination-${eliminationIndex}-table-${tableIndex}`;
              const uniqueId = `${eliminations.elimination[0].name}`;

              return (
                <div key={uniqueKey}>
                  <div className="font-bold text-xl py-4">{table.name}</div>
                  {table.name !== BracketType.MIINUSRING ? (
                    <div className="" id={uniqueId}>
                      <SingleElimination
                        admin={admin}
                        tournament_table={tournament_table}
                        data={table}
                        handleSelectMatch={handleSelectMatch}
                      />
                    </div>
                  ) : (
                    <div className="" id={uniqueId}>
                      <DoubleElimination
                        admin={admin}
                        tournament_table={tournament_table}
                        data={table}
                        handleSelectMatch={handleSelectMatch}
                      />
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};

