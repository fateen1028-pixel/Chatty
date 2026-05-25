package com.fateen.chatapplicationbackend.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheck {


    @GetMapping("/")
    public String healthChecker(){
        return "SpringBoot Application is up and running";
    }

}
