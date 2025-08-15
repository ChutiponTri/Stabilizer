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
import { redirect } from "next/navigation"

const formSchema = z.object({
  id: z.string().min(1),
  age: z.coerce.number().min(1).max(200),
  gender: z.string(),
  birth: z.coerce.date(),
  history: z.string(),
  weight: z.coerce.number().min(1).max(300),
  height: z.coerce.number().min(1).min(100).max(300),
  bmi: z.coerce.number(),
  waist: z.coerce.number().min(10).max(200)
});

function Create({ onPatientCreated }: { onPatientCreated?: () => void }) {

  const [submit, setSubmit] = React.useState(false);

  const genders = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" }
  ] as const;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "birth": new Date()
    },
  })

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

  React.useEffect(() => {
    if (submit) {
      setSubmit(false);
      return redirect("/patients");
    }
  }, [submit]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("submitted", values);

      const resp = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const data = await resp.json();

      if ("exist" in data) {
        toast.error("Patient already Exist");
      } else {
        toast.success("Patient Registered Successfully");
        onPatientCreated?.();
        setSubmit(true);
      }

      console.log(data);
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
                      {...field}
                    />
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
                      {...field}
                    />
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
                      {...field}
                    />
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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default Create