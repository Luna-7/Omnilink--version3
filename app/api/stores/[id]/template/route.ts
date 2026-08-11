import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClientServer();
  const { id: storeId } = await params;
  const body = await request.json();

  const templateId = body?.template_id;

  if (!templateId) {
    return NextResponse.json(
      { error: "template_id is required" },
      { status: 400 }
    );
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .single();

  if (storeError || !store) {
    return NextResponse.json(
      { error: "Store not found" },
      { status: 404 }
    );
  }

  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id,layout_config,status")
    .eq("id", templateId)
    .eq("status", "active")
    .single();

  if (templateError || !template) {
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 }
    );
  }

  const sections =
    template.layout_config?.sections ?? [];

  const { data: page, error: pageError } = await supabase
    .from("store_pages")
    .update({
      template_id: template.id,
      sections,
      updated_at: new Date().toISOString(),
    })
    .eq("store_id", storeId)
    .select()
    .single();

  if (pageError) {
    console.error("Failed to update store page:", pageError);

    return NextResponse.json(
      { error: "Failed to update store template" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    page,
  });
}
