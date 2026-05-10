import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="space-y-6 py-12">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-semibold tracking-tight">Domination</h1>
            <p className="text-muted-foreground">
              Gerencie seus waifus, husbandos, raridades e eventos em um só lugar.
            </p>
          </div>
          <Link href="/dashboard">
            <Button size="lg" className="min-w-40">
              Ir para o Painel
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
