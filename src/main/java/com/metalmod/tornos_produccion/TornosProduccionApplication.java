package com.metalmod.tornos_produccion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TornosProduccionApplication {

	public static void main(String[] args) {
		SpringApplication.run(TornosProduccionApplication.class, args);
	}

}