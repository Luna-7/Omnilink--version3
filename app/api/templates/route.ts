import { NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("templates")
    .select(
      "id,name,industry_id,layout_config,preview_url,status"
    )
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch templates:", error);

    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    templates: data ?? [],
  });
}
