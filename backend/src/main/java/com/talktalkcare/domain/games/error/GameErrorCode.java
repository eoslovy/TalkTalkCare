package com.talktalkcare.domain.games.error;

import com.talktalkcare.common.error.ErrorCodeInterface;

public enum GameErrorCode implements ErrorCodeInterface {

    GAME_ERROR_CODE(500, 3000, "게임 관련 에러 발생");

    private final Integer httpStatusCode;
    private final Integer errorCode;
    private final String message;

    GameErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
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
