//package com.talktalkcare.domain.game.error;
//
//public class GameErrorCode implements ErrorCodeInterface {
//    HASH_ALGORITHM_NOT_FOUND(500, 1000, "HashAlgorithmNotFoundException occurred"),
//    TOKEN_NOT_FOUND(400,1010,"토큰이 존재하지 않습니다");
//
//    private final Integer httpStatusCode;
//    private final Integer errorCode;
//    private final String message;
//
//    GameErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
//        this.httpStatusCode = httpStatusCode;
//        this.errorCode = errorCode;
//        this.message = message;
//    }
//
//    @Override
//    public Integer getHttpStatusCode() {
//        return this.httpStatusCode;
//    }
//
//    @Override
//    public Integer getErrorCode() {
//        return this.errorCode;
//    }
//
//    @Override
//    public String getMessage() {
//        return this.message;
//    }
//
//}
