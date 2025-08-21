import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MatchWrapper } from "@/types/matches";

interface TableContentProps {
  match: MatchWrapper;
}

const handleScore = (match: MatchWrapper) => {
  let p1_score = 0;
  let p2_score = 0;
  const scores = match.match.extra_data.score;
  if (!scores) {
    return { p1_score, p2_score };
  }
  for (let i = 0; i < scores.length; i++) {
    if (
      scores[i].p1_score >= 11 &&
      scores[i].p1_score - scores[i].p2_score >= 2
    ) {
      p1_score++;
    }
  }
  for (let i = 0; i < scores.length; i++) {
    if (
      scores[i].p2_score >= 11 &&
      scores[i].p2_score - scores[i].p1_score >= 2
    ) {
      p2_score++;
    }
  }
  return { p1_score, p2_score };
};

const TableContent: React.FC<TableContentProps> = ({ match }) => {
  const { p1_score, p2_score } = handleScore(match);

  return (
    <TableRow
      key={match.match.id}
      className="cursor-pointer hover:bg-secondary/50"
    >
      {match.p1.id !== "" ? (
        <TableCell className="font-medium">{match.p1.name}</TableCell>
      ) : (
        <TableCell className="text-gray-500">Selgumisel</TableCell>
      )}
      {match.p2.id !== "" ? (
        <TableCell className="font-medium">{match.p2.name}</TableCell>
      ) : (
        <TableCell className="text-gray-500">Selgumisel</TableCell>
      )}
      <TableCell className="font-medium">
        {match.match.extra_data.score &&
        match.match.extra_data.score?.length > 0 ? (
          <p>
            <span
              className={cn(
                p1_score > p2_score ? "text-green-500" : "text-red-500",
              )}
            >
              {p1_score}
            </span>{" "}
            -{" "}
            <span
              className={cn(
                p1_score > p2_score ? "text-red-500" : "text-green-500",
              )}
            >
              {p2_score}
            </span>{" "}
          </p>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="font-medium">
        {match.match.extra_data.table}
      </TableCell>
      {match.match.start_date == null ? (
        <TableCell className="text-gray-500">Määramata</TableCell>
      ) : (
        <TableCell className="font-medium">
          {String(match.match.start_date)}
        </TableCell>
      )}
      <TableCell>{match.class}</TableCell>
    </TableRow>
  );
};

export default TableContent;
