import { NextRequest, NextResponse } from "next/server";
import { downloadAvatarFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || id.length < 12) {
      return new NextResponse("Invalid avatar ID", { status: 400 });
    }

    const result = await downloadAvatarFile(id);
    if (!result) {
      return new NextResponse("Avatar not found", { status: 404 });
    }

    return new Response(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("Avatar streaming error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
