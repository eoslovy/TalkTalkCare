//package com.talktalkcare.domain.game.exception;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.core.annotation.Order;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//@RestControllerAdvice
//@Order(2)
//public class GameExceptionHandler {
//    private static final Logger log = LoggerFactory.getLogger(GameExceptionHandler.class);
//
//    @ExceptionHandler(GameException.class)
//    public ResponseEntity<Api<Void>> handleUserException(GameException exception) {
//        ErrorCodeInterface errorCode = exception.getErrorCode();
//
//        log.error("UserException occurred: {} - {}", errorCode.getErrorCode(), errorCode.getMessage(), exception);
//
//        return ResponseEntity
//                .status(errorCode.getHttpStatusCode())
//                .body(Api.ERROR(errorCode.getMessage(), errorCode.getErrorCode()));
//    }
//
//}
