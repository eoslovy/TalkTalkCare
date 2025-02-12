package com.talktalkcare.batch.error;

import com.talktalkcare.common.error.ErrorCodeInterface;

public enum BatchErrorCode implements ErrorCodeInterface {

    UPDATE_GAME_SCORE_FAILED(500,4000,"게임 결과 업데이트 실패"),
    UPDATE_GAME_CATEGORY_SCORE_FAILED(500,4001,"게임 카테고리별 결과 업데이트 실패"),
    READ_GAME_SCORE_FAILED(500,4002,"게임 결과 읽어오기 실패"),
    READ_GAME_CATEGORY_SCORE_FAILED(500,4003,"게임 카테고리별 결과 읽어오기 실패"),
    PROCESS_GAME_SCORE_FAILED(500, 4004, "게임 결과 처리 실패"),
    PROCESS_GAME_CATEGORY_SCORE_FAILED(500, 4005, "게임 카테고리별 결과 처리 실패"),
    WRITE_GAME_SCORE_FAILED(500, 4006, "게임 결과 저장 실패"),
    WRITE_GAME_CATEGORY_SCORE_FAILED(500, 4007, "게임 카테고리별 결과 저장 실패"),
    SCORE_BATCH_JOB_EXECUTION_FAILED(500, 4008, "게임 결과 배치 작업 실행 실패"),
    CATEGORY_BATCH_JOB_EXECUTION_FAILED(500, 4008, "게임 카테고리 배치 작업 실행 실패");

    private final Integer httpStatusCode;
    private final Integer errorCode;
    private final String message;

    BatchErrorCode(Integer httpStatusCode, Integer errorCode, String message) {
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
