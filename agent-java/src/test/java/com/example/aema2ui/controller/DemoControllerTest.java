package com.example.aema2ui.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DemoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGovernanceCheck() throws Exception {
        String requestBody = """
            {
                "content": {
                    "title": "Summer Sale Event",
                    "description": "Amazing summer deals on adventure gear. Save big on all outdoor equipment for your next expedition into the wilderness."
                }
            }
            """;

        mockMvc.perform(post("/demo/governance/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").exists())
                .andExpect(jsonPath("$.seo").exists())
                .andExpect(jsonPath("$.seo.score").isNumber());
    }

    @Test
    void testComponentSchema() throws Exception {
        mockMvc.perform(get("/demo/component-schema")
                        .param("type", "hero"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.componentType").value("hero"))
                .andExpect(jsonPath("$.schema").exists());
    }

    @Test
    void testDamAssembly() throws Exception {
        mockMvc.perform(get("/demo/dam-assembly")
                        .param("query", "adventure"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("adventure"))
                .andExpect(jsonPath("$.assets").isArray());
    }

    @Test
    void testPersonalize() throws Exception {
        String requestBody = """
            {
                "content": {
                    "title": "Summer Sale",
                    "componentType": "hero"
                },
                "personas": ["Executive", "Developer"]
            }
            """;

        mockMvc.perform(post("/demo/personalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.variants.Executive").exists())
                .andExpect(jsonPath("$.variants.Developer").exists());
    }

    @Test
    void testPersonalizeDefaultPersonas() throws Exception {
        String requestBody = """
            {
                "content": {
                    "title": "Summer Sale",
                    "componentType": "hero"
                }
            }
            """;

        mockMvc.perform(post("/demo/personalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.variants.Executive").exists())
                .andExpect(jsonPath("$.variants.Developer").exists());
    }

    @Test
    void testLocalize() throws Exception {
        String requestBody = """
            {
                "content": {
                    "title": "Summer Sale",
                    "description": "Great deals"
                },
                "languages": ["es-ES", "fr-FR"]
            }
            """;

        mockMvc.perform(post("/demo/localize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.localized").exists());
    }

    @Test
    void testLocalizeDefaultLanguages() throws Exception {
        String requestBody = """
            {
                "content": {
                    "title": "Summer Sale",
                    "description": "Great deals"
                }
            }
            """;

        mockMvc.perform(post("/demo/localize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.localized.es-ES").exists())
                .andExpect(jsonPath("$.localized.fr-FR").exists());
    }

    @Test
    void testExperienceFragment() throws Exception {
        String requestBody = """
            {
                "name": "summer-sale-xf",
                "title": "Summer Sale Experience Fragment"
            }
            """;

        mockMvc.perform(post("/demo/xf")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.path").value(containsString("summer-sale-xf")))
                .andExpect(jsonPath("$.title").value("Summer Sale Experience Fragment"))
                .andExpect(jsonPath("$.status").value("ready"));
    }

    @Test
    void testExperienceFragmentDefaultName() throws Exception {
        String requestBody = "{}";

        mockMvc.perform(post("/demo/xf")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.path").exists())
                .andExpect(jsonPath("$.status").value("ready"));
    }
}
