import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. 응답 객체 미리 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Supabase 클라이언트 생성 (쿠키 확인용)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. 현재 로그인된 유저 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. 경로 보호 로직 (여기가 핵심!)
  const path = request.nextUrl.pathname;

  // 로그인 안 했는데 대시보드나 다른 페이지로 가려고 하면 -> 메인(/)으로 쫓아냄
  if (!user && path !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // (선택사항) 이미 로그인했는데 메인(/)에 있으면 -> 대시보드로 바로 보내줌
  if (user && path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

// 5. 미들웨어가 감시할 경로 설정
export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 경로에서 미들웨어가 실행됩니다:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     * - 이미지 파일들 (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
