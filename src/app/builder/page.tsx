'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus } from 'lucide-react'

type FieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'EMAIL' | 'RADIO' | 'CHECKBOX'

interface FormField {
  id: string
  label: string
  type: FieldType
  required: boolean
  order: number
  options?: string[] // For radio and checkbox fields
}

interface FormData {
  title: string
  fields: FormField[]
}

export default function FormBuilder() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    fields: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: '',
      type,
      required: false,
      order: formData.fields.length,
      options: type === 'RADIO' || type === 'CHECKBOX' ? [''] : undefined
    }
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const removeField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index }))
    }))
  }

  const addOption = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId && field.options
          ? { ...field, options: [...field.options, ''] }
          : field
      )
    }))
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId && field.options
          ? { 
              ...field, 
              options: field.options.map((option, index) => 
                index === optionIndex ? value : option
              )
            }
          : field
      )
    }))
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId && field.options
          ? { 
              ...field, 
              options: field.options.filter((_, index) => index !== optionIndex)
            }
          : field
      )
    }))
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title
    }))
  }

  const saveForm = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a form title')
      return
    }

    if (formData.fields.length === 0) {
      alert('Please add at least one field')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save form')
      }

      const savedForm = await response.json()
      alert(`Form "${savedForm.title}" created successfully! Form ID: ${savedForm.id}`)
      // Reset form for creating another form
      setFormData({
        title: '',
        fields: []
      })
    } catch (error) {
      console.error('Error saving form:', error)
      alert('Failed to save form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldTypeOptions: { value: FieldType; label: string }[] = [
    { value: 'TEXT', label: 'Text Input' },
    { value: 'TEXTAREA', label: 'Text Area' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'RADIO', label: 'Multiple Choice (Radio)' },
    { value: 'CHECKBOX', label: 'Checkboxes' },
  ]

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Form Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Form Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter form title..."
                />
              </div>
            </div>

            {/* Add Field Buttons */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Add Fields</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {fieldTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => addField(option.value)}
                    variant="outline"
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {formData.fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Field {index + 1}</CardTitle>
                        <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                          {fieldTypeOptions.find(opt => opt.value === field.type)?.label}
                        </span>
                      </div>
                      <Button
                        onClick={() => removeField(field.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Field Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Enter field label..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(field.id, { required: checked as boolean })}
                      />
                      <Label htmlFor={`required-${field.id}`}>Required field</Label>
                    </div>

                    {/* Options for Radio and Checkbox fields */}
                    {(field.type === 'RADIO' || field.type === 'CHECKBOX') && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        <div className="space-y-2">
                          {field.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <Button
                                onClick={() => removeOption(field.id, optionIndex)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            onClick={() => addOption(field.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={saveForm}
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Saving...' : 'Save Form'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
