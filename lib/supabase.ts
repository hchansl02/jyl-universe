import { createClient } from '@supabase/supabase-js';

// .env.local 파일에 적어둔 주소와 열쇠를 꺼내옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 이 'supabase'라는 변수가 우리 앱 전체에서 쓸 '리모컨'입니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);