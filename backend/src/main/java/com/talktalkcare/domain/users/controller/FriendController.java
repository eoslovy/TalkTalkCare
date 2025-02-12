package com.talktalkcare.domain.users.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.users.dto.AddFriendReq;
import com.talktalkcare.domain.users.dto.DeleteFriendReq;
import com.talktalkcare.domain.users.dto.FriendDto;
import com.talktalkcare.domain.users.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/friends")
public class FriendController {
    private final FriendService friendService;

    @GetMapping("/{userId}")
    public Api<List<FriendDto>> getFriends(@PathVariable Integer userId) {
        List<FriendDto> friends = friendService.getFriendsStatus(userId);
        return Api.OK(friends);
    }

    @PostMapping("/add")
    public Api<Void> addFriend(@RequestBody AddFriendReq request) {
        friendService.addFriend(request);
        return Api.OK();
    }

    @DeleteMapping("/delete")
    public Api<Void> removeFriend(@RequestBody DeleteFriendReq request) {
        friendService.removeFriend(request);
        return Api.OK();
    }

    @GetMapping("/status/{friendId}")
    public Api<FriendDto> getFriendStatus(@PathVariable Integer friendId) {
        FriendDto friend = friendService.getFriendStatus(friendId);
        return Api.OK(friend);
    }

}
