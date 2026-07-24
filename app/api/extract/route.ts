import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type - images only for now
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload an image (JPEG, PNG).' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an inventory extraction assistant. Extract item names, quantities, and units from invoices.
          
Rules:
- Extract item names, quantities, and units
- Common units: lbs, kg, oz, boxes, cartons, bags, cans, bottles, units, pieces, dozen, pack, case
- If no unit is specified, default to "units"
- Normalize item names (e.g., APPLE, Apple, apple should all become "Apple")
- Normalize units (e.g., lb, lbs should be "lbs", box, boxes should be "boxes")
- Return valid JSON only, no markdown formatting
- Return empty array if no items found

Return format:
[
  {
    "name": "Item Name",
    "quantity": number,
    "unit": "unit name"
  }
]`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text' as const,
              text: 'Extract all items and their quantities from this invoice.',
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: `data:${file.type};base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const contentText = response.choices[0]?.message?.content || '[]';
    
    // Clean the response - remove markdown code blocks if present
    const cleanJson = contentText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const items = JSON.parse(cleanJson);

    // Validate and normalize items
    const normalizedItems = items
      .filter((item: any) => item.name && typeof item.quantity === 'number')
      .map((item: any) => ({
        name: item.name.trim().charAt(0).toUpperCase() + item.name.trim().slice(1).toLowerCase(),
        quantity: Math.max(0, item.quantity),
        unit: item.unit || 'units',
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json({ items: normalizedItems });
  } catch (error) {
    console.error('Extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to extract items from invoice: ${errorMessage}` },
      { status: 500 }
    );
  }
}
