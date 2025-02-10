package com.talktalkcare.domain.talktalkAI.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.exception.ApplicationException;

public class TalkTalkTestException extends ApplicationException {

    public TalkTalkTestException(ErrorCodeInterface errorCode) {
        super(errorCode);
    }

}
