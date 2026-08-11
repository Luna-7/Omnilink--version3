import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClientServer();
  const { id: pageId } = await params;
  const body = await request.json();

  const published = body?.published;

  if (typeof published !== "boolean") {
    return NextResponse.json(
      { error: "published must be a boolean" },
      { status: 400 }
    );
  }

  const { data: page, error } = await supabase
    .from("store_pages")
    .update({
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .select()
    .single();

  if (error) {
    console.error("Failed to publish store page:", error);

    return NextResponse.json(
      { error: "Failed to update publish status" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    page,
  });
}
