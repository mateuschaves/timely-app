/**
 * Capitaliza a primeira letra de uma string
 * @param str - A string a ser capitalizada
 * @returns A string com a primeira letra maiúscula
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

