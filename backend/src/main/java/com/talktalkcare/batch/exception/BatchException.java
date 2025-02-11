package com.talktalkcare.batch.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.exception.ApplicationException;

public class BatchException extends ApplicationException {
    public BatchException(ErrorCodeInterface errorCode) {
        super(errorCode);
    }
}
