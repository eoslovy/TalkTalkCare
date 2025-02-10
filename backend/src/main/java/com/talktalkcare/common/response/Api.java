package com.talktalkcare.common.response;

public class Api<T> {
    private static final Api<Void> SUCCESS = new Api<>(Result.OK());

    private Result result;
    private T body;

    public Api() {
    }

    public Api(Result result) {
        this.result = result;
    }

    public Api(Result result, T body) {
        this.result = result;
        this.body = body;
    }

    public static Api<Void> OK() {
        return SUCCESS;
    }

    public static <T> Api<T> OK(T body) {
        return new Api<>(Result.OK(), body);
    }

    public static Api<Void> ERROR(String msg,Integer errorCode) {
        return new Api<>(Result.ERROR(msg,errorCode));
    }

    public Result getResult() {
        return result;
    }

    public T getBody() {
        return body;
    }

}