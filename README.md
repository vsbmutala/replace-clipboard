# AI Kitchen Inventory Management (MVP)

A simple web application for kitchen volunteers to digitize the inventory process using AI-powered invoice extraction.

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL schema from `supabase/schema.sql`
4. Get your project URL and anon key from Settings > API

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Application Routes

- `/receive` - Upload invoice and receive new shipment
- `/inventory` - View and manage current inventory

## Database Schema

- `inventory` - Current inventory items
- `shipments` - Shipment records
- `shipment_items` - Items in each shipment
- `inventory_history` - History of all inventory changes
