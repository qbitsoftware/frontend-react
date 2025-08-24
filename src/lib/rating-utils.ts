import { User } from "@/types/users";
import { TFunction } from "i18next";

// tabelipõhised asjad

export const calculateAgeFromBirthDate = (birthDateString: string): number => {
  const birthDate = new Date(birthDateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export const filterByAgeClass = (user: User, ageClass: string) => {
  const birthYear = new Date(user.birth_date).getFullYear();
  const currentYear = new Date().getFullYear();
  const sex = user.sex;

  switch (ageClass) {
    case "boys_u9":
      return birthYear >= (currentYear - 8) && sex === "M";
    case "girls_u9":
      return birthYear >= (currentYear - 8) && sex === "N";
    case "boys_u11":
      return birthYear >= (currentYear - 10) && sex === "M";
    case "girls_u11":
      return birthYear >= (currentYear - 10) && sex === "N";
    case "boys_u13":
      return birthYear >= (currentYear - 12) && sex === "M";
    case "girls_u13":
      return birthYear >= (currentYear - 12) && sex === "N";
    case "boys_u15":
      return birthYear >= (currentYear - 14) && sex === "M";
    case "girls_u15":
      return birthYear >= (currentYear - 14) && sex === "N";
    case "boys_u19":
      return birthYear >= (currentYear - 18) && sex === "M";
    case "girls_u19":
      return birthYear >= (currentYear - 18) && sex === "N";
    default:
      return true;
  }
}

export const modifyTitleDependingOnFilter = (
  t: TFunction,
  showCombined: boolean,
  sex: string,
  ageClass: string
): string => {
  let prefix = t('rating.header_prefix.combined');

  if (!showCombined) {
    if (sex === 'M') {
      switch (ageClass) {
        case 'boys_u9':
          prefix = t('rating.header_prefix.boys_u9');
          break;
        case 'boys_u11':
          prefix = t('rating.header_prefix.boys_u11');
          break;
        case 'boys_u13':
          prefix = t('rating.header_prefix.boys_u13');
          break;
        case 'boys_u15':
          prefix = t('rating.header_prefix.boys_u15');
          break;
        case 'boys_u19':
          prefix = t('rating.header_prefix.boys_u19');
          break;
        default:
          prefix = t('rating.header_prefix.men');
          break;
      }
    } else if (sex === 'N') {
      switch (ageClass) {
        case 'girls_u9':
          prefix = t('rating.header_prefix.girls_u9');
          break;
        case 'girls_u11':
          prefix = t('rating.header_prefix.girls_u11');
          break;
        case 'girls_u13':
          prefix = t('rating.header_prefix.girls_u13');
          break;
        case 'girls_u15':
          prefix = t('rating.header_prefix.girls_u15');
          break;
        case 'girls_u19':
          prefix = t('rating.header_prefix.girls_u19');
          break;
        default:
          prefix = t('rating.header_prefix.women');
          break;
      }
    }
  }

  return prefix + " " + t('rating.header');
};

export const getYear = (date: string) => {
  return new Date(date).getFullYear()
}
