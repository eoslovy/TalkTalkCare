// src/types/user.ts

// 회원가입 요청 데이터 타입
export interface UserSignupRequest {
  name: string;
  loginId: string;
  password: string;
  phoneNumber: string;
  birthdate: string;
  passwordConfirm?: string; // 선택적 속성으로 추가
  smsVerified?: boolean; // SMS 인증 상태 추가
}

// 회원가입 API 응답 타입
export interface SignupApiResponse {
  success: boolean;
  message?: string;
  result?: {
    msg?: string;
    errorCode?: number;
  };
}

// SMS 인증 관련 타입
export interface SmsVerificationRequest {
  phoneNumber: string;
  verificationCode: string;
}

// 사용자 정보 타입
export interface User {
  loginId: string;    
  name: string;
  phone: string;
  birth: string;
  profileImageUrl?: string;
}

// 로그인 요청 데이터 타입 (새로 추가)
export interface LoginRequest {
  userLoginId: string;
  password: string;
  autoLogin: boolean;
}