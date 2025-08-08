import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface FormPageProps {
  params: {
    slug: string
  }
}

async function getForm(slug: string) {
  const form = await prisma.form.findUnique({
    where: { slug },
    include: {
      fields: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  return form
}

export default async function FormPage({ params }: FormPageProps) {
  const form = await getForm(params.slug)

  if (!form) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
          <p className="text-gray-600 mb-8">Please fill out this form</p>
          
          <form className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'TEXT' && (
                  <input
                    type="text"
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                
                {field.type === 'TEXTAREA' && (
                  <textarea
                    required={field.required}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                
                {field.type === 'NUMBER' && (
                  <input
                    type="number"
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                
                {field.type === 'EMAIL' && (
                  <input
                    type="email"
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                
                {field.type === 'RADIO' && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={field.id}
                        value="option1"
                        required={field.required}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-900">Option 1</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={field.id}
                        value="option2"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-900">Option 2</label>
                    </div>
                  </div>
                )}
                
                {field.type === 'CHECKBOX' && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name={`${field.id}[]`}
                        value="option1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-900">Option 1</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name={`${field.id}[]`}
                        value="option2"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-900">Option 2</label>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-6">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
