import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

function PlaceholderStudio({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="border-border/50 bg-card/50 max-w-md w-full text-center">
        <CardContent className="pt-12 pb-12">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">
            This studio is being prepared. It will be available soon with full functionality.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export { PlaceholderStudio }
