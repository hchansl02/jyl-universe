# JYL Universe

Next.js 15 (App Router) + Tailwind CSS + Lucide React 기반 프로젝트입니다.  
v0.dev에서 생성한 코드를 이식해 사용할 수 있습니다.

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

## v0.dev 코드 이식 방법

1. **페이지 전체를 교체**: v0에서 받은 JSX를 `app/page.tsx`의 내용으로 붙여 넣습니다.
2. **컴포넌트로 사용**: v0에서 받은 컴포넌트는 `components/` 폴더에 저장한 뒤, `app/page.tsx`에서 `import` 해 사용합니다.
3. **아이콘**: Lucide React가 설치되어 있으므로 `import { IconName } from "lucide-react"` 형태로 사용할 수 있습니다.

## 기술 스택

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS**
- **Lucide React** (아이콘)
- **TypeScript**
