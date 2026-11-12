
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    // Ambil dan validasi username
    const usernameValue = data.get("username");
    const passwordValue = data.get("password");

    const username =
      typeof usernameValue === "string"
        ? usernameValue.trim().toLowerCase()
        : "";

    const password =
      typeof passwordValue === "string"
        ? passwordValue
        : "";

    const expected = process.env.LOGIN_PASSWORD;

    // Validasi input
    if (!username || !password || !expected) {
      return NextResponse.redirect(
        new URL("/?error=1", request.url)
      );
    }

    // Validasi akun
    const validUsers = ["dita", "ego"];

    if (
      !validUsers.includes(username) ||
      password !== expected
    ) {
      return NextResponse.redirect(
        new URL("/?error=1", request.url)
      );
    }

    // Buat session
    await createSession(username);

    return NextResponse.redirect(
      new URL("/memories", request.url)
    );

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.redirect(
      new URL("/?error=1", request.url)
    );
  }
}
