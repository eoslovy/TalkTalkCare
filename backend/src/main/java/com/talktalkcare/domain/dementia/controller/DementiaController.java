package com.talktalkcare.domain.dementia.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.ai.service.AiAnalysisService;
import com.talktalkcare.domain.dementia.dto.DementiaTestDto;
import com.talktalkcare.domain.dementia.service.DementiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dementia-test")
@RequiredArgsConstructor
public class DementiaController {

    private final DementiaService dementiaService;

    @PostMapping("/result")
    public Api<String> saveTestResult(@RequestBody DementiaTestDto dementiaTestDto) {
        dementiaService.saveTestResult(dementiaTestDto);
        return Api.OK("테스트 결과가 성공적으로 저장되었습니다.");
    }

    @GetMapping("/analysis")
    public Api<String> getTestResults(@RequestParam Integer userId, @RequestParam int requestType) {
        return Api.OK(dementiaService.generateAiTestAnalysis(userId, requestType));
    }

}
