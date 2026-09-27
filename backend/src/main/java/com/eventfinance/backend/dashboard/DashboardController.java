package com.eventfinance.backend.dashboard;

import com.eventfinance.backend.dashboard.dto.EventDashboardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/events")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{eventId}/dashboard")
    public ResponseEntity<EventDashboardResponse>
    getEventDashboard(
            @PathVariable Long eventId
    ) {

        return ResponseEntity.ok(
                dashboardService
                        .getEventDashboard(eventId)
        );
    }
}