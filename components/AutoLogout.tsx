"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AutoLogout() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // 1시간 (밀리초 단위: 60분 * 60초 * 1000)
    const TIMEOUT_MS = 60 * 60 * 1000; 
    // 테스트할 때는 10초(10000) 정도로 줄여서 확인해보세요!

    let lastActivity = Date.now();

    // 1. 로그아웃 실행 함수
    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push("/"); // 로그인 화면으로 튕겨내기
      router.refresh();
    };

    // 2. 활동 감지 시 시간 갱신 함수
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // 3. 1분마다 검사하는 인터벌 (잠자기 모드 대응용)
    // setTimeout 대신 setInterval을 쓰는 이유:
    // 컴퓨터가 잠들면 setTimeout도 멈춥니다. 
    // 깨어났을 때 현재시간 - 마지막활동시간을 계산하는게 가장 정확합니다.
    const checkInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > TIMEOUT_MS) {
        handleLogout();
        clearInterval(checkInterval); // 로그아웃 했으니 검사 중단
      }
    }, 60 * 1000); // 1분마다 검사

    // 4. 감지할 이벤트들 등록 (마우스 움직임, 클릭, 키보드 입력)
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("keypress", updateActivity);
    window.addEventListener("scroll", updateActivity);

    // 5. 청소하기 (컴포넌트 사라질 때 이벤트 제거)
    return () => {
      clearInterval(checkInterval);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keypress", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, [router, supabase]);

  return null; // 화면엔 아무것도 안 보임 (투명 경찰)
}
