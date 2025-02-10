import React, { useState } from 'react';
import { friendApi } from '../api/friendApi';
import styles from './AddFriendModal.module.css';

interface AddFriendModalProps {
    userId: number;
    onClose: () => void;
    onAdd: (request: { userId: number; phone: string; name: string }) => Promise<void>;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ userId, onClose, onAdd }) => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await friendApi.addFriend({
                userId,
                phone,
                name
            });
            onAdd({
                userId,
                phone,
                name
            });
            onClose();
        } catch (err) {
            setError('친구 추가에 실패했습니다.');
            console.error('친구 추가 실패:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3>친구 추가</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="phone">전화번호</label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="전화번호를 입력하세요"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">이름</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            disabled={isSubmitting}
                        />
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.buttons}>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={styles.submitButton}
                        >
                            {isSubmitting ? '처리 중...' : '추가'}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={isSubmitting}
                            className={styles.cancelButton}
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFriendModal;