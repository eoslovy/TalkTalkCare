package com.talktalkcare.domain.users.config;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AWSS3Properties.class)
public class S3Config {

    @Bean
    public AmazonS3Client amazonS3Client(AWSS3Properties s3Properties) {
        AWSCredentials credentials = new BasicAWSCredentials(
                s3Properties.getAccessKey(),
                s3Properties.getSecretKey()
        );

        return (AmazonS3Client) AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withRegion(s3Properties.getRegion())
                .build();
    }
}
