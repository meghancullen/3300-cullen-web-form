import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SurveyResponse {
  id?: number;
  created_at?: string;
  age: string;
  state: string;
  favorite_sports: string[];
  other_sport: string | null;
  teams: string;
  attending_event: string;
}

export function useSubmitSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SurveyResponse) => {
      const { data: result, error } = await supabase
        .from("survey_responses")
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey_responses"] });
    },
  });
}

export function useSurveyResults() {
  return useQuery({
    queryKey: ["survey_responses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message);
      }
      return data as SurveyResponse[];
    },
  });
}
