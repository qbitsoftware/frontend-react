import i18n from "@/i18n";
import {
  ComplexNode,
  ContentBlock,
  ContentBlockWithImage,
  ContentBlockWithText,
  ContentNode,
  TextNode,
  YooptaContent,
} from "@/types/blogs";
import { TableMatch } from "@/types/brackets";
import { User } from "@/types/users";
import { YooptaContentValue } from "@yoopta/editor";
import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTournamentType(s: string): string {
  const parts = s.split("_");

  if (parts.length == 1) {
    return capitalize(s);
  }

  let res = "";
  parts.forEach((part) => {
    res += capitalize(part) + " ";
  });

  return res.trim();
}

export const formatTournamentType = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const createCategories = () => {
  const { t } = useTranslation()
  return [
    { id: "competitions", label: t('navbar.menu.news.competitions') },
    { id: "news", label: t('navbar.menu.news.name') },
    { id: "good_read", label: t('navbar.menu.news.good_read') },
    { id: "results", label: t('navbar.menu.news.results') },
  ]
};

export function parsePlaces(s: string): number | null {
  const parts = s.split(" ");
  if (parts.length != 2) {
    return null;
  }

  const startingPlace = parts[1].split("-")[0];

  return Number(startingPlace);
}

export const formatDateRange = (startDate: Date, endDate: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const start = new Intl.DateTimeFormat("et-EE", options).format(startDate);
  const end = new Intl.DateTimeFormat("et-EE", options).format(endDate);

  const startDay = start.split(" ")[0];
  const endDay = end.split(" ")[0];
  const monthYear = end.split(" ").slice(1).join(" ");

  return `${startDay} - ${endDay} ${monthYear}`;
};

export const replaceSpecialCharacters = (str: string) => {
  return str.replace(/[äöõü]/gi, (char) => {
    switch (char.toLowerCase()) {
      case "ä":
        return "a";
      case "ö":
        return "o";
      case "õ":
        return "o";
      case "ü":
        return "u";
      default:
        return char;
    }
  });
};

export function findEnemyName(
  p1: number,
  p2: number,
  current: number,
  players: User[],
): string {
  if (p1 == current) {
    const enemy = players.filter((player) => player.id == p2)[0];
    if (enemy) {
      return enemy.first_name + enemy.last_name;
    }
  } else {
    const enemy = players.filter((player) => player.id == p1)[0];
    if (enemy) {
      return enemy.first_name + enemy.last_name;
    }
  }
  return "";
}

export function formatDateStringYearMonthDay(dateStr: string): string {
  if (!dateStr) return '';

  try {
    const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return '';
  } catch (error) {
    void error
    return '';
  }
}

export const formatDateString = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const capitalizeName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export const formatDateTime = (dateTime: string) => {
  const [date, time] = dateTime.split("T");
  return `${date} ${time}`;
};

export const formatDateToNumber = (dateString: string) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;
  } catch (error) {
    void error;
    return dateString;
  }
};

