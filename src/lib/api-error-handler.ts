export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    context: Record<string, unknown>;
  };
}

export interface ApiSuccessResponse {
  message?: string;
  data?: Record<string, unknown>;
}

export type ApiResponse = ApiErrorResponse | ApiSuccessResponse;

export function isStructuredErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    response !== null &&
    typeof response === 'object' &&
    'error' in response &&
    typeof (response as Record<string, unknown>).error === 'object' &&
    (response as Record<string, unknown>).error !== null &&
    'code' in ((response as Record<string, unknown>).error as Record<string, unknown>) &&
    'context' in ((response as Record<string, unknown>).error as Record<string, unknown>)
  );
}

export function translateApiError(
  errorCode: string,
  context: Record<string, unknown>,
  t: (key: string, options?: Record<string, unknown>) => string
): string | null {
  const translationKey = `admin.clubs.api_errors.${errorCode}`;
  
  if (errorCode === 'duplicate_player_exists') {
    const modifiedContext = { ...context };
    if (!modifiedContext.existing_club_name || modifiedContext.existing_club_name === '') {
      modifiedContext.existing_club_name = t('admin.clubs.no_club_affiliation');
    }
    const translated = t(translationKey, modifiedContext);
    return translated !== translationKey ? translated : null;
  }
  
  const translated = t(translationKey, context);
  
  if (translated === translationKey) {
    console.warn(`Translation missing for error code: ${errorCode}`);
    return null;
  }
  
  return translated;
}

export function handleApiError(
  error: unknown,
  t: (key: string, options?: Record<string, unknown>) => string,
  fallbackMessage?: string
): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const responseData = (error as { response?: { data?: unknown } }).response?.data;
    
    if (isStructuredErrorResponse(responseData)) {
      const translatedMessage = translateApiError(
        responseData.error.code,
        responseData.error.context,
        t
      );
      
      if (translatedMessage) {
        return translatedMessage;
      }
      
      return responseData.error.message;
    }
    
    if (responseData && typeof responseData === 'object' && 'error' in responseData) {
      return String((responseData as { error: unknown }).error);
    }
    
    if (responseData && typeof responseData === 'object' && 'message' in responseData) {
      return String((responseData as { message: unknown }).message);
    }
  }
  
  if (isStructuredErrorResponse(error)) {
    const translatedMessage = translateApiError(
      error.error.code,
      error.error.context,
      t
    );
    
    if (translatedMessage) {
      return translatedMessage;
    }
    
    return error.error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage || t('admin.clubs.toast.error', { error: 'Unknown error occurred' });
}

export function handleApiSuccess(
  response: unknown,
  t: (key: string, options?: Record<string, unknown>) => string
): { message: string; data?: unknown } {
  if (response && typeof response === 'object' && 'message' in response) {
    return {
      message: String((response as { message: unknown }).message),
      data: 'data' in response ? (response as { data: unknown }).data : undefined
    };
  }
  
  if (response && typeof response === 'object' && 'data' in response) {
    return {
      message: t('admin.clubs.toast.success'),
      data: (response as { data: unknown }).data
    };
  }
  
  return {
    message: t('admin.clubs.toast.success'),
    data: response
  };
}
