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

    public static Api<Void> OK() {
        return SUCCESS;
    }

    public static <T> Api<T> OK(T body) {
        Api<T> api = new Api<>();
        api.result = Result.OK();
        api.body = body;
        return api;
    }

    public static Api<Void> ERROR(String msg) {
        return new Api<>(Result.ERROR(msg));
    }

    public Result getResult() {
        return result;
    }

    public T getBody() {
        return body;
    }

}