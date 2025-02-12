package com.talktalkcare.domain.users.exception;

import com.talktalkcare.common.exception.ApplicationException;
import com.talktalkcare.common.error.ErrorCodeInterface;

public class UserException extends ApplicationException {

    public UserException(ErrorCodeInterface errorCode) {
        super(errorCode);
    }

}
