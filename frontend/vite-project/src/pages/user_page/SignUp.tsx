import React, { useState, useRef } from 'react';
import { User, Camera } from 'lucide-react';
import '../../styles/components/SignUp.css';
import { authService } from '../../services/authService';
import { UserSignupRequest } from '../../types/user';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserSignupRequest>({
    name: '',
    loginId: '',
    password: '',
    phoneNumber: '',
    birthdate: '',
    passwordConfirm: ''
  });
  const navigate = useNavigate();
  const [smsVerificationCode, setSmsVerificationCode] = useState('');
  const [isSmsVerificationSent, setIsSmsVerificationSent] = useState(false);
  const [isSmsVerified, setIsSmsVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 단계별 안내 텍스트
  const stepGuideTexts = {
    1: '이름을 입력해주세요.',
    2: '전화번호를 입력해주세요.',
    3: 'SMS 인증을 진행해주세요.',
    4: '아이디를 입력해주세요. (6자 이상)',
    5: '비밀번호를 입력해주세요. (8자 이상)',
    6: '생년월일을 입력해주세요.',
    7: '모든 정보를 입력하셨습니다. 회원가입하기 버튼을 눌러주세요!'
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const requestSmsVerification = async () => {
    try {
      await authService.sendSmsVerification(formData.phoneNumber);
      setIsSmsVerificationSent(true);
      alert('인증번호가 전송되었습니다.');
      setStep(3);
    } catch (error) {
      alert('SMS 인증번호 요청에 실패했습니다.');
    }
  };

  const verifySmsCode = async () => {
    try {
      await authService.verifySmsCode(formData.phoneNumber, smsVerificationCode);
      setIsSmsVerified(true);
      alert('SMS 인증이 완료되었습니다.');
      setStep(4);
    } catch (error) {
      alert('SMS 인증번호가 일치하지 않습니다.');
    }
  };

  const handleNext = (currentStep: number) => {
    if (validateCurrentStep(currentStep)) {
      setStep(prev => prev + 1);
    }
  };

const validateCurrentStep = (currentStep: number): boolean => {
  switch (currentStep) {
    case 1:
      return formData.name.length > 0;
    case 2:
      return /^\d{10,11}$/.test(formData.phoneNumber.replace(/-/g, ''));
    case 3:
      return isSmsVerified;
    case 4:
      return formData.loginId.length >= 6;
    case 5:  // 비밀번호 검증
      if (formData.password.length < 8) {
        setPasswordError('비밀번호는 8자 이상이어야 합니다.');
        return false;
      }
      if (formData.password !== formData.passwordConfirm) {
        setPasswordError('비밀번호가 일치하지 않습니다');
        return false;
      }
      setPasswordError('');
      return true;
    case 6:  // 생년월일 검증으로 수정
      return formData.birthdate.length > 0;
    default:
      return true;
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'smsVerificationCode') {
      setSmsVerificationCode(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await authService.signup(formData, profileImage);
      console.log('회원가입 응답:', response);  // 응답 확인용
      
      // 에러가 발생하지 않으면 성공으로 처리
      alert('회원가입이 완료되었습니다.');
      navigate('/login');  // 로그인 페이지로 이동
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('에러 응답 데이터:', error.response?.data);
        const errorMessage = error.response?.data?.result?.msg;
        alert(errorMessage || '회원가입에 실패했습니다.');
      } else {
        alert('회원가입에 실패했습니다.');
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className={`signup-form step-${step}`}>
          <div className="step-guide">
            {stepGuideTexts[step as keyof typeof stepGuideTexts]}
          </div>
   
          <div className="profile-upload">
            <div 
              className="profile-image-container" 
              onClick={handleImageClick}
            >
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="프로필" 
                  className="profile-preview" 
                />
              ) : (
                <div className="profile-placeholder">
                  <User size={40} />
                </div>
              )}
              <div className="camera-icon">
                <Camera size={20} />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <p>프로필 사진 등록</p>
          </div>
   
          {/* 이름 입력 */}
          {step >= 1 && (
            <div className="input-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                autoFocus
              />
              {step === 1 && (
                <button 
                  onClick={() => handleNext(1)}
                  className="next-button"
                  disabled={!formData.name}
                >
                  다음
                </button>
              )}
            </div>
          )}
   
          {/* 전화번호 및 SMS 인증 */}
          {step >= 2 && (
            <div className="input-group">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="전화번호를 입력하세요 (- 제외)"
                maxLength={11}
              />
              {step === 2 && (
                <button 
                  onClick={requestSmsVerification}
                  className="next-button"
                  disabled={!/^\d{10,11}$/.test(formData.phoneNumber.replace(/-/g, ''))}
                >
                  인증번호 요청
                </button>
              )}
            </div>
          )}
   
          {/* SMS 인증 */}
          {step >= 3 && (
            <div className="input-group">
              <input
                type="text"
                name="smsVerificationCode"
                value={smsVerificationCode}
                onChange={handleChange}
                placeholder="인증번호를 입력하세요"
              />
              {step === 3 && (
                <button 
                  onClick={verifySmsCode}
                  className="next-button"
                >
                  인증 확인
                </button>
              )}
            </div>
          )}
   
          {/* 아이디 입력 */}
          {step >= 4 && (
            <div className="input-group">
              <input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요 (6자 이상)"
              />
              {step === 4 && (
                <button 
                  onClick={() => handleNext(4)}
                  className="next-button"
                  disabled={formData.loginId.length < 6}
                >
                  다음
                </button>
              )}
            </div>
          )}
   
    {/* 비밀번호 입력 */}
    {step >= 5 && (  // step >= 6을 step >= 5로 수정
      <div className="input-group">
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="비밀번호를 입력하세요 (8자 이상)"
        />
        <input
          type="password"
          name="passwordConfirm"
          value={formData.passwordConfirm || ''}
          onChange={handleChange}
          placeholder="비밀번호를 다시 입력하세요"
          className="mt-2"
        />
        {passwordError && <p className="error-message">{passwordError}</p>}
        {step === 5 && (  // step === 6을 step === 5로 수정
          <button 
            onClick={() => handleNext(5)}  // handleNext(6)을 handleNext(5)로 수정
            className="next-button"
            disabled={formData.password.length < 8 || formData.password !== formData.passwordConfirm}
          >
            다음
          </button>
        )}
      </div>
    )}
      
          {/* 생년월일 입력 */}
          {step >= 6 && (
            <div className="input-group">
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
              />
              {step === 6 && (
                <button 
                  onClick={() => handleNext(7)}
                  className="next-button"
                  disabled={!formData.birthdate}
                >
                  다음
                </button>
              )}
            </div>
          )}
   
          {/* 최종 제출 */}
          {step === 7 && (
            <div className="input-group">
              <button 
                onClick={handleSubmit}
                className="submit-button"
              >
                회원가입하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
   );
}
export default SignUp