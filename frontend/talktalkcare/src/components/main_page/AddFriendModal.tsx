// AddFriendModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
// import '../styles/components/AddFriendModal.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AddFriendModalProps {
  onClose: () => void;
  onFriendAdded: () => Promise<void>;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ onClose, onFriendAdded }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userIdFromStorage = localStorage.getItem("userId");
    if (!userIdFromStorage) {
      setError('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setError('이름과 전화번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/friends/add`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userIdFromStorage),
          name: name.trim(),
          phone: phone.trim()
        })
      });

      const data = await response.json();

      if (data.result?.msg === 'success') {
        await onFriendAdded();
        onClose();
      } else {
        setError(data.message || '친구 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
      setError('친구 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
     
      <div className="bg-[#fffef8] rounded-lg shadow-xl w-96 p-6">
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-center bg-[#CBE6C9] p-2 rounded-md">
               친구 추가</h3>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="친구 이름을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호를 입력하세요"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
              className="cancel-button"
            >
              취소
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-[#214005] bg-[#F5FFEA] rounded-lg hover:bg-[#F5FFEA] disabled:bg-[#F5FFEA]"
            >
              {isLoading ? '처리중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;
