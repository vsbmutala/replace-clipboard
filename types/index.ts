export interface ExtractedItem {
  name: string;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  invoice_filename: string;
  received_at: string;
}

export interface ShipmentItem {
  id: string;
  shipment_id: string;
  item_name: string;
  expected_quantity: number;
  actual_quantity: number;
}

export interface InventoryHistory {
  id: string;
  inventory_id: string;
  action: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  notes: string;
  created_at: string;
}

export interface ConfirmShipmentRequest {
  invoice_filename: string;
  items: Array<{
    name: string;
    expected_quantity: number;
    actual_quantity: number;
  }>;
}

export interface UpdateInventoryRequest {
  item_id: string;
  use_quantity: number;
  notes?: string;
}
