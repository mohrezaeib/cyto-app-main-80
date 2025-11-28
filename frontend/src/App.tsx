import FilterSidebar from "./components/FilterSidebar";
import ResultsTable from "./components/ResultsTable";
import DetailPage from "./components/DetailPage";
import { useCompounds } from "./hooks/useCompounds";

export default function App() {
  const {
    data,
    loading,
    selectedCompound,
    allFilteredCompounds,
    handleApplyFilters,
    handleViewDetail,
    handleBack,
    handleNextCompound,
    handlePreviousCompound,
    handlePageChange,
  } = useCompounds();

  // Determine current page based on selected compound
  const currentPage = selectedCompound ? "detail" : "home";

  if (currentPage === "detail" && selectedCompound) {
    const currentIndex = allFilteredCompounds.findIndex(
      (item) => item.mol_idx === selectedCompound.mol_idx
    );

    return (
      <DetailPage
        compound={selectedCompound}
        onBack={handleBack}
        onNext={handleNextCompound}
        onPrevious={handlePreviousCompound}
        currentIndex={currentIndex}
        totalCount={allFilteredCompounds.length}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="flex gap-8 p-8">
        <FilterSidebar onApplyFilters={handleApplyFilters} />
        <div className="flex-1 bg-white rounded-xl shadow-lg p-8">
          <ResultsTable
            data={data?.items || []}
            loading={loading}
            onViewDetail={handleViewDetail}
            currentPage={data?.page || 1}
            totalPages={data?.total_pages || 0}
            totalItems={data?.total_items || 0}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}