export const formatDateTimeNew = (dateTime: string) => {
  const date = new Date(dateTime);

  return date.toLocaleString(i18n.language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDateGetDayMonthYear = (dateTime: string, timeZone?: string) => {
  const date = new Date(dateTime);
  const locale = i18n.language;
  const tz = timeZone || 'Europe/Tallinn';

  const dayOfWeek = date.toLocaleString(locale, { weekday: 'short', timeZone: tz });
  const dayOfMonth = parseInt(date.toLocaleString(locale, { day: 'numeric', timeZone: tz }));
  const month = date.toLocaleString(locale, { month: 'short', timeZone: tz });
  const year = parseInt(date.toLocaleString(locale, { year: 'numeric', timeZone: tz }));
  const ordinalSuffix = getLocalizedOrdinalSuffix(dayOfMonth, locale);

  return `${dayOfWeek}, ${dayOfMonth}${ordinalSuffix} ${month} ${year}`;
}

export const formatDateGetDayMonth = (dateTime: string) => {
  const date = new Date(dateTime);
  const locale = i18n.language;

  const dayOfWeek = date.toLocaleString(locale, { weekday: 'short' });
  const dayOfMonth = date.getDate();
  const month = date.toLocaleString(locale, { month: 'short' });
  const ordinalSuffix = getLocalizedOrdinalSuffix(dayOfMonth, locale);

  return `${dayOfWeek}, ${dayOfMonth}${ordinalSuffix} ${month}`;
}

const getLocalizedOrdinalSuffix = (day: number, locale: string): string => {
  if (locale.startsWith('en')) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  } else if (locale.startsWith('fr')) {
    return day === 1 ? 'er' : 'e';
  } else if (locale.startsWith('de')) {
    return '.';
  } else if (locale.startsWith('es')) {
    return 'º';
  } else if (locale.startsWith('et') || locale.startsWith('fi')) {
    return '.';
  } else if (locale.startsWith('ru')) {
    return '-е';
  } else {
    return '.';
  }
}

export const formatDateTimeBracket = (dateTime: string) => {
  const date = new Date(dateTime);

  if (isNaN(date.getTime())) return '';

  if (date.getTime() <= 86400000) {
    return '';
  }


  return date.toLocaleString(i18n.language, {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatDateGetHours = (dateTime: string, timeZone?: string) => {
  const date = new Date(dateTime);
  const tz = timeZone || 'Europe/Tallinn';
  return date.toLocaleString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz
  })
}

export const formatDate = (time: string) => {
  const date = new Date(time);

  const formattedDate = date.toLocaleDateString(i18n.language, {
    day: "numeric",
    month: "short",
  });

  return formattedDate;
};

export const radians = (angle: number) => {
  return angle * (Math.PI / 180);
};

export const CalculateSVGWidth = (
  matches: TableMatch[],
  vertical_gap: number,
) => {
  const matches_len = matches.reduce(
    (max, item) => (item.match.round > max.round ? item.match : max),
    { round: -Infinity },
  ).round;
  const SVG_WIDTH = matches_len * vertical_gap;
  return SVG_WIDTH;
};

export const CalculateSVGHeight = (
  matches: TableMatch[],
  horisontal_gap: number,
  height: number,
) => {
  const count = matches.filter((item) => item.match.round === 0).length || 0;
  let SVG_HEIGTH = count * (height + horisontal_gap);
  if (matches.length == 4) {
    SVG_HEIGTH += height;
  }
  return SVG_HEIGTH;
};

export const CalcCurrentRoundMatches = (
  matches: TableMatch[],
  round: number,
) => {
  const count =
    matches.filter((item) => item.match.round === round).length || 0;
  return count;
};

export function formatName(fullName: string) {
  const nameParts = fullName.trim().split(/[-\s]+/);

  if (nameParts.length === 1) {
    return capitalize(fullName);
  }

  const lastName = nameParts.pop();

  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase() + ".")
    .join(" ");

  if (lastName) {
    return `${initials} ${capitalize(lastName)}`;
  }
  return `${initials}`;
}

export function capitalize(word: string) {
  if (!word) return word;

  // we are capitalizing also for cases where it has '-' or '.' in the name, for '-' names or '.' for doubles
  return word
    .split(/([-.])/)
    .map((part) => {
      if (part === '-' || part === '.') {
        return part;
      }
      if (part) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      }
      return part;
    })
    .join('');
}

export const getRandomFlag = () => {
  // const flags = ["🇺🇸", "🇨🇦", "🇬🇧", "🇫🇷", "🇩🇪", "🇯🇵", "🇮🇹", "🇪🇸", "🇧🇷", "🇦🇺"];
  // return flags[Math.floor(Math.random() * flags.length)];
  return "";
};

export const isMaxUInt32 = (num: number) => {
  const MAX_UINT32 = 4294967295;
  return num === MAX_UINT32;
};

export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function parseTableType(s: string): string {
  const parts = s.split("_");

  if (parts.length == 1) {
    return capitalize(s);
  }

  let res = "";
  parts.forEach((part) => {
    res += capitalize(part) + " ";
  });

  return res.trim();
}

function isTextNode(node: ContentNode): node is TextNode {
  return "text" in node && typeof node.text === "string";
}

