"use client"

import  { useState , useEffect} from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"
import { Compound } from '../types'

interface ResultsTableProps {
  data: Compound[];
  loading?: boolean;
  onViewDetail: (compound: Compound) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function ResultsTable({ 
  data, 
  loading = false, 
  onViewDetail, 
  currentPage, 
  totalPages, 
  totalItems,
  onPageChange 
}: ResultsTableProps) {
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate items per page based on available height
  useEffect(() => {
    const calculateItemsPerPage = () => {
      // Estimate available height for table (subtracting header, pagination, margins)
      const availableHeight = window.innerHeight - 200; // Adjust this value based on your layout
      const rowHeight = 80; // Estimated height per row including padding
      const calculatedItems = Math.floor(availableHeight / rowHeight);
      
      // Set minimum and maximum bounds
      const minItems = 5;
      const maxItems = 50;
      
      setItemsPerPage(Math.max(minItems, Math.min(calculatedItems, maxItems)));
    };

    // Calculate initially
    calculateItemsPerPage();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateItemsPerPage);
    
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium text-gray-900">CytoBase 1.0</h2>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading compounds...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium text-gray-900">CytoBase 1.0</h2>
          <div className="text-sm text-gray-600">
            Showing {startIndex}-{endIndex} of {totalItems} results
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16 text-center font-medium text-gray-700">No.</TableHead>
                <TableHead className="w-24 font-medium text-gray-700">Box ID</TableHead>
                <TableHead className="font-medium text-gray-700">Compound</TableHead>
                <TableHead className="font-medium text-gray-700">Origin</TableHead>
                <TableHead className="w-32 font-medium text-gray-700">Quantity</TableHead>
                <TableHead className="w-32 font-medium text-gray-700">Total Molweight</TableHead>
                 <TableHead className="w-32 text-center font-medium text-gray-700">Structure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No compounds found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                    <TableRow key={item.mol_idx} className="hover:bg-gray-50">
                      <TableCell className="text-center font-medium text-gray-900">
                      {startIndex + index}
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                    {item.fields["Box ID"]}
                    </TableCell>
                    <TableCell 
                      className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                      onClick={() => onViewDetail(item)}
                    >
                     {item.fields["Compound"]}
                    </TableCell>
                    <TableCell className="text-gray-700 max-w-xs truncate">
                      {item.fields["Origin"]}
                    </TableCell>
                    <TableCell className="text-gray-700">
                     {item.fields["Quantity"]}
                    </TableCell>
                    <TableCell className="text-gray-700">
                     {item.fields["Total Molweight"]}
                    </TableCell>
                     <TableCell className="p-3">
                    <div className="w-32 h-32 flex items-center justify-center overflow-hidden cursor-pointer">
                      <img 
                         src={`data:image/png;base64,${item.base64_png}`}
                        alt="Molecular structure" 
                       
                         className="w-full h-full object-contain transition-transform duration-300 hover:scale-150"
                      />
                    </div>
                  </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={handlePreviousPage}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}
                  
                  />
                </PaginationItem>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => onPageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      size="icon" 
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={handleNextPage}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  )
}