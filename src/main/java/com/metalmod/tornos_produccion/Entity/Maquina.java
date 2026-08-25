package com.metalmod.tornos_produccion.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "maquinas")
public class Maquina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "no_maquina", nullable = false, unique = true, length = 50)
    private String noMaquina;

    @Column(length = 50)
    private String modelo;
}
