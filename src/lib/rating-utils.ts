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
  const birthYear = getYear(user.birth_date)
  const currentYear = new Date().getFullYear();

  switch (ageClass) {
    case "u9":
      return birthYear >= (currentYear - 8);
    case "u11":
      return birthYear >= (currentYear - 10);
    case "u13":
      return birthYear >= (currentYear - 12);
    case "u15":
      return birthYear >= (currentYear - 14);
    case "u19":
      return birthYear >= (currentYear - 18);
    case "u21":
      return birthYear >= (currentYear - 20);
    case "all":
    default:
      return true;
  }
}

export const filterByGender = (user: User, gender: string) => {
  switch (gender) {
    case "M":
      return user.sex === "M";
    case "N":
      return user.sex === "N";
    case "combined":
    default:
      return true;
  }
}

export const modifyTitleDependingOnFilter = (
  t: TFunction,
  gender: string,
  ageClass: string
): string => {
  let prefix = t('rating.header_prefix.combined');

  if (gender === 'combined') {
    prefix = t('rating.header_prefix.combined');
  } else {
    const genderPrefix = gender === 'M' ? 'men' : 'women';
    
    if (ageClass !== 'all') {
      const ageGenderKey = `${gender === 'M' ? 'boys' : 'girls'}_${ageClass}`;
      prefix = t(`rating.header_prefix.${ageGenderKey}`);
    } else {
      prefix = t(`rating.header_prefix.${genderPrefix}`);
    }
  }

  return prefix + " " + t('rating.header');
};

export const getYear = (date: string) => {
  return Number(date.slice(0, 4))
}
