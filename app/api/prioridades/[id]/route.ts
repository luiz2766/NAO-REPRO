import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { id } = await params;
    console.log(`Attempting to delete priority with ID: ${id}`);

    // Try to parse as number if it's a bigint identity
    const numericId = parseInt(id);
    const deleteQuery = client.from('clientes_prioridade').delete();
    
    if (!isNaN(numericId)) {
      deleteQuery.or(`id.eq.${numericId},id.eq.${id}`);
    } else {
      deleteQuery.eq('id', id);
    }

    const { error, count } = await deleteQuery;

    if (error) {
      console.error("Supabase Delete Error:", error);
      throw error;
    }

    console.log(`Delete successful. Count: ${count}`);
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error("Delete Prioridade Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
