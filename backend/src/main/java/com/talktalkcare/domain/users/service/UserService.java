package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.converter.UserConverter;
import com.talktalkcare.domain.users.converter.UserSecurityConverter;
import com.talktalkcare.domain.users.dto.*;
import com.talktalkcare.domain.users.entity.User;
import com.talktalkcare.domain.users.entity.UserSecurity;
import com.talktalkcare.domain.users.error.UserErrorCode;
import com.talktalkcare.domain.users.exception.UserException;
import com.talktalkcare.domain.users.repository.UserRepository;
import com.talktalkcare.domain.users.repository.UserSecurityRepository;
import com.talktalkcare.domain.users.utils.PasswordEncryptor;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final UserSecurityRepository userSecurityRepository;

    public void checkUserId(String userLoginId) {
        if(userRepository.existsByLoginId(userLoginId)) {
            throw new UserException(UserErrorCode.USER_ALREADY_EXISTS);
        }
    }

    @Transactional
    public void signUp(UserDto userDto) {
        String randomSalt = generateSalt();
        String rawPassword = userDto.getPassword();
        String encryptedPassword = PasswordEncryptor.encryptPassword(rawPassword,randomSalt);

        User user = UserConverter.dtoToEntity(userDto, encryptedPassword);
        UserSecurity userSecurity = UserSecurityConverter.toEntity(user, randomSalt);

        String uploadedFileName = "https://talktalkcare.s3.ap-southeast-2.amazonaws.com/originImg.webp";

        if(userDto.getS3Filename() != null) {
            try{
                uploadedFileName = "https://talktalkcare.s3.ap-southeast-2.amazonaws.com/"+s3Service.uploadFile(userDto.getS3Filename(), null);
            } catch (IOException e) {
                throw new UserException(UserErrorCode.UPLOAD_IMAGE_FAILED);
            }
        }

        user.setS3FileName(uploadedFileName);

        userRepository.save(user);
        userSecurityRepository.save(userSecurity);
    }

    @Transactional
    public ProfileImageResp updateProfileImage(ProfileImageReq profileImageReq){
        User user = getUserById(profileImageReq.getUserId());

        try {
            String newFileName = s3Service.uploadFile(profileImageReq.getFile(), user.getS3FileName());
            user.setS3FileName(newFileName);
            return new ProfileImageResp(newFileName);
        } catch (IOException e) {
            throw new UserException(UserErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    public User getUserByLoginId(String userLoginId) {
        return userRepository.findByLoginId(userLoginId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
    }

    private String generateSalt() {
        return UUID.randomUUID().toString();
    }

    @Transactional
    public LoginResp login(LoginReq request, HttpServletResponse response) {
        String userLoginId = request.getUserLoginId();

        User user = authenticate(userLoginId, request.getPassword());

        userRepository.setUserLoginedAt(user.getUserId());

        if (request.isAutoLogin()) {
            handleAutoLogin(userLoginId, response);
        }

        return new LoginResp(
                user.getUserId(),
                user.getName(),
                user.getS3FileName());
    }

    private User authenticate(String loginId, String password) {
        if(!userRepository.existsByLoginId(loginId)) {
            throw new UserException(UserErrorCode.USER_LOGINID_MISMATCH);
        }

        User user = getUserByLoginId(loginId);

        UserSecurity userSecurity = userSecurityRepository.findById(loginId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        String encryptedPassword = PasswordEncryptor.encryptPassword(password, userSecurity.getSalt());

        if(!user.getPassword().equals(encryptedPassword)){
            throw new UserException(UserErrorCode.USER_PASSWORD_MISMATCH);
        }

        return user;
    }

    @Transactional
    public void handleAutoLogin(String loginId, HttpServletResponse response) {
        String token = createAutoLoginToken(loginId);
        storeTokenInDatabase(loginId, token);

        Cookie tokenCookie = new Cookie("remember-me-token",token);
        Cookie idCookie = new Cookie("remember-me-id", loginId);

        settingCookie(tokenCookie);
        settingCookie(idCookie);

        response.addCookie(tokenCookie);
        response.addCookie(idCookie);
    }

    private String createAutoLoginToken(String loginId) {
        return PasswordEncryptor.encryptPassword(loginId,generateSalt());
    }

    @Transactional
    protected void storeTokenInDatabase(String loginId, String token) {
        User user = getUserByLoginId(loginId);
        user.setToken(token);
    }

    private void settingCookie(Cookie cookie) {
        cookie.setHttpOnly(true);
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7일
        cookie.setPath("/");
    }

    @Transactional
    public LoginResp autoLogin(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            String loginId = null;
            String token = null;

            for (Cookie cookie : cookies) {
                if ("remember-me-id".equals(cookie.getName())) {
                    loginId = cookie.getValue();
                } else if ("remember-me-token".equals(cookie.getName())) {
                    token = cookie.getValue();
                }
            }

            if (loginId != null && token != null) {

                User user = getUserByLoginId(loginId);

                if (!user.getToken().equals(token)) {
                    deleteCookies(response);
                    throw new UserException(UserErrorCode.USER_TOKEN_INVALID);
                }

                return new LoginResp(
                        user.getUserId(),
                        user.getName(),
                        user.getS3FileName());
            }else {
                throw new UserException(UserErrorCode.USER_LOGINID_MISMATCH);
            }
        }

        throw new UserException(UserErrorCode.TOKEN_NOT_FOUND);
    }

//    public ProfileImageResp getProfileImage(int userId) {
//        User user = getUserById(userId);
//        return s3Service.getFileUrl(user.getS3FileName());
//    }

    public void deleteCookies(HttpServletResponse response) {
        Cookie idCookie = new Cookie("remember-me-id", null);
        Cookie tokenCookie = new Cookie("remember-me-token", null);

        settingCookie(tokenCookie);
        settingCookie(idCookie);

        response.addCookie(idCookie);
        response.addCookie(tokenCookie);
    }

}
