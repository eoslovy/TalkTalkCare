package com.talktalkcare.domain.users.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aws.s3")
@Getter
@Setter
public class AWSS3Properties {

    private String accessKey;

    private String secretKey;

    private String region;

    private String bucket;

}
