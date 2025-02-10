package com.talktalkcare.domain.users.service;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.talktalkcare.domain.users.config.AWSS3Properties;
import com.talktalkcare.domain.users.error.UserErrorCode;
import com.talktalkcare.domain.users.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3Client amazonS3Client;
    private final AWSS3Properties s3Properties;

    @Transactional
    public String uploadFile(MultipartFile file, String oldFileName) throws IOException {

        if (oldFileName != null && !oldFileName.isEmpty()) {
            deleteFile(oldFileName.substring(oldFileName.lastIndexOf('/') + 1));
        }

        String newFileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        amazonS3Client.putObject(
                s3Properties.getBucket(),
                newFileName,
                file.getInputStream(),
                metadata
        );

        return newFileName;
    }

//    public ProfileImageResp getFileUrl(String fileName) {
//        return new ProfileImageResp(amazonS3Client.getUrl(s3Properties.getBucket(), fileName).toString());
//    }

    public void deleteFile(String fileName) {
        try {
            amazonS3Client.deleteObject(s3Properties.getBucket(), fileName);
        } catch (AmazonS3Exception e) {
            throw new UserException(UserErrorCode.PROFILE_IMAGE_DELETE_FAILED);
        }
    }
}
