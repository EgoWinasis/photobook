
import { NextResponse } from "next/server";
import { getAlbums } from "@/lib/drive";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const albums = await getAlbums();

    return NextResponse.json(
      {
        albums,
        syncedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Drive sync failed:", error);

    return NextResponse.json(
      {
        error: "Tidak dapat membaca Google Drive. Periksa konfigurasi dan akses folder.",
      },
      { status: 500 }
    );
  }
}
