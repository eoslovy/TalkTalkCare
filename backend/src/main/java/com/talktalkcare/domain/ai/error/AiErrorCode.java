package com.talktalkcare.domain.ai.error;

import com.talktalkcare.common.error.ErrorCodeInterface;

public enum AiErrorCode implements ErrorCodeInterface {
    API_COMMUNICATION_FAILURE(500,3000,"API 통신 실패"),
    API_INVALID_RESPONSE(500,3001, "API 잘못된 응답");

    private final Integer httpStatusCode;
    private final Integer errorCode;
    private final String message;

    AiErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
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
