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
  const age = calculateAgeFromBirthDate(user.birth_date);
  console.log(user.first_name, user.last_name, age)
  const sex = user.sex;

  switch (ageClass) {
    case "cadet_boys":
      return age <= 15 && sex === "M";
    case "cadet_girls":
      return age <= 15 && sex === "N";
    case "junior_boys":
      return age <= 18 && sex === "M";
    case "junior_girls":
      return age <= 18 && sex === "N";
    case "senior_men":
      return age >= 30 && sex === "M";
    case "senior_women":
      return age >= 30 && sex === "N";
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
        case 'cadet_boys':
          prefix = t('rating.header_prefix.cadet_boys');
          break;
        case 'junior_boys':
          prefix = t('rating.header_prefix.junior_boys');
          break;
        case 'senior_men':
          prefix = t('rating.header_prefix.senior_men');
          break;
        default:
          prefix = t('rating.header_prefix.men');
          break;
      }
    } else if (sex === 'N') {
      switch (ageClass) {
        case 'cadet_girls':
          prefix = t('rating.header_prefix.cadet_girls');
          break;
        case 'junior_girls':
          prefix = t('rating.header_prefix.junior_girls');
          break;
        case 'senior_women':
          prefix = t('rating.header_prefix.senior_women');
          break;
        default:
          prefix = t('rating.header_prefix.women');
          break;
      }
    } else if (ageClass === 'senior') {
      prefix = t('rating.header_prefix.senior');
    }
  }

  return prefix + " " + t('rating.header');
};

export const getYear = (date: string) => {
  return new Date(date).getFullYear()
}
