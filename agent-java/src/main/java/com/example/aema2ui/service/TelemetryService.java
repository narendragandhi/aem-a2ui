package com.example.aema2ui.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class TelemetryService {

    private static final int MAX_EVENTS = 200;
    private final ConcurrentLinkedDeque<Map<String, Object>> events = new ConcurrentLinkedDeque<>();

    public void record(String type, Map<String, Object> data) {
        Map<String, Object> event = Map.of(
            "type", type,
            "timestamp", Instant.now().toString(),
            "data", data != null ? data : Map.of()
        );
        events.addFirst(event);
        while (events.size() > MAX_EVENTS) {
            events.removeLast();
        }
    }

    public List<Map<String, Object>> recent() {
        return new ArrayList<>(events);
    }

    public Map<String, Object> summary() {
        int total = events.size();
        return Map.of(
            "totalEvents", total,
            "maxEvents", MAX_EVENTS
        );
    }
}
