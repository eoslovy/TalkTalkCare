// src/services/authService.ts
import axios from 'axios';
import { UserSignupRequest, SignupApiResponse, SmsVerificationRequest, LoginRequest } from '../types/user';

const BASE_URL = 'http://localhost:8443/api'; // 백엔드 API 기본 URL

export const authService = {
  // 아이디 중복 확인 메서드 추가
  checkIdDuplicate: async (loginId: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${BASE_URL}/users/check-id`, {
        params: { loginId }
      });
      return response.data.isDuplicate === false;
    } catch (error) {
      console.error('아이디 중복 확인 중 오류:', error);
      throw error;
    }
  },

  sendSmsVerification: async (phoneNumber: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/sms/send`, 
        { phoneNumber },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('SMS 인증번호 요청 실패:', error);
      throw error;
    }
  },

  verifySmsCode: async (phoneNumber: string, verificationCode: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/sms/verify`, 
        { 
          phoneNumber, 
          verificationCode 
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('SMS 인증번호 검증 실패:', error);
      throw error;
    }
  },

  signup: async (userData: UserSignupRequest, profileImage: File | null | undefined) => {
    try {
      const formData = new FormData();
      
      // 텍스트 데이터들 추가
      formData.append('loginId', userData.loginId);
      formData.append('password', userData.password);
      formData.append('name', userData.name);
      formData.append('birth', userData.birthdate);
      formData.append('phone', userData.phoneNumber);
  
      // 이미지 파일 추가
      if (profileImage) {
        formData.append('s3Filename', profileImage);
      }
  
      // FormData 내용 확인용 로그
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      const response = await axios.post<SignupApiResponse>(
        `${BASE_URL}/users/sign-up`,
        formData,
        {
          headers : {
            ContentType : 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('서버 응답 데이터:', error.response?.data);
      }
      throw error;
    }
  },

  login: async (loginData: LoginRequest) => {
    try {
      // 전송하는 데이터 콘솔 로그 추가
      console.log('로그인 요청 데이터:', {
        userLoginId: loginData.userLoginId,
        password: loginData.password ? '(비밀번호 입력됨)' : '(비밀번호 없음)',
        autoLogin: loginData.autoLogin
      });
  
      const response = await axios.post(`${BASE_URL}/users/login`, {
        userLoginId: loginData.userLoginId,
        password: loginData.password,
        autoLogin: loginData.autoLogin
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // 응답 데이터도 콘솔 로그 추가
      console.log('로그인 응답 데이터:', response.data);
  
      return response.data;
    } catch (error) {
      // 에러 발생 시 상세 정보 로깅
      console.error('로그인 실패:', error);
      
      // Axios 에러인 경우 추가 정보 로깅
      if (axios.isAxiosError(error)) {
        console.error('Axios 에러 상세 정보:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      }
  
      throw error;
    }
  }
};