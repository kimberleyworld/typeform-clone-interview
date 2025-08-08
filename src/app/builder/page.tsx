'use client'

import { useState } from 'react'

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
  slug: string
  fields: FormField[]
}

export default function FormBuilder() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
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
      alert(`Form "${savedForm.title}" created successfully!`)
      // Reset form for creating another form
      setFormData({
        title: '',
        slug: '',
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Form Builder</h1>
          
          {/* Form Header */}
          <div className="mb-8 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Form Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter form title..."
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Form URL
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  /forms/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="form-slug"
                />
              </div>
            </div>
          </div>

          {/* Add Field Buttons */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Fields</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {fieldTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => addField(option.value)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  + {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {formData.fields.map((field, index) => (
              <div key={field.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Field {index + 1} - {fieldTypeOptions.find(opt => opt.value === field.type)?.label}
                  </h3>
                  <button
                    onClick={() => removeField(field.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter field label..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-900">
                      Required field
                    </label>
                  </div>

                  {/* Options for Radio and Checkbox fields */}
                  {(field.type === 'RADIO' || field.type === 'CHECKBOX') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {field.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                              onClick={() => removeOption(field.id, optionIndex)}
                              className="px-3 py-2 text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(field.id)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveForm}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
