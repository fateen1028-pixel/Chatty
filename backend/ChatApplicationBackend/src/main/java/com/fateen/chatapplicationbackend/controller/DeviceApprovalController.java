package com.fateen.chatapplicationbackend.controller;

import com.fateen.chatapplicationbackend.models.dto.*;
import com.fateen.chatapplicationbackend.services.DeviceApprovalService;
import com.fateen.chatapplicationbackend.services.JwtService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/device-approvals")
public class DeviceApprovalController {

    private final DeviceApprovalService deviceApprovalService;
    private final JwtService jwtService;

    public DeviceApprovalController(
            DeviceApprovalService deviceApprovalService,
            JwtService jwtService
    ) {
        this.deviceApprovalService = deviceApprovalService;
        this.jwtService = jwtService;
    }

    @PostMapping("/request")
    public DeviceApprovalCreatedResponse createRequest(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateDeviceApprovalRequest request
    ) {
        Long deviceId = extractDeviceId(authHeader);

        return deviceApprovalService.createRequest(
                authentication.getName(),
                deviceId,
                request
        );
    }

    @GetMapping("/pending")
    public List<PendingDeviceApprovalResponse> getPending(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long deviceId = extractDeviceId(authHeader);

        return deviceApprovalService.getPendingRequests(
                authentication.getName(),
                deviceId
        );
    }

    @PostMapping("/{approvalId}/approve")
    public DeviceApprovalResultResponse approve(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long approvalId,
            @RequestBody ApproveDeviceRequest request
    ) {
        Long deviceId = extractDeviceId(authHeader);

        return deviceApprovalService.approveRequest(
                authentication.getName(),
                deviceId,
                approvalId,
                request
        );
    }

    @PostMapping("/{approvalId}/reject")
    public DeviceApprovalResultResponse reject(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long approvalId
    ) {
        Long deviceId = extractDeviceId(authHeader);

        return deviceApprovalService.rejectRequest(
                authentication.getName(),
                deviceId,
                approvalId
        );
    }

    @GetMapping("/current/result")
    public DeviceApprovalResultResponse currentResult(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long deviceId = extractDeviceId(authHeader);

        return deviceApprovalService.getCurrentResult(
                authentication.getName(),
                deviceId
        );
    }

    private Long extractDeviceId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractDeviceId(token);
    }
}