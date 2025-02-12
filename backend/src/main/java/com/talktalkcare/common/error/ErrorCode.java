package com.talktalkcare.common.error;

public enum ErrorCode implements ErrorCodeInterface {

    SERVER_ERROR(500, 500, "일시적인 서버에러가 발생했습니다. 잠시 후 다시 시도해주세요.");

    private final Integer httpStatusCode;
    private final Integer errorCode;
    private final String message;

    ErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
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