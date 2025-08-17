export interface EstonianIdValidationResult {
  isValid: boolean;
  message: string;
}

export interface ExtractedBirthDate {
  year: number;
  month: number;
  day: number;
  dateString: string;
}

export const extractGenderFromIsikukood = (isikukood: string): string | null => {
  if (!isikukood || isikukood.length < 7) return null;
  const firstDigit = parseInt(isikukood[0]);
  if (firstDigit % 2 === 0) {
    return "N";
  } else {
    return "M";
  }
};

export const extractBirthDateFromIsikukood = (isikukood: string): ExtractedBirthDate | null => {
  if (!isikukood || isikukood.length < 7) return null;

  const firstDigit = parseInt(isikukood[0]);
  const year = isikukood.substring(1, 3);
  const month = isikukood.substring(3, 5);
  const day = isikukood.substring(5, 7);

  let century;
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
    dateString: `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
  };
};

export const validateIsikukoodWithBirthDate = (
  isikukood: string,
  birthDate: string,
  t?: (key: string) => string
): EstonianIdValidationResult => {
  if (!isikukood || !birthDate) return { isValid: true, message: "" };

  const extractedDate = extractBirthDateFromIsikukood(isikukood);
  if (!extractedDate) {
    return {
      isValid: false,
      message: t?.("validation.invalid_isikukood") || "Invalid Estonian ID code",
    };
  }

  if (extractedDate.dateString !== birthDate) {
    return {
      isValid: false,
      message: t?.("validation.birth_date_mismatch") || "Birth date does not match Estonian ID code",
    };
  }

  return { isValid: true, message: "" };
};



export interface PlayerFormData {
  first_name: string;
  last_name: string;
  birth_date: string;
  isikukood: string;
  club_name?: string;
  sex: string;
}

export interface ValidationErrors {
  isikukood: string;
  birth_date: string;
  first_name?: string;
  last_name?: string;
  sex?: string;
}

export const validatePlayerForm = (
  playerData: PlayerFormData,
  noEstonianId: boolean,
  t?: (key: string) => string
): ValidationErrors => {
  const errors: ValidationErrors = {
    isikukood: "",
    birth_date: "",
  };

  if (!noEstonianId && playerData.isikukood && playerData.birth_date) {
    const validation = validateIsikukoodWithBirthDate(
      playerData.isikukood,
      playerData.birth_date,
      t
    );
    if (!validation.isValid) {
      errors.isikukood = validation.message;
      errors.birth_date = validation.message;
    }
  }

  return errors;
};

export const getRequiredFields = (
  playerData: PlayerFormData,
  noEstonianId: boolean,
  t?: (key: string) => string
): string[] => {
  const missingFields: string[] = [];
  
  if (!playerData.first_name) {
    missingFields.push(t?.("form.first_name") || "First name");
  }
  if (!playerData.last_name) {
    missingFields.push(t?.("form.last_name") || "Last name");
  }
  if (!playerData.birth_date) {
    missingFields.push(t?.("form.birth_date") || "Birth date");
  }
  if (!playerData.sex) {
    missingFields.push(t?.("form.gender") || "Gender");
  }
  if (!noEstonianId && !playerData.isikukood) {
    missingFields.push(t?.("form.estonian_id") || "Estonian ID code");
  }

  return missingFields;
};

export const isPlayerFormValid = (
  playerData: PlayerFormData,
  noEstonianId: boolean
): boolean => {
  const requiredFieldsPresent =
    playerData.first_name &&
    playerData.last_name &&
    playerData.birth_date &&
    playerData.sex &&
    (noEstonianId || playerData.isikukood);

  return !!requiredFieldsPresent;
};
