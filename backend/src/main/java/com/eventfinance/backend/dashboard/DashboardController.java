package com.eventfinance.backend.dashboard;

import com.eventfinance.backend.dashboard.dto.EventDashboardResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

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
            @PathVariable Long eventId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {

        return ResponseEntity.ok(
                dashboardService.getEventDashboard(
                        eventId,
                        fromDate,
                        toDate
                )
        );
    }
}
