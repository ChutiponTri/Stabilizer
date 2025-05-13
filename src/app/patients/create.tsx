"use client"

import { useState, useEffect } from "react"
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
import { DateTimePicker } from '@/components/datetime-picker'
import { useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  id: z.string().min(1),
  age: z.coerce.number().min(1).max(200),
  gender: z.string(),
  birth: z.coerce.date(),
  history: z.string(),
  weight: z.coerce.number().min(1).max(300),
  height: z.coerce.number().min(1).min(100).max(300),
  bmi: z.coerce.number()
});

function Create({ onPatientCreated }: { onPatientCreated?: () => void }) {

  const genders = [{
    label: "Male",
    value: "male"
  },
  {
    label: "Female",
    value: "female"
  },
  {
    label: "Other",
    value: "other"
  }
  ] as
    const;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "birth": new Date()
    },
  })

  const weight = useWatch({ control: form.control, name: "weight" });
  const height = useWatch({ control: form.control, name: "height" });

  useEffect(() => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmi = +(weight / (heightInMeters * heightInMeters)).toFixed(2);
      form.setValue("bmi", bmi);
    }
  }, [weight, height, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("submitted", values);

      const fetchData = async () => {
        try {
          const resp = await fetch("api/patient", {
            method: "POST",
            body: JSON.stringify(values)
          });
          const data = await resp.json();
          if ("exist" in data) {
            toast.error("Patient already Exist");
          } else {
            toast.success("Patient Register Successfully");
            onPatientCreated?.();
          }
          console.log(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();

    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">

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
                  {...field} />
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
                      {...field} />
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
                  <DateTimePicker
                    hideTime
                    onChange={field.onChange}
                    value={field.value || new Date()}
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

          <div className="col-span-4">

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

          <div className="col-span-4">

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

          <div className="col-span-4">

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

        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default Create