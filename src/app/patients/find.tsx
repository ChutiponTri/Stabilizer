"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";
import { DatePicker } from "@/components/date-picker"
import { getCustomers } from "@/actions/user.action"
import { Skeleton } from "@/components/ui/skeleton"
import Create from "./create"

export const formSchema = z.object({
  id: z.string().min(1),
  age: z.coerce.number().min(1).max(200),
  gender: z.string(),
  birth: z.coerce.date().refine((date) => {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    return date <= oneYearAgo
  }, {
    message: "You must be at least 1 year old.",
  }),
  history: z.string(),
  weight: z.coerce.number().min(1).max(300),
  height: z.coerce.number().min(1).min(100).max(300),
  bmi: z.coerce.number(),
  waist: z.coerce.number().min(10).max(200)
});

const querySchema = z.object({
  id: z.string().min(1)
});

function Find() {
  const [data, setData] = React.useState<any>(null);
  const [flag, setFlag] = React.useState<boolean>(false);
  const [refresh, setRefresh] = React.useState<boolean>(false);
  const [fetching, setFetching] = React.useState<boolean>(true);
  const [patientList, setPatientList] = React.useState<string[]>([]);
  const [revalidate, setRevalidate] = React.useState<boolean>(false);

  const genders = [{ label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" }] as const;

  const query = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "birth": new Date()
    },
  });

  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setFetching(true);
        const customers = await getCustomers(revalidate);
        setPatientList(customers); // Set the fetched customers in the state
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setFetching(false);
        setRevalidate(false);
      }
    };
    fetchCustomers(); // Actually call the fetch function
  }, [refresh, revalidate]);

  const weight = useWatch({ control: form.control, name: "weight" });
  const height = useWatch({ control: form.control, name: "height" });
  const birth = useWatch({ control: form.control, name: "birth" });

  React.useEffect(() => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmi = +(weight / (heightInMeters * heightInMeters)).toFixed(2);
      form.setValue("bmi", bmi);
    }
  }, [weight, height, form]);

  React.useEffect(() => {
    if (birth) {
      const age = new Date().getFullYear() - new Date(birth).getFullYear();
      form.setValue("age", age);
    }
  }, [birth, form]);


  async function fetchCustomer(id: string) {
    try {
      const resp = await fetch(`api/patient?id=${id}`, {
        method: 'GET',
      });
      const fetchedData = await resp.json();
      console.log('Fetched Data:', fetchedData);

      if (fetchedData) {
        const format = {
          id: id,
          age: fetchedData.age,
          gender: fetchedData.gender,
          birth: new Date(fetchedData.birth),
          history: fetchedData.history,
          weight: fetchedData.weight,
          height: fetchedData.height,
          bmi: fetchedData.bmi,
          waist: fetchedData.waist || 30
        }
        try {
          toast.success(`Found Patient ${id}`);
          formSchema.parse(format);
          setData(format);        // Set the fetched data to the state
          setFlag(true);          // Set flag to true to indicate successful fetch
        } catch (error) {
          console.error("Validation error:", error);
          toast.error(`Validation error: ${error}`);
          setFlag(false);
        }
      } else {
        toast.error("Patient ID not Found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching customer data.");
    }
  }

  function onQuery(patientId: string) {
    try {
      console.log("Query", patientId);
      fetchCustomer(patientId);

    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("submitted", values);

      const fetchData = async () => {
        try {
          const resp = await fetch("api/patient", {
            method: "PUT",
            body: JSON.stringify(values)
          });
          const data = await resp.json();
          console.log(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setFlag(false);
        }
      };
      fetchData();
      setRevalidate(true);
      toast.success("Patient Data Update Successfully");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  React.useEffect(() => {
    if (flag && data) {
      form.reset({
        id: data.id,
        age: data.age,
        gender: data.gender,
        birth: data.birth ? new Date(data.birth) : new Date(),
        history: data.history,
        weight: data.weight,
        height: data.height,
        bmi: data.bmi,
        waist: data.waist
      });
    }
  }, [flag, data, form]);

  if (!fetching && patientList.length == 0) return <Create />

  return (
    fetching ? (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ) :

      !flag ? (
        patientList.length > 0 && (
          <div>
            <div className="text-center font-semibold text-xl mt-0 mb-4">Select Patient to Edit Data</div>
            <div className="flex flex-wrap justify-center">
              {patientList.map((value, index) => (
                <div className="mt-0 py-2 mx-2">
                  <Button onClick={() => onQuery(value)}>
                    {value}
                  </Button>
                </div>
              ))}
            </div>
            <div className="py-2 flex justify-center">
              <Button type="button" variant={"secondary"} onClick={() => setRefresh(!refresh)}>Refresh</Button>
            </div>
          </div>
        )
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">

            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Input ID"
                      type=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Input Age"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>Gender</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? genders.find(
                                  (gender) => gender.value === field.value
                                )?.label
                                : "Select gender"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search gender..." />
                            <CommandList>
                              <CommandEmpty>No gender found.</CommandEmpty>
                              <CommandGroup>
                                {genders.map((gender) => (
                                  <CommandItem
                                    value={gender.label}
                                    key={gender.value}
                                    onSelect={() => {
                                      form.setValue("gender", gender.value);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        gender.value === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {gender.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="birth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>Date of birth</FormLabel>
                      {/* Custom DatePicker takes full control */}
                      <DatePicker
                        value={field.value}         // Pass the current value from the form
                        onChange={field.onChange}   // Pass the onChange handler to update the form state
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training History</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Patient's Training History"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Input Weight (kg)"
                          type="number"
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Input Height (cm)"
                          type="number"
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="bmi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BMI</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Input BMI (kg/m^2)"
                          type="number"
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-3">
                <FormField 
                  control={form.control}
                  name="waist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Input Waist (cm)"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-x-2">
              <Button type="submit">Submit</Button>
              <Button type="button" variant={"destructive"} onClick={() => setFlag(false)}>Cancel</Button>
            </div>
          </form>
        </Form>)
  )
}

export default Find