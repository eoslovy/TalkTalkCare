package com.talktalkcare.domain.games.exception;

import com.talktalkcare.common.error.ErrorCodeInterface;
import com.talktalkcare.common.exception.ApplicationException;

public class GameException extends ApplicationException {
    public GameException(ErrorCodeInterface errorCode) {super(errorCode);}
}
