import { 
  startOfMonth, 
  endOfMonth, 
  formatISO, 
  format, 
  subMonths, 
  addMonths,
  isValid,
  parseISO,
  Locale
} from 'date-fns';
import { ptBR, enUS, frFR, deDE } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'fr-FR': frFR,
  'de-DE': deDE,
};

export const getMonthRange = (date: Date) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const formatDateForAPI = (date: Date): string => {
  return formatISO(date);
};

export const getPreviousMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

export const getNextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

export const formatTime = (dateString: string, locale: string = 'en-US'): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '--:--';
    
    const dateLocale = localeMap[locale] || enUS;
    return format(date, 'HH:mm', { locale: dateLocale });
  } catch {
    return '--:--';
  }
};

export const formatDate = (dateString: string, locale: string = 'en-US'): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    
    const dateLocale = localeMap[locale] || enUS;
    
    if (locale === 'pt-BR') {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: dateLocale });
    } else if (locale === 'fr-FR') {
      return format(date, "dd MMMM yyyy", { locale: dateLocale });
    } else if (locale === 'de-DE') {
      return format(date, "dd. MMMM yyyy", { locale: dateLocale });
    } else {
      return format(date, "MMMM dd, yyyy", { locale: dateLocale });
    }
  } catch {
    return dateString;
  }
};

