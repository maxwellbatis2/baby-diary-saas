'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import {
  FileText,
  Eye,
  Save,
  Plus,
  Trash2,
  Edit,
  Image as ImageIcon,
  Star,
  TrendingUp,
  MessageSquare,
  Settings,
  Globe,
  Search,
  Users,
  Calendar,
  Award,
  Heart,
  Camera,
  Smartphone,
  Shield,
  Zap,
  Target,
  Palette,
  Type,
  Layout,
  Code,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Baby,
  Sparkles,
  Moon,
  Brain,
  BarChart3,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface Feature {
  title: string
  description: string
  icon?: string
}

interface Testimonial {
  name: string
  text: string
  rating: number
  avatar?: string
}

interface FAQ {
  question: string
  answer: string
}

interface Stat {
  label: string
  value: string
  description: string
}

interface LandingPageContent {
  id: number
  heroTitle: string
  heroSubtitle: string
  heroImage?: string
  features: Feature[]
  testimonials: Testimonial[]
  faq: FAQ[]
  stats: Stat[]
  ctaText?: string
  ctaButtonText?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  updatedAt: string
}

export default function LandingPagePage() {
  const [content, setContent] = useState<LandingPageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getLandingPageContent()
      if (response.success) {
        setContent(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error)
      toast.error('Erro ao carregar conteúdo da landing page')
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async () => {
    if (!content) return

    try {
      setIsSaving(true)
      const response = await adminApi.updateLandingPageContent(content)
      if (response.success) {
        toast.success('Landing page atualizada com sucesso!')
        setContent(response.data)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar alterações')
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof LandingPageContent, value: any) => {
    if (!content) return
    setContent({ ...content, [field]: value })
  }

  const addFeature = () => {
    if (!content) return
    const newFeature: Feature = {
      title: 'Nova Funcionalidade',
      description: 'Descrição da nova funcionalidade',
      icon: 'star'
    }
    setContent({
      ...content,
      features: [...content.features, newFeature]
    })
  }

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    if (!content) return
    const newFeatures = [...content.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setContent({ ...content, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    if (!content) return
    const newFeatures = content.features.filter((_, i) => i !== index)
    setContent({ ...content, features: newFeatures })
  }

  const addTestimonial = () => {
    if (!content) return
    const newTestimonial: Testimonial = {
      name: 'Novo Usuário',
      text: 'Depoimento do usuário',
      rating: 5,
      avatar: ''
    }
    setContent({
      ...content,
      testimonials: [...content.testimonials, newTestimonial]
    })
  }

  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    if (!content) return
    const newTestimonials = [...content.testimonials]
    newTestimonials[index] = { ...newTestimonials[index], [field]: value }
    setContent({ ...content, testimonials: newTestimonials })
  }

  const removeTestimonial = (index: number) => {
    if (!content) return
    const newTestimonials = content.testimonials.filter((_, i) => i !== index)
    setContent({ ...content, testimonials: newTestimonials })
  }

  const addFAQ = () => {
    if (!content) return
    const newFAQ: FAQ = {
      question: 'Nova Pergunta',
      answer: 'Resposta para a nova pergunta'
    }
    setContent({
      ...content,
      faq: [...content.faq, newFAQ]
    })
  }

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    if (!content) return
    const newFAQ = [...content.faq]
    newFAQ[index] = { ...newFAQ[index], [field]: value }
    setContent({ ...content, faq: newFAQ })
  }

  const removeFAQ = (index: number) => {
    if (!content) return
    const newFAQ = content.faq.filter((_, i) => i !== index)
    setContent({ ...content, faq: newFAQ })
  }

  const addStat = () => {
    if (!content) return
    const newStat: Stat = {
      label: 'Nova Estatística',
      value: '0',
      description: 'Descrição da estatística'
    }
    setContent({
      ...content,
      stats: [...content.stats, newStat]
    })
  }

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    if (!content) return
    const newStats = [...content.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setContent({ ...content, stats: newStats })
  }

  const removeStat = (index: number) => {
    if (!content) return
    const newStats = content.stats.filter((_, i) => i !== index)
    setContent({ ...content, stats: newStats })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando conteúdo da landing page...</div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Erro ao carregar conteúdo</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Landing Page</h1>
          <p className="text-muted-foreground">
            Edite o conteúdo da sua landing page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'Sair do Preview' : 'Preview'}
          </Button>
          <Button
            onClick={saveContent}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview da Landing Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Hero Section */}
              <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h1 className="text-4xl font-bold mb-4">{content.heroTitle}</h1>
                <p className="text-xl text-gray-600 mb-6">{content.heroSubtitle}</p>
                {content.heroImage && (
                  <img
                    src={content.heroImage}
                    alt="Hero"
                    className="mx-auto max-w-md rounded-lg shadow-lg mb-6"
                  />
                )}
                <div className="flex gap-4 justify-center">
                  <Button size="lg">{content.ctaButtonText || 'Começar Agora'}</Button>
                </div>
              </section>

              {/* Features */}
              {content.features.length > 0 && (
                <section className="py-8">
                  <h2 className="text-3xl font-bold text-center mb-8">Funcionalidades</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {content.features.map((feature, index) => (
                      <Card key={index}>
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Star className="w-6 h-6 text-blue-600" />
                          </div>
                          <h3 className="font-semibold mb-2">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Stats */}
              {content.stats.length > 0 && (
                <section className="py-8 bg-gray-50 rounded-lg">
                  <div className="grid md:grid-cols-3 gap-6">
                    {content.stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                        <div className="font-semibold">{stat.label}</div>
                        <div className="text-gray-600">{stat.description}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Testimonials */}
              {content.testimonials.length > 0 && (
                <section className="py-8">
                  <h2 className="text-3xl font-bold text-center mb-8">Depoimentos</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {content.testimonials.map((testimonial, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            {renderStars(testimonial.rating)}
                          </div>
                          <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                          <div className="font-semibold">{testimonial.name}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQ */}
              {content.faq.length > 0 && (
                <section className="py-8">
                  <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
                  <div className="space-y-4">
                    {content.faq.map((faq, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-2">{faq.question}</h3>
                          <p className="text-gray-600">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* CTA */}
              {content.ctaText && (
                <section className="py-12 bg-blue-600 text-white text-center rounded-lg">
                  <h2 className="text-3xl font-bold mb-4">{content.ctaText}</h2>
                  <Button size="lg" variant="secondary">
                    {content.ctaButtonText || 'Começar Agora'}
                  </Button>
                </section>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Mode */}
      {!previewMode && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Seção Hero
                </CardTitle>
                <CardDescription>
                  Título principal e subtítulo da landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="heroTitle">Título Principal</Label>
                  <Input
                    id="heroTitle"
                    value={content.heroTitle}
                    onChange={(e) => updateField('heroTitle', e.target.value)}
                    placeholder="Título principal da landing page"
                  />
                </div>
                <div>
                  <Label htmlFor="heroSubtitle">Subtítulo</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={content.heroSubtitle}
                    onChange={(e) => updateField('heroSubtitle', e.target.value)}
                    placeholder="Subtítulo descritivo"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="heroImage">URL da Imagem Hero</Label>
                  <Input
                    id="heroImage"
                    value={content.heroImage || ''}
                    onChange={(e) => updateField('heroImage', e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ctaText">Texto do CTA</Label>
                    <Input
                      id="ctaText"
                      value={content.ctaText || ''}
                      onChange={(e) => updateField('ctaText', e.target.value)}
                      placeholder="Texto do call-to-action"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaButtonText">Texto do Botão</Label>
                    <Input
                      id="ctaButtonText"
                      value={content.ctaButtonText || ''}
                      onChange={(e) => updateField('ctaButtonText', e.target.value)}
                      placeholder="Texto do botão"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Funcionalidades
                </CardTitle>
                <CardDescription>
                  Lista de funcionalidades principais do produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.features.map((feature, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Funcionalidade {index + 1}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                            placeholder="Título da funcionalidade"
                          />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={feature.description}
                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            placeholder="Descrição da funcionalidade"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Ícone (opcional)</Label>
                          <Input
                            value={feature.icon || ''}
                            onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                            placeholder="star, heart, shield, etc."
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button onClick={addFeature} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Funcionalidade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Section */}
          <TabsContent value="testimonials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Depoimentos
                </CardTitle>
                <CardDescription>
                  Depoimentos de usuários satisfeitos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.testimonials.map((testimonial, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Depoimento {index + 1}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTestimonial(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                            placeholder="Nome do usuário"
                          />
                        </div>
                        <div>
                          <Label>Depoimento</Label>
                          <Textarea
                            value={testimonial.text}
                            onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                            placeholder="Texto do depoimento"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Avaliação (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={testimonial.rating}
                            onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>URL do Avatar (opcional)</Label>
                          <Input
                            value={testimonial.avatar || ''}
                            onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                            placeholder="https://exemplo.com/avatar.jpg"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button onClick={addTestimonial} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Depoimento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Section */}
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Perguntas Frequentes
                </CardTitle>
                <CardDescription>
                  Perguntas e respostas comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.faq.map((faq, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">FAQ {index + 1}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFAQ(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Pergunta</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                            placeholder="Pergunta frequente"
                          />
                        </div>
                        <div>
                          <Label>Resposta</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                            placeholder="Resposta para a pergunta"
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button onClick={addFAQ} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar FAQ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Section */}
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estatísticas
                </CardTitle>
                <CardDescription>
                  Números e métricas importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Estatística {index + 1}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeStat(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Rótulo</Label>
                          <Input
                            value={stat.label}
                            onChange={(e) => updateStat(index, 'label', e.target.value)}
                            placeholder="Ex: Usuários Ativos"
                          />
                        </div>
                        <div>
                          <Label>Valor</Label>
                          <Input
                            value={stat.value}
                            onChange={(e) => updateStat(index, 'value', e.target.value)}
                            placeholder="Ex: 10,000+"
                          />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Input
                            value={stat.description}
                            onChange={(e) => updateStat(index, 'description', e.target.value)}
                            placeholder="Ex: Famílias confiam no Baby Diary"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button onClick={addStat} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Estatística
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Section */}
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Configurações SEO
                </CardTitle>
                <CardDescription>
                  Otimização para motores de busca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">Título SEO</Label>
                  <Input
                    id="seoTitle"
                    value={content.seoTitle || ''}
                    onChange={(e) => updateField('seoTitle', e.target.value)}
                    placeholder="Título para SEO (máx 60 caracteres)"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">Descrição SEO</Label>
                  <Textarea
                    id="seoDescription"
                    value={content.seoDescription || ''}
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    placeholder="Descrição para SEO (máx 160 caracteres)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="seoKeywords">Palavras-chave SEO</Label>
                  <Input
                    id="seoKeywords"
                    value={content.seoKeywords || ''}
                    onChange={(e) => updateField('seoKeywords', e.target.value)}
                    placeholder="palavra-chave1, palavra-chave2, palavra-chave3"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Footer Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Última atualização: {formatDate(content.updatedAt)}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Conteúdo salvo automaticamente
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 