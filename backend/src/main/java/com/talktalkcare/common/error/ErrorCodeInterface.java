package com.talktalkcare.common.error;

public interface ErrorCodeInterface {

    Integer getHttpStatusCode();

    Integer getErrorCode();

    String getMessage();

}