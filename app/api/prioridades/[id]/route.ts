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

    // Attempt deletion with both string and numeric formats
    const numericId = parseInt(id);
    const query = client.from('clientes_prioridade').delete();
    
    let result;
    if (!isNaN(numericId)) {
      result = await query.or(`id.eq.${numericId},id.eq.${id}`).select();
    } else {
      result = await query.eq('id', id).select();
    }
    
    const { data, error } = result;

    if (error) {
      console.error("Supabase Delete Error:", error);
      throw error;
    }

    const deletedCount = data?.length || 0;
    console.log(`Delete operation complete. Rows deleted: ${deletedCount}`);
    
    return NextResponse.json({ 
      success: true, 
      count: deletedCount,
      message: deletedCount > 0 ? "Registro excluído" : "Nenhum registro encontrado com este ID"
    });
  } catch (error: any) {
    console.error("Delete Prioridade Error:", error);
    return NextResponse.json({ 
      error: error.message || "Erro ao excluir registro",
      details: error 
    }, { status: 500 });
  }
}
