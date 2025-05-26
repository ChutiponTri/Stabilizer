"use client"

import * as React from "react"
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { getDataChoice, getDataRaw } from "@/actions/data.action"
import { getCustomers } from "@/actions/user.action"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import Excel from "./Excel"
import toast from "react-hot-toast"
import ChartRecall from "./ChartRecall"
import ButtonLoading from "./ButtonLoading"

const data: Pressure[] = [];

const modes = ["Table", "Chart"];

export type Query = {
  id: String,
  dataName: String
}

export type Pressure = {
  pressure: number;
  timestamp: string;
};

export const columns: ColumnDef<Pressure>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "index",
    header: "Index",
    cell: ({ row }) => (
      <div className="capitalize">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-center"
          >
            Timestamp
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div className="uppercase text-center">{row.getValue("timestamp")}</div>,
  },
  {
    accessorKey: "pressure",
    header: () => <div className="text-center">Pressure (mmHg)</div>,
    cell: ({ row }) => {
      const pressure = parseFloat(row.getValue("pressure"))

      // Format the pressure as a dollar pressure
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(pressure);

      return <div className="text-center font-medium">{formatted}</div>
    },
  },
]

function Query() {
  const [patientList, setPatient] = React.useState<string[]>([]);
  const [activePatient, setActivePatient] = React.useState<string | undefined>(undefined);
  const [dataList, setDataList] = React.useState<string[]>([]);
  const [activeDataList, setActiveDataList] = React.useState<string | undefined>(undefined);
  const [rawData, setRawData] = React.useState<{ pressure: number; timestamp: string }[]>(data);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [activeMode, setActiveMode] = React.useState("Table");
  const [dataLoading, setDataLoading] = React.useState(false);

  const table = useReactTable({
    data: rawData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const activePatientRef = React.useRef(activePatient);
  React.useEffect(() => {
    activePatientRef.current = activePatient;  // Update ref when activePatient changes
  }, [activePatient]);

  const activeDataListRef = React.useRef(activeDataList);
  React.useEffect(() => {
    activeDataListRef.current = activeDataList;  // Update ref when activePatient changes
  }, [activeDataList]);

  React.useEffect(() => {
    const getIndex = async () => {
      const dataChoice = await getDataChoice(activePatientRef.current);
      console.log(dataChoice);
      if (Array.isArray(dataChoice) && dataChoice.length > 0) {
        setDataList(dataChoice);
      } else {
        setDataList([]);
        setRawData([]);
      }
    }
    getIndex();
  }, [activePatient, activeDataList]);

  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patients = await getCustomers();
        if (Array.isArray(patients) && patients.length > 0) {
          setPatient(patients);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchPatients();
  }, [activePatient, activeDataList]);

  React.useEffect(() => {
    const fetchPatientData = async () => {
      try {
        if (activePatientRef.current) {
          setDataLoading(true);
          const query: Query = {
            id: String(activePatientRef.current),
            dataName: String(activeDataListRef.current)
          }
          const result = await getDataRaw(query);
          const data = result && typeof result === "object" ? Object.values(result) : [];
          setRawData(data as { pressure: number; timestamp: string }[]);
        }
      } catch (error) {
        console.log("Error in Fetching Data", error);
      } finally {
        setDataLoading(false);
      }
    }
    fetchPatientData();
  }, [activeDataList]);

  console.log(rawData);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Timestamps..."
          value={(table.getColumn("timestamp")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("timestamp")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2 ml-auto relative">
          <Select value={activePatient} onValueChange={setActivePatient}>
            <SelectTrigger className="h-7 min-w-[90px] max-w-[140px] w-full sm:w-auto rounded-lg pl-2.5" aria-label="Select a patient">
              <SelectValue placeholder="Select Patient" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl w-full max-w-[140px] sm:right-auto">
              {patientList.sort().map((patient) => (
                <SelectItem key={patient} value={patient} className="rounded-lg">
                  {patient}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={activeDataList} onValueChange={setActiveDataList}>
            <SelectTrigger className="h-7 min-w-[90px] max-w-[140px] w-full sm:w-auto rounded-lg pl-2.5" aria-label="Select a patient">
              <SelectValue placeholder="Select Data" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl w-full max-w-[140px] sm:right-auto">
              {dataList.sort().map((data) => (
                <SelectItem key={data} value={data} className="rounded-lg">
                  {data}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Mode <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Mode</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={activeMode} onValueChange={setActiveMode}>
              {modes.map((modeOption) => (
                <DropdownMenuRadioItem key={modeOption} value={modeOption}>
                  {modeOption}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {activeMode === "Table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {dataLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <ButtonLoading text={"Loading Data ..."} />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Please Select Data.
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (dataLoading ?
        (<div className="text-center">
          <ButtonLoading text={"Loading Data ..."} /> 
        </div>):
        (<ChartRecall data={rawData} />))
      }
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button onClick={() => {
            if (!activeDataList || !activePatient) return;
            const result = Excel(activePatient, activeDataList, rawData);
            if (!result) {
              toast.error("Please Identify Data");
            }
          }}>Download Excel</Button>
        </div>
      </div>
    </div>
  )
}

export default Query;