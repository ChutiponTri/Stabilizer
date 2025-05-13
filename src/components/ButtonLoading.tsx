import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ButtonLoading( { text } : { text: String } ) {
  return (
    <Button disabled>
      <Loader2 className="animate-spin" />
      {text}
    </Button>
  )
}
