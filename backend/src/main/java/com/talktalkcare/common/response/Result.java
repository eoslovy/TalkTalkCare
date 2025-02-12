package com.talktalkcare.common.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class Result {

    private static final Result SUCCESS = new Result("success",null);

    private final String msg;
    private final Integer errorCode;

    public static Result OK() {
        return SUCCESS;
    }

    public static Result ERROR(String msg,Integer errorCode) {
        return new Result(msg,errorCode);
    }

}
