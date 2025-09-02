import * as XLSX from 'xlsx'
import { Participant } from '@/types/participants'
import { TournamentTable } from '@/types/groups'

interface ExportStandingsOptions {
  participants: Participant[]
  tournament_table: TournamentTable
  ratingFilter: string
  sexFilter: string
  ageClassFilter: string
  t: (key: string, options?: any) => string
}

export const exportStandingsToExcel = ({
  participants,
  tournament_table,
  ratingFilter,
  sexFilter,
  ageClassFilter,
  t
}: ExportStandingsOptions) => {
  if (!participants.length) return

  // Create filter info string
  const activeFilters = []
  if (ratingFilter !== "all") {
    activeFilters.push(`${t('competitions.standings.filter.rating_placeholder')}: ${ratingFilter}+`)
  }
  if (sexFilter !== "all") {
    const sexLabel = sexFilter === "M" ? t('competitions.standings.filter.men') : t('competitions.standings.filter.women')
    activeFilters.push(`${t('competitions.standings.filter.sex_placeholder')}: ${sexLabel}`)
  }
  if (ageClassFilter !== "all") {
    activeFilters.push(`${t('competitions.standings.filter.age_placeholder')}: ${ageClassFilter.toUpperCase()}`)
  }
  
  const filterText = activeFilters.length > 0 
    ? `Lisatud filtrid: ${activeFilters.join(', ')}`
    : 'Filtreid pole lisatud'

  const worksheetData = participants.map((participant, index) => {
    const player = participant.players?.[0]
    const baseRating = player?.rank || 0

    return {
      [t('competitions.standings.placement')]: index + 1,
      [t('competitions.standings.participants')]: participant.name,
      [t('competitions.standings.rating')]: baseRating === 0 ? "-" : baseRating,
      'ELTL ID': participant.players && participant.players.length > 1
        ? participant.players.map(p => p.extra_data?.eltl_id).filter(Boolean).join(' & ')
        : participant.players?.[0]?.extra_data?.eltl_id || "-",
      [t('competitions.standings.sex')]: participant.players && participant.players.length > 1
        ? "-"
        : participant.players?.[0]?.sex || "-",
      [t('competitions.standings.yob')]: participant.players && participant.players.length > 1
        ? "-"
        : participant.players?.[0]?.birthdate?.slice(0, 4) || "-",
      [t('competitions.standings.club')]: participant.players && participant.players.length > 1
        ? participant.players.map(p => p.extra_data?.club).filter(Boolean).join(' & ')
        : participant.players?.[0]?.extra_data?.club || "-"
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  
  // Shift data down by one row to make room for filter info
  const originalRange = XLSX.utils.decode_range(worksheet['!ref']!)
  const newRange = { s: { r: 0, c: 0 }, e: { r: originalRange.e.r + 1, c: originalRange.e.c } }
  
  // Move all existing data down one row
  for (let row = originalRange.e.r; row >= 0; row--) {
    for (let col = 0; col <= originalRange.e.c; col++) {
      const oldAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const newAddress = XLSX.utils.encode_cell({ r: row + 1, c: col })
      if (worksheet[oldAddress]) {
        worksheet[newAddress] = worksheet[oldAddress]
        delete worksheet[oldAddress]
      }
    }
  }
  
  // Add filter info in the first row
  worksheet['A1'] = { v: filterText, t: 's' }
  worksheet['!ref'] = XLSX.utils.encode_range(newRange)
  
  // Set column widths for better formatting
  const columnWidths = [
    { wch: 8 },   // Placement
    { wch: 25 },  // Participants
    { wch: 10 },  // Rating
    { wch: 12 },  // ELTL ID
    { wch: 8 },   // Sex
    { wch: 12 },  // YoB
    { wch: 30 }   // Club
  ]
  worksheet['!cols'] = columnWidths
  
  // Style the filter info row (row 1)
  worksheet['A1'].s = {
    font: { bold: true, italic: true },
    fill: { fgColor: { rgb: "F3F4F6" } },
    alignment: { horizontal: "left", vertical: "center" }
  }
  
  // Merge cells for filter info across all columns
  const currentRange = XLSX.utils.decode_range(worksheet['!ref']!)
  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: currentRange.e.c } }]

  // Style the header row (now row 2)
  for (let col = currentRange.s.c; col <= currentRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col })
    if (!worksheet[cellAddress]) continue
    
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    }
  }
  
  // Add borders to data cells (skip filter info row)
  for (let row = 1; row <= currentRange.e.r; row++) {
    for (let col = currentRange.s.c; col <= currentRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (!worksheet[cellAddress]) continue
      
      if (!worksheet[cellAddress].s) {
        worksheet[cellAddress].s = {}
      }
      
      if (row > 1) { // Only add borders to data rows, not header row
        worksheet[cellAddress].s.border = {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      }
      
      // Left align all data columns
      if (row > 1) {
        if (!worksheet[cellAddress].s.alignment) {
          worksheet[cellAddress].s.alignment = { horizontal: "left" }
        }
      }
    }
  }
  
  // Create filename with filter info
  const filterSuffix = []
  if (ratingFilter !== "all") {
    filterSuffix.push(`R${ratingFilter}+`)
  }
  if (sexFilter !== "all") {
    filterSuffix.push(sexFilter)
  }
  if (ageClassFilter !== "all") {
    filterSuffix.push(ageClassFilter.toUpperCase())
  }
  
  const filename = filterSuffix.length > 0 
    ? `${tournament_table.class}-${filterSuffix.join('-')}.xlsx`
    : `${tournament_table.class}.xlsx`

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, t('competitions.standings.participants'))
  
  XLSX.writeFile(workbook, filename)
}