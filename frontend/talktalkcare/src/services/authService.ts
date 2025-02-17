// src/services/authService.ts
import axios from 'axios';
import { UserSignupRequest, SignupApiResponse, LoginRequest } from '../types/user';
import { AxiosResponse } from 'axios';
import { LogoutResponse } from '../types/user';

const BASE_URL = import.meta.env.VITE_API_BASE_URL; // 백엔드 API 기본 URL

export const authService = {
  // 아이디 중복 확인 API 호출
  checkIdDuplicate: async (userLoginId: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${BASE_URL}/users/check-id`, {
        params: { userLoginId }
      });

      console.log('아이디 중복 확인 응답:', response.data);

      const { msg } = response.data.result;
      return msg === 'success'; // "success"이면 true, 아니면 false 반환
    } catch (error) {
      console.error('아이디 중복 확인 중 오류:', error);
      return false; // 예외 발생 시 false 반환 (예외 방지)
    }
  },

  sendSmsVerification: async (phoneNumber: string) => {
      const response = await axios.post(`${BASE_URL}/sms/send`, 
        { phoneNumber },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.result.errorCode !== null) {
        alert(response.data.result.msg);
        return false;
      }
      return true;
  },

  verifySmsCode: async (phoneNumber: string, verificationCode: string) => {
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
      const response = await axios.post(`${BASE_URL}/users/login`, {
        userLoginId: loginData.userLoginId,
        password: loginData.password,
        autoLogin: loginData.autoLogin
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // 쿠키를 주고받을 수 있도록 설정
      });

      // 응답에서 토큰을 받아와서 axios의 기본 헤더에 설정
      const token = response.data.body.token;
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },
  validateToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('토큰이 존재하지 않습니다.');
        return false;
      }
  
      // 토큰 디코딩 및 만료 확인
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('토큰 형식이 잘못되었습니다.');
        return false;
      }
  
      try {
        const response = await axios.get(`${BASE_URL}/api/users/validate-token`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
  
        console.log('토큰 검증 응답:', response.data);
        return response.data.result.msg === 'success';
      } catch (error) {
        console.error('토큰 검증 API 호출 중 오류:', error);
        return false;
      }
    } catch (error) {
      console.error('토큰 검증 중 예상치 못한 오류:', error);
      return false;
    }
  },

  logout: async (): Promise<LogoutResponse> => {
    try {
      const response: AxiosResponse<LogoutResponse> = await axios.post(
        `${BASE_URL}/users/logout`, 
        {}, 
        { 
          withCredentials: true 
        }
      );
      
      // localStorage 초기화
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('profile-image');
   
      // navigate를 위해 현재 라우터 이용
      window.location.href = '/login'; // 직접 로그인 페이지로 리다이렉트
   
      return response.data;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
   }
};

