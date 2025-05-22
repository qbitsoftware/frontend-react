import type { ColumnDef } from "@tanstack/react-table"
import { TableNumberForm } from "./table-number-form"
import { TFunction } from "i18next"
import { MatchWrapper } from "@/types/matches";

export function createColumns(t: TFunction<"translation", undefined>): ColumnDef<MatchWrapper>[] {

  return [
    {
      id: "actions",
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        void row;
        return null;
      },
    },
    {
      accessorKey: "",
      header: t("admin.tournaments.matches.table.serial_number"),
      cell: ({ row }) => {
        return row.index + 1
      }
    },
    {
      accessorKey: "match.round",
      header: t("admin.tournaments.matches.table.round"),
    },
    {
      accessorKey: "class",
      header: t("admin.tournaments.matches.table.class"),
    },
    {
      accessorKey: "match.extra_data.table",
      header: t("admin.tournaments.matches.table.table"),
      cell: ({ row }) => {
        const match = row.original
        return <TableNumberForm brackets={false} match={match.match} initialTableNumber={match.match.extra_data ? match.match.extra_data.table : "0"} />
      },
    },
    {
      accessorKey: "",
      header: t("admin.tournaments.matches.table.participant_1"),
      cell: ({ row }) => {
        if (row.original.match.p1_id == "empty") {
          return <div className="text-gray-400">{"Bye Bye"}</div>
        } else if (row.original.match.p1_id == "") {
          return <div></div>
        } else {
          return <>{row.original.p1.name}</>
        }
      }
    },
    {
      accessorKey: "p1_score",
      header: t("admin.tournaments.matches.table.participant_1_score"),
      cell: ({ row }) => {
        if (row.original.match.table_type == "champions_league") {
          return <>{row.original.match.extra_data.team_1_total}</>
        } else {
          let p1_score = 0
          const scores = row.original.match.extra_data.score
          if (!scores) {
            return <>{0}</>
          }
          for (let i = 0; i < scores.length; i++) {
            if (scores[i].p1_score >= 11 && scores[i].p1_score - scores[i].p2_score >= 2) {
              p1_score++
            }
          }
          return <>{p1_score}</>
        }
      }
    },
    {
      accessorKey: "p2_score",
      header: t("admin.tournaments.matches.table.participant_2_score"),
      cell: ({ row }) => {
        if (row.original.match.table_type == "champions_league") {
          return <>{row.original.match.extra_data.team_2_total}</>
        } else {
          let p2_score = 0
          const scores = row.original.match.extra_data.score
          if (!scores) {
            return <>{0}</>
          }
          for (let i = 0; i < scores.length; i++) {
            if (scores[i].p2_score >= 11 && scores[i].p2_score - scores[i].p1_score >= 2) {
              p2_score++
            }
          }
          return <>{p2_score}</>
        }
      }
    },
    {
      accessorKey: "",
      header: t("admin.tournaments.matches.table.participant_2"),
      cell: ({ row }) => {
        if (row.original.match.p2_id == "empty") {
          return <div className="text-gray-400">{"Bye Bye"}</div>
        } else if (row.original.match.p2_id == "") {
          return <div></div>
        } else {
          return <>{row.original.p2.name}</>
        }
      }
    },
    {
      accessorKey: "match.next_winner_bracket",
      header: t("admin.tournaments.matches.table.winner_placement"),
    },
    {
      accessorKey: "match.next_loser_bracket",
      header: t("admin.tournaments.matches.table.loser_placement"),
    },
    {
      accessorKey: "winner_id",
      header: t("admin.tournaments.matches.table.winner"),
      cell: ({ row }) => {
        const match = row.original
        const winner_name = match.match.winner_id == match.match.p1_id ? match.p1.name : match.p2.name
        if (match.match.p1_id == "empty" && match.match.p2_id == "empty") {
          return <div></div>
        } else if (match.match.winner_id) {
          return winner_name
        } else {
          return t("admin.tournaments.matches.not_played")
        }
      }
    },
  ]

}
