import { NextRequest, NextResponse } from "next/server";
import { requireUser, ownsStorePage } from "@/lib/api/auth";

// PATCH /api/store-pages/[id]/publish - Toggle published state on a page the
// caller owns. (Previously: no getUser(); could update any page by id.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pageId } = await params;
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { owned } = await ownsStorePage(supabase, user, pageId);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { published?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const published = body?.published;
  if (typeof published !== "boolean") {
    return NextResponse.json(
      { error: "published must be a boolean" },
      { status: 400 }
    );
  }

  const { data: page, error } = await supabase
    .from("store_pages")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", pageId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update publish status" },
      { status: 500 }
    );
  }

  return NextResponse.json({ page });
}
