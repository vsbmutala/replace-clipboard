import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Inventory fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error('Inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, quantity, unit } = body;

    if (!name || quantity === undefined || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields: name, quantity, unit' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert([
        {
          name: name.trim(),
          quantity: Math.max(0, quantity),
          unit: unit.trim() || 'units',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Inventory creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error('Inventory creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, quantity, unit } = body;

    if (!id || !name || quantity === undefined || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, quantity, unit' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('inventory')
      .update({
        name: name.trim(),
        quantity: Math.max(0, quantity),
        unit: unit.trim() || 'units',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Inventory update error:', error);
      return NextResponse.json(
        { error: 'Failed to update inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Inventory deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inventory deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
