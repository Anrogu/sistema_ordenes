package com.metalmod.tornos_produccion.Utils;
import com.metalmod.tornos_produccion.TornosProduccionApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.apache.poi.poifs.crypt.CryptoFunctions.hashPassword;

public class PasswordUtility {
    public static void main(String[] args) {
        String password = "test";

        // Generate a salt and hash the password
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

        // Print the hashed password on the console
        System.out.println("Hashed Password: " + hashedPassword);

        boolean matched = BCrypt.checkpw(password, hashedPassword);
        System.out.println("Match Result: " + matched);
    }
}