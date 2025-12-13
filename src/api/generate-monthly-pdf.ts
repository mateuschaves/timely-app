import { apiClient } from '@/config/api';

export interface PdfReportResponseDto {
  pdfBase64: string;
  fileName: string;
  period: string;
}

export const generateMonthlyPdf = async (
  startDate: string,
  endDate: string
): Promise<PdfReportResponseDto> => {
  const response = await apiClient.get<PdfReportResponseDto>(
    '/clockin/report/monthly-pdf',
    {
      params: {
        startDate,
        endDate,
      },
    }
  );
  return response.data;
};
