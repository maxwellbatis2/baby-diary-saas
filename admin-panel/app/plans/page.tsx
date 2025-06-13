'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, Star, Brain, Download, Users, Smartphone, Headphones } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  price: number
  yearlyPrice: number | null
  features: string[]
  userLimit: number
  memoryLimit: number | null
  photoQuality: string
  familySharing: number
  exportFeatures: boolean
  prioritySupport: boolean
  aiFeatures: boolean
  offlineMode: boolean
  isActive: boolean
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [annualBilling, setAnnualBilling] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/public/plans')
      if (response.data.success) {
        setPlans(response.data.data.filter((p: Plan) => p.isActive))
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const PricingCard = ({ plan }: { plan: Plan }) => {
    const isFree = plan.price === 0
    const isPopular = plan.name.toLowerCase() === 'premium'
    const currentPrice = annualBilling && plan.yearlyPrice !== null ? plan.yearlyPrice : plan.price
    const priceDisplay = isFree ? 'Grátis' : `R$ ${currentPrice.toFixed(2).replace('.', ',')}`
    const periodDisplay = annualBilling && plan.yearlyPrice !== null && !isFree ? '/ano' : '/mês'

    const buttonText = isFree ? 'Começar grátis' : 'Assinar'
    const buttonAction = () => {
      if (isFree) {
        window.location.href = '/register'
      } else {
        alert(`Funcionalidade de assinatura para o plano ${plan.name} em breve!`)
      }
    }

    const buttonVariant = isFree ? 'outline' : 'default'

    return (
      <Card
        className={cn(
          "relative flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-300 ease-in-out",
          isPopular ? "border-primary shadow-xl border-2 scale-105" : "border hover:shadow-xl"
        )}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 z-10">
            <Badge className="m-2 bg-gradient-to-r from-pink-500 to-violet-500 animate-pulse">
              Mais popular
            </Badge>
          </div>
        )}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center">
            {plan.name}
          </CardTitle>
          <div className="flex flex-col items-center justify-center mt-4">
            <span className="text-5xl font-extrabold text-primary">
              {priceDisplay}
            </span>
            {!isFree && <span className="text-xl text-muted-foreground">{periodDisplay}</span>}
            {annualBilling && plan.yearlyPrice !== null && plan.price > 0 && (
              <span className="text-sm text-muted-foreground mt-1">
                R$ {plan.price.toFixed(2).replace('.', ',')} /mês (economia de {(100 - (plan.yearlyPrice / (plan.price * 12)) * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <ul className="space-y-3 text-lg mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckIcon className="h-6 w-6 text-green-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}

            {plan.userLimit !== null && plan.userLimit > 0 && (
              <li className="flex items-start gap-2">
                <Users className="h-6 w-6 text-blue-500 shrink-0" />
                <span>Limite de Bebês: {plan.userLimit === 999 ? 'Ilimitado' : plan.userLimit}</span>
              </li>
            )}
            {plan.memoryLimit !== null && (
              <li className="flex items-start gap-2">
                <Star className="h-6 w-6 text-yellow-500 shrink-0" />
                <span>Memórias: {plan.memoryLimit === 99999 ? 'Ilimitadas' : `${plan.memoryLimit} por mês`}</span>
              </li>
            )}
            {plan.aiFeatures && (
              <li className="flex items-start gap-2">
                <Brain className="h-6 w-6 text-purple-500 shrink-0" />
                <span>Assistente IA</span>
              </li>
            )}
            {plan.exportFeatures && (
              <li className="flex items-start gap-2">
                <Download className="h-6 w-6 text-orange-500 shrink-0" />
                <span>Exportação de Dados</span>
              </li>
            )}
            {plan.offlineMode && (
              <li className="flex items-start gap-2">
                <Smartphone className="h-6 w-6 text-gray-500 shrink-0" />
                <span>Modo Offline</span>
              </li>
            )}
            {plan.prioritySupport && (
              <li className="flex items-start gap-2">
                <Headphones className="h-6 w-6 text-red-500 shrink-0" />
                <span>Suporte Prioritário</span>
              </li>
            )}
          </ul>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button
            onClick={buttonAction}
            className={cn(
              "w-full transition-all duration-300 ease-in-out py-3 text-lg",
              buttonVariant === 'default' && isPopular ? 'bg-gradient-to-r from-pink-500 to-violet-500 hover:opacity-90 text-white' : '',
              buttonVariant === 'outline' ? 'border-2 border-primary text-primary hover:bg-primary/10' : ''
            )}
            variant={buttonVariant}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg animate-pulse">Carregando planos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Escolha o Plano Perfeito para o Seu Bebê
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Desde o acompanhamento básico até recursos avançados com IA e compartilhamento familiar ilimitado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full px-4">
        {plans.map((plan, index) => (
          <div key={plan.id}>
            <PricingCard plan={plan} />
          </div>
        ))}
      </div>

      <div className="text-center mt-16">
        <p className="text-gray-600 mb-4">
          Todos os planos incluem 7 dias de teste gratuito
        </p>
        <p className="text-sm text-gray-500">
          Cancele a qualquer momento. Sem taxas ocultas.
        </p>
      </div>
    </div>
  )
} 