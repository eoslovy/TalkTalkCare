package com.talktalkcare.domain.users.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.users.dto.AddFriendReq;
import com.talktalkcare.domain.users.dto.AddFriendStatusDto;
import com.talktalkcare.domain.users.dto.DeleteFriendReq;
import com.talktalkcare.domain.users.dto.FriendDto;
import com.talktalkcare.domain.users.service.UserFriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/friends")
public class UserFriendController {
    private final UserFriendService userFriendService;

    // 친구 목록 조회
    @GetMapping("/{userId}")
    public Api<List<FriendDto>> getFriends(@PathVariable Integer userId) {
        List<FriendDto> friends = userFriendService.getFriendsStatus(userId);
        return Api.OK(friends);
    }

    // 친구 추가
    @PostMapping("/add")
    public Api<Void> addFriend(@RequestBody AddFriendReq request) {
        userFriendService.addFriend(request);
        return Api.OK();
    }

    // 친구 삭제
    @DeleteMapping("/delete")
    public Api<Void> removeFriend(@RequestBody DeleteFriendReq request) {
        userFriendService.removeFriend(request);
        return Api.OK();
    }

    // 친구 상태 조회
    @GetMapping("/status/{friendId}")
    public Api<FriendDto> getFriendStatus(@PathVariable Integer friendId) {
        FriendDto friend = userFriendService.getFriendStatus(friendId);
        return Api.OK(friend);
    }

    @GetMapping("/status/receive/{userId}")
    public Api<List<AddFriendStatusDto>> getReceiveStatus(@PathVariable Integer userId) {
        return Api.OK(userFriendService.getReceiveFriendRequests(userId));
    }

    @GetMapping("/status/send/{userId}")
    public Api<List<AddFriendStatusDto>> getSendStatus(@PathVariable Integer userId) {
        return Api.OK(userFriendService.getSendAddFriendRequests(userId));
    }

    @PostMapping("/request-add")
    public Api<Void> addFriendRequest(@RequestBody AddFriendStatusDto request) {
        userFriendService.addFriendRequsetSend(request);
        return Api.OK();
    }

    @PostMapping("/reject-delete")
    public Api<Void> deleteFriendRequest(@RequestBody AddFriendStatusDto request) {
        userFriendService.rejectFriendRequsetSend(request);
        return Api.OK();
    }
}
