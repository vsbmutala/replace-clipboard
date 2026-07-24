import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ConfirmShipmentRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmShipmentRequest = await request.json();

    // Validation
    if (!body.invoice_filename || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Invoice filename and items are required.' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of body.items) {
      if (!item.name || typeof item.actual_quantity !== 'number' || item.actual_quantity < 0) {
        return NextResponse.json(
          { error: 'Invalid item data. Name and valid quantity are required.' },
          { status: 400 }
        );
      }
    }

    // Create shipment
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        invoice_filename: body.invoice_filename,
        received_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (shipmentError) {
      console.error('Shipment creation error:', shipmentError);
      return NextResponse.json(
        { error: 'Failed to create shipment' },
        { status: 500 }
      );
    }

    // Process each item
    for (const item of body.items) {
      // Create shipment item
      const { error: shipmentItemError } = await supabase
        .from('shipment_items')
        .insert({
          shipment_id: shipment.id,
          item_name: item.name,
          expected_quantity: item.expected_quantity,
          actual_quantity: item.actual_quantity,
        });

      if (shipmentItemError) {
        console.error('Shipment item creation error:', shipmentItemError);
        continue;
      }

      // Check if item already exists in inventory
      const { data: existingItem } = await supabase
        .from('inventory')
        .select('*')
        .eq('name', item.name)
        .single();

      if (existingItem) {
        // Update existing inventory
        const previousQuantity = existingItem.quantity;
        const newQuantity = previousQuantity + item.actual_quantity;

        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error('Inventory update error:', updateError);
          continue;
        }

        // Create history record
        await supabase.from('inventory_history').insert({
          inventory_id: existingItem.id,
          action: 'Shipment Received',
          quantity_change: item.actual_quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          notes: `Invoice: ${body.invoice_filename}`,
        });
      } else {
        // Create new inventory item
        const { data: newItem, error: createError } = await supabase
          .from('inventory')
          .insert({
            name: item.name,
            quantity: item.actual_quantity,
          })
          .select()
          .single();

        if (createError) {
          console.error('Inventory creation error:', createError);
          continue;
        }

        // Create history record
        await supabase.from('inventory_history').insert({
          inventory_id: newItem.id,
          action: 'Shipment Received',
          quantity_change: item.actual_quantity,
          previous_quantity: 0,
          new_quantity: item.actual_quantity,
          notes: `Invoice: ${body.invoice_filename}`,
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      shipment_id: shipment.id 
    });
  } catch (error) {
    console.error('Confirm shipment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to confirm shipment: ${errorMessage}` },
      { status: 500 }
    );
  }
}
