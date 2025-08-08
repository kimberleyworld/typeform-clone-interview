import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface FormField {
  label: string
  type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'EMAIL' | 'RADIO' | 'CHECKBOX'
  required: boolean
  order: number
}

interface CreateFormRequest {
  title: string
  fields: FormField[]
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateFormRequest = await request.json()
    const { title, fields } = body

    // Validate required fields
    if (!title || !fields || fields.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = generateSlug(title)

    // Check if slug already exists
    const existingForm = await prisma.form.findUnique({
      where: { slug }
    })

    if (existingForm) {
      return NextResponse.json(
        { error: 'A form with this URL already exists' },
        { status: 409 }
      )
    }

    // Create the form with fields in a transaction
    const savedForm = await prisma.form.create({
      data: {
        title,
        slug,
        fields: {
          create: fields.map((field: FormField) => ({
            label: field.label,
            type: field.type,
            required: field.required,
            order: field.order
          }))
        }
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(savedForm, { status: 201 })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const forms = await prisma.form.findMany({
      include: {
        fields: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
