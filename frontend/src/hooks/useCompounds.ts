import { useState, useEffect, useCallback } from "react";
import { Compound, FilterParams, ApiResponse } from "../types";
import { fetchCompounds } from "../api";

const ITEMS_PER_PAGE = 5;

export const useCompounds = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
  const [allFilteredCompounds, setAllFilteredCompounds] = useState<Compound[]>([]);

  // Function to fetch data with filters
  const fetchDataWithFilters = useCallback(async (filterParams: FilterParams = {}) => {
    setLoading(true);
    try {
      console.log("Fetching data with filters:", filterParams);
      const result = await fetchCompounds({
        ...filterParams,
        page: filterParams.page || 1,
        per_page: filterParams.per_page || ITEMS_PER_PAGE,
      });
      console.log("API Response:", result);
      setData(result);
    } catch (error) {
      console.error("Error fetching compounds:", error);
      setData({
        items: [],
        page: 1,
        per_page: ITEMS_PER_PAGE,
        total_items: 0,
        total_pages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filter application
  const handleApplyFilters = useCallback(async (newFilters: FilterParams) => {
    setLoading(true);
    try {
      setFilters(newFilters);
      
      // First fetch with pagination for table
      const paginatedResult = await fetchCompounds({
        ...newFilters,
        page: 1,
        per_page: ITEMS_PER_PAGE,
      });
      setData(paginatedResult);

      // Then fetch ALL data without pagination for navigation
      const allResults = await fetchCompounds({
        ...newFilters,
      });
      console.log("All filtered compounds for navigation:", allResults.items.length);
      setAllFilteredCompounds(allResults.items);
    } catch (error) {
      console.error("Error fetching compounds:", error);
      setData({
        items: [],
        page: 1,
        per_page: ITEMS_PER_PAGE,
        total_items: 0,
        total_pages: 0,
      });
      setAllFilteredCompounds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigation handlers
  const handleNextCompound = useCallback(() => {
    console.log("Next button clicked");
    console.log("All filtered compounds:", allFilteredCompounds.length);
    console.log("Selected compound:", selectedCompound);

    if (!allFilteredCompounds.length || !selectedCompound) {
      console.log("Cannot navigate: missing data");
      return;
    }

    const currentIndex = allFilteredCompounds.findIndex(
      (item) => item.mol_idx === selectedCompound.mol_idx
    );
    console.log("Current index:", currentIndex);

    if (currentIndex < allFilteredCompounds.length - 1) {
      const nextCompound = allFilteredCompounds[currentIndex + 1];
      console.log("Setting next compound:", nextCompound.fields["Compound"]);
      setSelectedCompound(nextCompound);
    } else {
      console.log("Already at last compound");
    }
  }, [allFilteredCompounds, selectedCompound]);

  const handlePreviousCompound = useCallback(() => {
    console.log("Previous button clicked");

    if (!allFilteredCompounds.length || !selectedCompound) return;

    const currentIndex = allFilteredCompounds.findIndex(
      (item) => item.mol_idx === selectedCompound.mol_idx
    );

    if (currentIndex > 0) {
      setSelectedCompound(allFilteredCompounds[currentIndex - 1]);
    }
  }, [allFilteredCompounds, selectedCompound]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    const updatedFilters = { 
      ...filters, 
      page,
      per_page: ITEMS_PER_PAGE
    };
    fetchDataWithFilters(updatedFilters);
  }, [filters, fetchDataWithFilters]);

  // Handle view detail
  const handleViewDetail = useCallback((compound: Compound) => {
    setSelectedCompound(compound);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCompound(null);
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch paginated data for table
        const paginatedResult = await fetchCompounds({
          page: 1,
          per_page: ITEMS_PER_PAGE,
        });
        setData(paginatedResult);

        // Fetch all data for navigation
        const allResults = await fetchCompounds({});
        setAllFilteredCompounds(allResults.items);
      } catch (error) {
        console.error("Error fetching initial compounds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return {
    // State
    data,
    loading,
    selectedCompound,
    allFilteredCompounds,
    
    // Actions
    handleApplyFilters,
    handleViewDetail,
    handleBack,
    handleNextCompound,
    handlePreviousCompound,
    handlePageChange,
  };
};

export default useCompounds;