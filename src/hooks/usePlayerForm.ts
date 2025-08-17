import { useState } from "react";
import {
  PlayerFormData,
  ValidationErrors,
  validatePlayerForm,
  isPlayerFormValid,
  getRequiredFields,
  extractBirthDateFromIsikukood,
  extractGenderFromIsikukood,
} from "@/lib/player-validation";

export interface UsePlayerFormOptions {
  onSubmit?: (playerData: PlayerFormData, noEstonianId: boolean) => void;
  onValidationError?: (errors: string[]) => void;
  t?: (key: string) => string;
}

export interface UsePlayerFormReturn {
  playerData: PlayerFormData;
  setPlayerData: (data: PlayerFormData) => void;
  updatePlayerField: (field: keyof PlayerFormData, value: string) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: (errors: ValidationErrors) => void;
  noEstonianId: boolean;
  setNoEstonianId: (value: boolean) => void;
  handleSubmit: () => Promise<void>;
  handleIsikukoodChange: (isikukood: string) => void;
  handleBirthDateChange: (birthDate: string) => void;
  handleNoEstonianIdToggle: (checked: boolean) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

const initialPlayerData: PlayerFormData = {
  first_name: "",
  last_name: "",
  birth_date: "",
  isikukood: "",
  club_name: "",
  sex: "",
};

const initialValidationErrors: ValidationErrors = {
  isikukood: "",
  birth_date: "",
};

export const usePlayerForm = (options: UsePlayerFormOptions = {}): UsePlayerFormReturn => {
  const {
    onSubmit,
    onValidationError,
    t,
  } = options;

  const [playerData, setPlayerData] = useState<PlayerFormData>(initialPlayerData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(initialValidationErrors);
  const [noEstonianId, setNoEstonianId] = useState(false);

  const updatePlayerField = (field: keyof PlayerFormData, value: string) => {
    setPlayerData(prev => ({ ...prev, [field]: value }));
  };

  const validateFormFields = (skipIdValidation = false): boolean => {
    if (skipIdValidation) {
      setValidationErrors(initialValidationErrors);
      return true;
    }

    const errors = validatePlayerForm(playerData, noEstonianId, t);
    setValidationErrors(errors);
    
    return !errors.isikukood && !errors.birth_date;
  };

  const validateForm = (): boolean => {
    if (!isPlayerFormValid(playerData, noEstonianId)) {
      const missingFields = getRequiredFields(playerData, noEstonianId, t);
      onValidationError?.(missingFields);
      return false;
    }

    return validateFormFields(noEstonianId);
  };

  const handleIsikukoodChange = (isikukood: string) => {
    let updatedPlayer: PlayerFormData = {
      ...playerData,
      isikukood,
    };

    if (isikukood && !noEstonianId) {
      const extractedDate = extractBirthDateFromIsikukood(isikukood);
      const extractedGender = extractGenderFromIsikukood(isikukood);
      
      if (extractedDate && extractedGender) {
        updatedPlayer = {
          ...updatedPlayer,
          birth_date: extractedDate.dateString,
          sex: extractedGender,
        };
      }
    }

    setPlayerData(updatedPlayer);
    validateFormFields(noEstonianId);
  };

  const handleBirthDateChange = (birthDate: string) => {
    const updatedPlayer = { ...playerData, birth_date: birthDate };
    setPlayerData(updatedPlayer);
    validateFormFields(noEstonianId);
  };

  const handleNoEstonianIdToggle = (checked: boolean) => {
    setNoEstonianId(checked);
    if (checked) {
      setPlayerData({
        ...playerData,
        isikukood: "",
        birth_date: "",
      });
      setValidationErrors(initialValidationErrors);
    } else {
      setPlayerData({ ...playerData, birth_date: "" });
    }
    validateFormFields(checked);
  };

  const handleSubmit = async (): Promise<void> => {
    // Ensure Estonian ID data is extracted before validation
    if (!noEstonianId && playerData.isikukood && (!playerData.birth_date || !playerData.sex)) {
      const extractedDate = extractBirthDateFromIsikukood(playerData.isikukood);
      const extractedGender = extractGenderFromIsikukood(playerData.isikukood);
      
      if (extractedDate && extractedGender) {
        const updatedPlayer = {
          ...playerData,
          birth_date: extractedDate.dateString,
          sex: extractedGender,
        };
        setPlayerData(updatedPlayer);
        
        // Validate with the updated data
        if (!isPlayerFormValid(updatedPlayer, noEstonianId)) {
          const missingFields = getRequiredFields(updatedPlayer, noEstonianId, t);
          onValidationError?.(missingFields);
          return;
        }
      } else {
        // Invalid Estonian ID
        if (!validateForm()) {
          return;
        }
      }
    } else {
      // Normal validation
      if (!validateForm()) {
        return;
      }
    }

    onSubmit?.(playerData, noEstonianId);
  };

  const resetForm = () => {
    setPlayerData(initialPlayerData);
    setValidationErrors(initialValidationErrors);
    setNoEstonianId(false);
  };

  return {
    playerData,
    setPlayerData,
    updatePlayerField,
    validationErrors,
    setValidationErrors,
    noEstonianId,
    setNoEstonianId,
    handleSubmit,
    handleIsikukoodChange,
    handleBirthDateChange,
    handleNoEstonianIdToggle,
    validateForm,
    resetForm,
  };
};
