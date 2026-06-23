import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getKaizenActiveTicketCategories } from "../services/kaizenTasksApi";
import { kaizenTasksKeys } from "./useKaizenTasks";

export function useActiveTicketCategories() {
  const { data: categories = [], isLoading, isFetching } = useQuery({
    queryKey: kaizenTasksKeys.activeCategories(),
    queryFn: async () => {
      const res = await getKaizenActiveTicketCategories();
      return res?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const mappings = useMemo(
    () =>
      categories.map((category) => ({
        ticket_category: category,
        workflow_status: "ACTIVE",
      })),
    [categories]
  );

  return {
    categories,
    mappings,
    isLoading: isLoading || isFetching,
    hasActiveCategories: categories.length > 0,
  };
}