function hasChildren(
  node: ContentNode,
): node is ComplexNode & { children: ContentNode[] } {
  return "children" in node && Array.isArray(node.children);
}

export function contentParser(content?: YooptaContent | YooptaContentValue): {
  title: string;
  description: string;
  hasImages: boolean;
  imageUrl: string;
} {
  if (!content || typeof content !== "object") {
    return { title: "", description: "", hasImages: false, imageUrl: "" };
  }

  const blocks = Object.values(content) as ContentBlock[];

  const titleBlock = blocks.find(
    (block) =>
      block.type === "HeadingOne" ||
      block.type === "HeadingTwo" ||
      block.type === "HeadingThree",
  ) as ContentBlockWithText | undefined;

  let title = "";
  if (titleBlock?.value) {
    title = extractText(titleBlock.value);
  }

  const paragraphBlocks = blocks.filter(
    (block) =>
      block.type === "Paragraph" &&
      "value" in block &&
      block.value &&
      hasValidText(block.value),
  ) as ContentBlockWithText[];

  let description = "";
  for (const paragraphBlock of paragraphBlocks) {
    if (paragraphBlock.value) {
      const paragraphText = extractText(paragraphBlock.value);
      description += (description ? " " : "") + paragraphText;

      if (description.length >= 150) {
        break;
      }
    }
  }

  if (description.length > 150) {
    description = description.substring(0, 150) + "...";
  }

  const imageBlock = blocks.find((block) => block.type === "Image") as
    | ContentBlockWithImage
    | undefined;
  let imageUrl = "";
  let hasImages = false;

  if (
    imageBlock?.value &&
    Array.isArray(imageBlock.value) &&
    imageBlock.value.length > 0 &&
    imageBlock.value[0]?.props?.src
  ) {
    imageUrl = imageBlock.value[0].props.src;
    hasImages = true;
  }

  return { title, description, hasImages, imageUrl };
}

// Update your helper functions to use the new type guards
function extractText(children: ContentNode[]): string {
  if (!Array.isArray(children)) return "";

  return children
    .map((child) => {
      if (isTextNode(child)) {
        return child.text;
      }
      if (hasChildren(child)) {
        return extractText(child.children);
      }
      return "";
    })
    .join("")
    .trim();
}

function hasValidText(children: ContentNode[]): boolean {
  if (!Array.isArray(children)) return false;

  return children.some((child) => {
    if (isTextNode(child) && child.text.trim().length > 0) {
      return true;
    }
    if (hasChildren(child)) {
      return hasValidText(child.children);
    }
    return false;
  });
}

export const getDateForDay = (startDate: string, dayIndex: number): string => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayIndex);
  return date.toISOString();
};

export const playerFullNameFromName = (name: string) => {
  const lastIndex = name.lastIndexOf(" ")

  let firstName = name;
  let lastName = "";

  if (lastIndex !== -1) {
    firstName = name.substring(
      0,
      lastIndex
    );
    lastName = name.substring(
      lastIndex + 1
    )
  }

  return { firstName, lastName }
}

export function capitalizeWords(text: string): string {
  if (!text) return '';

  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

export const extractBirthDateFromIsikukood = (isikukood: string) => {
  if (!isikukood || isikukood.length < 7) return null;

  const firstDigit = parseInt(isikukood[0]);
  const year = isikukood.substring(1, 3);
  const month = isikukood.substring(3, 5);
  const day = isikukood.substring(5, 7);

  let century;
  const sex = firstDigit % 2 !== 0 ? "M" : "N";

  if (firstDigit >= 1 && firstDigit <= 2) {
    century = 1800;
  } else if (firstDigit >= 3 && firstDigit <= 4) {
    century = 1900;
  } else if (firstDigit >= 5 && firstDigit <= 6) {
    century = 2000;
  } else if (firstDigit >= 7 && firstDigit <= 8) {
    century = 2100;
  } else {
    return null;
  }

  const fullYear = century + parseInt(year);

  const monthNum = parseInt(month);
  const dayNum = parseInt(day);

  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
    return null;
  }

  return {
    year: fullYear,
    month: monthNum,
    day: dayNum,
    dateString: `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    sex: sex,
  };
};
