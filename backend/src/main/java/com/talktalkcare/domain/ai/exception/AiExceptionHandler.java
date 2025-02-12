package com.talktalkcare.domain.ai.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Order(2)
public class AiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(AiException.class);

    @ExceptionHandler(DementiaTestException.class)
    public ResponseEntity<Api<Void>> handleUserException(DementiaTestException exception) {
        ErrorCodeInterface errorCode = exception.getErrorCode();

        log.error("AiException occurred: {} - {}", errorCode.getErrorCode(), errorCode.getMessage(), exception);

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(Api.ERROR(errorCode.getMessage(), errorCode.getErrorCode()));
    }

}
