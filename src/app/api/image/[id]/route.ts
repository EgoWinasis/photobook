
import { NextRequest, NextResponse } from "next/server";
import { getDriveMedia } from "@/lib/drive";
import { getSession } from "@/lib/auth";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json(
        { error: "ID file tidak valid." },
        { status: 400 }
      );
    }

    const media = await getDriveMedia(id);

    const headers = new Headers();

    headers.set("Content-Type", media.mimeType);
    headers.set(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(media.name)}`
    );
    headers.set("Cache-Control", "private, no-store");

    const body = Readable.toWeb(media.stream) as ReadableStream;

    return new Response(body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Drive media error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil media dari Google Drive." },
      { status: 500 }
    );
  }
}
