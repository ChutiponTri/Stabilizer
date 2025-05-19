import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Create from './create'
import Find from './find'

export default function page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-7">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Edit Patient Data</TabsTrigger>
            <TabsTrigger value="create">Register New Patient</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="py-10">
            <Find />
          </TabsContent>
          <TabsContent value="create" className="py-10">
            <Create />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
