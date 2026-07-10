package com.vinu.cms.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse  {
    private boolean success;

    private int status;

    private String message;

    private List<String> errors;

    private LocalDateTime timestamp;

}
