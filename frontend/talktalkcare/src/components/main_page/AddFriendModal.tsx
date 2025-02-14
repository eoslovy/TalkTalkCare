// AddFriendModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
// import '../styles/components/AddFriendModal.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AddFriendModalProps {
  userId: number;
  onClose: () => void;
  onFriendAdded: () => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ 
  userId,
  onClose, 
  onFriendAdded 
}): JSX.Element => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('전화번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/friends/add`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          userId,
          phone,
          name
        })
      });

      const data = await response.json();
      console.log('Add friend response:', data);

      if (data.result?.msg === 'success') {
        onFriendAdded();
        onClose();
      } else {
        throw new Error(data.result?.msg || '친구 추가에 실패했습니다.');
      }
    } catch (err) {
      console.error('Friend add error:', err);
      setError(err instanceof Error ? err.message : '친구 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
     
      <div className="bg-[#fffef8] rounded-lg shadow-xl w-96 p-6"
      style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)' }}>
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-center bg-[#CBE6C9] p-2 rounded-md">
               친구 추가</h3>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              친구 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="친구 이름을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="010-0000-0000"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
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
