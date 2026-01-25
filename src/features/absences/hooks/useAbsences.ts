import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAbsence, CreateAbsenceRequest, CreateAbsenceResponse } from '@/api/create-absence';
import { getAbsences, GetAbsencesParams, GetAbsencesResponse } from '@/api/get-absences';

export const ABSENCES_QUERY_KEY = 'absences';

export function useAbsences(params: GetAbsencesParams) {
  return useQuery<GetAbsencesResponse>({
    queryKey: [ABSENCES_QUERY_KEY, params.startDate, params.endDate],
    queryFn: () => getAbsences(params),
    refetchOnWindowFocus: true,
  });
}

export function useCreateAbsence() {
  const queryClient = useQueryClient();

  return useMutation<CreateAbsenceResponse, Error, CreateAbsenceRequest>({
    mutationFn: createAbsence,
    onSuccess: () => {
      // Invalidate both absences and clock history queries
      queryClient.invalidateQueries({ queryKey: [ABSENCES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
    },
  });
}
