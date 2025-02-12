package com.talktalkcare.common.exception;

import com.talktalkcare.common.error.ErrorCode;
import com.talktalkcare.common.response.Api;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Order(value = Integer.MAX_VALUE)
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(value = ApplicationException.class)
    public ResponseEntity<Api<Void>> handleApplicationException(ApplicationException exception) {
        log.error("ApplicationException occurred: {} - {}", exception.getErrorCode().getErrorCode(), exception.getMessage());

        return ResponseEntity
                .status(exception.getHttpStatusCode())
                .body(Api.ERROR(exception.getMessage(), exception.getErrorCode().getErrorCode()));
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<Api<Void>> handleGeneralException(Exception exception) {
        log.error("GeneralException error occurred: {}", exception.getMessage(), exception);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Api.ERROR(ErrorCode.SERVER_ERROR.getMessage(), ErrorCode.SERVER_ERROR.getErrorCode()));
    }
}
