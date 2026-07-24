import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PDFParse } from 'pdf-parse';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to parse PDF
async function parsePDF(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

// Helper function to parse Excel
function parseExcel(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  return jsonData.map((row: any) => row.join('\t')).join('\n');
}

// Helper function to parse CSV
function parseCSV(text: string): string {
  const parsed = Papa.parse(text, { header: false });
  return parsed.data.map((row: any) => row.join('\t')).join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type - now supports images, PDF, Excel, and CSV
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload an image (JPEG, PNG), PDF, Excel, or CSV file.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = '';
    let isImage = false;

    // Parse based on file type
    if (file.type === 'application/pdf') {
      extractedText = await parsePDF(buffer);
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      extractedText = parseExcel(buffer);
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const text = buffer.toString('utf-8');
      extractedText = parseCSV(text);
    } else {
      // Image files
      isImage = true;
    }

    // Prepare GPT request
    let userContent: any;

    if (isImage) {
      const base64 = buffer.toString('base64');
      userContent = [
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
      ];
    } else {
      userContent = [
        {
          type: 'text' as const,
          text: `Extract all items and their quantities from this invoice data:\n\n${extractedText}`,
        },
      ];
    }

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
          content: userContent,
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
