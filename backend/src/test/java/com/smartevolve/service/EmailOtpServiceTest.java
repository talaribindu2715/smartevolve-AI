package com.smartevolve.service;

import com.smartevolve.dto.AuthDto;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import static org.junit.jupiter.api.Assertions.*;

public class EmailOtpServiceTest {

    @Test
    void testSendSignupOtpSimulationMode() {
        EmailOtpService service = new EmailOtpService(null);
        AuthDto.AuthResponse response = service.sendSignupOtp("test@student.edu");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertNotNull(response.getDebugOtp());
        assertEquals(6, response.getDebugOtp().length());

        AuthDto.AuthResponse verifyRes = service.verifySignupOtp("test@student.edu", response.getDebugOtp());
        assertTrue(verifyRes.isSuccess());
    }

    @Test
    void testWithJavaMailSenderConfigured() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("smtp.gmail.com");
        sender.setPort(587);
        sender.setUsername("talaribindu767@gmail.com");
        sender.setPassword("invalid-pass");

        EmailOtpService service = new EmailOtpService(sender);
        // Even with invalid password or network error, it must NOT throw an unhandled exception!
        AuthDto.AuthResponse response = service.sendSignupOtp("test@student.edu");
        assertNotNull(response);
        System.out.println("Response with JavaMailSender: " + response);
    }
}
