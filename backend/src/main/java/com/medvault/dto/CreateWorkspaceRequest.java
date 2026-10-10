package com.medvault.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateWorkspaceRequest {
    @NotBlank(message = "Workspace name must not be blank")
    private String name;
}
