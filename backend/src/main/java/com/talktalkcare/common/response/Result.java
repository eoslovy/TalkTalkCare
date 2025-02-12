package com.talktalkcare.common.response;

public class Result {

    private static final Result SUCCESS = new Result("success");

    private final String msg;

    private Result(String msg) {
        this.msg = msg;
    }

    public static Result OK() {
        return SUCCESS;
    }

    public static Result ERROR(String msg) {
        return new Result(msg);
    }

    public String getMsg() {
        return msg;
    }

}
