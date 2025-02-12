package com.talktalkcare.domain.dementia.service.handler;

import com.talktalkcare.domain.dementia.dto.TestType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class TestTypeHandlerFactory {

    private final Map<TestType, TestTypeHandler> handlerMap;

    @Autowired
    public TestTypeHandlerFactory(List<TestTypeHandler> handlers) {
        this.handlerMap = handlers.stream()
                .collect(Collectors.toMap(TestTypeHandler::getTestType, handler -> handler));
    }

    public TestTypeHandler getHandler(TestType testType) {
        return handlerMap.get(testType);
    }

}