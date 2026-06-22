import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";
import { seedDefaultCategories } from "@/lib/categories";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      let user = await prisma.user.findUnique({
        where: { supabaseId: data.user.id },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            supabaseId: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || null,
          },
        });
        await seedDefaultCategories(user.id);
      }

      return response;
    }
  }

  return NextResponse.redirect(`${request.nextUrl.origin}/login?error=auth`);
}
