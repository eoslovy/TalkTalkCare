import React, { useState, useRef } from 'react';
import { User, Camera } from 'lucide-react';
import '../../styles/components/SignUp.css';
import { authService } from '../../services/authService';
import { UserSignupRequest } from '../../types/user';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
const pwCondition = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;

const SignUp = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoginIdConfirmed, setIsLoginIdConfirmed] = useState(false);
  const [formData, setFormData] = useState<UserSignupRequest>({
    name: '',
    loginId: '',
    password: '',
    phoneNumber: '',
    birthdate: '',
    passwordConfirm: ''
  });
  // 모달 관련 선언
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const navigate = useNavigate();
  const [smsVerificationCode, setSmsVerificationCode] = useState('');
  const [isSmsVerificationSent, setIsSmsVerificationSent] = useState(false);
  const [isSmsVerified, setIsSmsVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoginIdDuplicate, setIsLoginIdDuplicate] = useState(false);

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
  const openModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  // 아이디 중복 확인
  const checkLoginId = async () => {
    try {
      const isAvailable = await authService.checkIdDuplicate(formData.loginId);
      if (isAvailable) {
        openModal('아이디 중복 확인', '사용 가능한 아이디입니다.');
        setIsLoginIdDuplicate(false);
        setIsLoginIdConfirmed(true); 
  
        // ✅ 아이디 중복 확인 후 "이름 입력 단계(step 2)"로 이동
        setStep(2);
      } else {
        openModal('아이디 중복 확인', '이미 가입된 사용자입니다.');
        setIsLoginIdDuplicate(true);
      }
    } catch (error) {
      openModal('오류', '아이디 중복 확인에 실패했습니다.');
    }
  };
  

  const requestSmsVerification = async () => {
    try {
      const response = await authService.sendSmsVerification(
        formData.phoneNumber,
        setModalMessage,  // 모달 메시지 상태 업데이트
        setModalOpen      // 모달 열기 상태 업데이트
      );
      if(response) {
        setIsSmsVerificationSent(true);
        openModal('SMS 인증', '인증번호가 전송되었습니다.');
        setStep(4);
      }
    } catch (error) {
      openModal('오류', 'SMS 인증번호 요청에 실패했습니다.');
    }
  };

  const verifySmsCode = async () => {
    try {
      await authService.verifySmsCode(formData.phoneNumber, smsVerificationCode);
      setIsSmsVerified(true);
      openModal('SMS 인증', 'SMS 인증이 완료되었습니다.');
      setStep(5);
    } catch (error) {
      openModal('오류', 'SMS 인증번호가 일치하지 않습니다.');
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
        return formData.loginId.length >= 6 && !isLoginIdDuplicate;
      case 2:
        return formData.name.length > 0;
      case 3:
        return /^\d{10,11}$/.test(formData.phoneNumber.replace(/-/g, ''));
      case 4:
        return isSmsVerified;
        case 5:  // 비밀번호 검증
        if (!pwCondition.test(formData.password)) {
          setPasswordError('비밀번호는 영문자와 숫자를 포함하여 8자 이상이어야 합니다.');
          return false;
        }
        if (formData.password !== formData.passwordConfirm) {
          setPasswordError('비밀번호가 일치하지 않습니다');
          return false;
        }
        setPasswordError('');
        return true;
      case 6:  // 생년월일 검증
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
      openModal('회원가입', '회원가입이 완료되었습니다.');
      navigate('/login');  // 로그인 페이지로 이동
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('에러 응답 데이터:', error.response?.data);
        const errorMessage = error.response?.data?.result?.msg;
        openModal('오류', errorMessage || '회원가입에 실패했습니다.');
      } else {
        openModal('오류', '회원가입에 실패했습니다.');
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className={`signup-form step-${step}`}>
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
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <p className='profile-notice' onClick={handleImageClick}>프로필 사진 등록</p>
          </div>
          
          {modalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '80%'
            }}>
              <p className="text-xl" style={{ marginBottom: '20px' }}>{modalMessage}</p>
              <button 
                onClick={() => {
                  setModalOpen(false);
                  if (modalMessage === '회원가입이 완료되었습니다.') {
                    navigate('/login');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#c8e6c9',
                  color: '#214005',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        )}

          {/* 아이디 입력 */}
          {step >= 1 && (
          <div className="input-group">
            <input
              type="text"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              placeholder="아이디를 입력하세요 (영문, 숫자, 6자 이상)"
              disabled={isLoginIdConfirmed}
            />
            {step === 1 && (
              <div>
                <button 
                  onClick={checkLoginId}
                  className="next-button"
                  disabled={formData.loginId.length < 6}
                >
                  아이디 중복 확인
                </button>
              </div>
            )}
          </div>
        )}

          {/* 이름 입력 */}
          {step >= 2 && (
            <div className="input-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                autoFocus
              />
              {step === 2 && (
                <button 
                  onClick={() => handleNext(2)}
                  className="next-button"
                  disabled={!formData.name}
                >
                  다음
                </button>
              )}
            </div>
          )}
   
          {/* 전화번호 및 SMS 인증 */}
          {step >= 3 && (
            <div className="input-group">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="전화번호를 입력하세요 (- 제외)"
                maxLength={11}
              />
              {step === 3 && (
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
          {step >= 4 && (
            <div className="input-group">
              <input
                type="text"
                name="smsVerificationCode"
                value={smsVerificationCode}
                onChange={handleChange}
                placeholder="인증번호를 입력하세요"
              />
              {step === 4 && (
                <button 
                  onClick={verifySmsCode}
                  className="next-button"
                >
                  인증 확인
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
                placeholder="비밀번호 입력(영문, 숫자 포함 8자 이상)"
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
            onClick={() => handleNext(5)}
            className="next-button"
            disabled={!pwCondition.test(formData.password) || formData.password !== formData.passwordConfirm}
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
                placeholder="생년월일"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
              />
              {step === 6 && (
                <button 
                  onClick={() => handleNext(7)}
                  className="next-button"
                  disabled={!formData.birthdate}
                >
                  완료
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