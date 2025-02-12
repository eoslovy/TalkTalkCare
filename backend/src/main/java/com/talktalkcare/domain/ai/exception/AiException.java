package com.talktalkcare.domain.ai.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.exception.ApplicationException;

public class AiException extends ApplicationException {

    public AiException(ErrorCodeInterface errorCode){
        super(errorCode);
    }
}
