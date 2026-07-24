import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateInventoryRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: UpdateInventoryRequest = await request.json();

    // Validation
    if (!body.item_id || typeof body.use_quantity !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. Item ID and use quantity are required.' },
        { status: 400 }
      );
    }

    if (body.use_quantity < 0) {
      return NextResponse.json(
        { error: 'Use quantity cannot be negative.' },
        { status: 400 }
      );
    }

    // Get current inventory item
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', body.item_id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if enough quantity available
    if (body.use_quantity > item.quantity) {
      return NextResponse.json(
        { error: `Cannot use ${body.use_quantity} items. Only ${item.quantity} available.` },
        { status: 400 }
      );
    }

    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity - body.use_quantity;

    // Update inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', body.item_id);

    if (updateError) {
      console.error('Inventory update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update inventory' },
        { status: 500 }
      );
    }

    // Create history record
    await supabase.from('inventory_history').insert({
      inventory_id: body.item_id,
      action: 'Used',
      quantity_change: -body.use_quantity,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      notes: body.notes || 'Manual update',
    });

    return NextResponse.json({ 
      success: true, 
      new_quantity: newQuantity 
    });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
