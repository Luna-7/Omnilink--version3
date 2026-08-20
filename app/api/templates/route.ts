import { NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

const FALLBACK_TEMPLATES = [
  {
    id: "minimal",
    name: "Minimal Studio",
    industry_id: "clean-light",
    layout_config: null,
    preview_url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    id: "glass",
    name: "Glass Surface",
    industry_id: "translucent",
    layout_config: null,
    preview_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    id: "diffuse",
    name: "Diffuse Glow",
    industry_id: "ambient-glow",
    layout_config: null,
    preview_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    id: "tech",
    name: "Cyber Tech",
    industry_id: "cyber-neon",
    layout_config: null,
    preview_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
];

export async function GET() {
  try {
    const supabase = await createClientServer();

    const { data, error } = await supabase
      .from("templates")
      .select("id,name,industry_id,layout_config,preview_url,status")
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Could not query templates from Supabase, using fallback templates:", error);
      return NextResponse.json({
        templates: FALLBACK_TEMPLATES,
      });
    }

    return NextResponse.json({
      templates: data && data.length > 0 ? data : FALLBACK_TEMPLATES,
    });
  } catch (err) {
    console.warn("Exception in templates API route, returning fallback templates:", err);
    return NextResponse.json({
      templates: FALLBACK_TEMPLATES,
    });
  }
}

