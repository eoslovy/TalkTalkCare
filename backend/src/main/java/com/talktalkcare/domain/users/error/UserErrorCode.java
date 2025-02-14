package com.talktalkcare.domain.users.error;

import com.talktalkcare.common.error.ErrorCodeInterface;

public enum UserErrorCode implements ErrorCodeInterface {

    HASH_ALGORITHM_NOT_FOUND(500, 1000, "HashAlgorithmNotFoundException occurred"),
    USER_ALREADY_EXISTS(400, 1001, "이미 가입된 사용자입니다."),
    USER_OTP_EXPIRED(400, 1002, "인증번호가 만료되었습니다."),
    USER_OTP_MISMATCH(400, 1003, "인증번호가 일치하지 않습니다."),
    USER_NOT_FOUND(400, 1004, "가입되지 않은 사용자입니다."),
    PROFILE_IMAGE_DELETE_FAILED(500, 1005, "파일 삭제 실패"),
    USER_LOGINID_MISMATCH(400,1006,"아이디가 잘못되었거나 가입되지 않은 사용자입니다."),
    USER_PASSWORD_MISMATCH(400,1007,"비밀번호가 잘못 되었습니다."),
    USER_TOKEN_INVALID(400,1008,"유효하지 않은 토큰입니다."),
    UPLOAD_IMAGE_FAILED(500,1009,"사진 업로드 실패"),
    TOKEN_NOT_FOUND(400,1010,"토큰이 존재하지 않습니다"),
    USER_OFFLINE(400, 1011, "사용자가 오프라인입니다.");

    private final Integer httpStatusCode;
    private final Integer errorCode;
    private final String message;

    UserErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
        this.httpStatusCode = httpStatusCode;
        this.errorCode = errorCode;
        this.message = message;
    }

    @Override
    public Integer getHttpStatusCode() {
        return this.httpStatusCode;
    }

    @Override
    public Integer getErrorCode() {
        return this.errorCode;
    }

    @Override
    public String getMessage() {
        return this.message;
    }

}
