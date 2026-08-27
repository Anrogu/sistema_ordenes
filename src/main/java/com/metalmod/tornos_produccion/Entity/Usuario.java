package com.metalmod.tornos_produccion.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    // Aquí guardaremos el rol (ej. "ROLE_VENTAS" o "ROLE_PLANEACION")
    @Column(nullable = false, length = 50)
    private String rol;
}