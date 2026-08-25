package com.metalmod.tornos_produccion.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "seguimiento_acp")
public class SeguimientoAcp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_orden_detalle")
    private OrdenProduccionDetalle ordenDetalle;

    @Column(name = "fecha_turno", nullable = false)
    private LocalDate fechaTurno;

    @Column(nullable = false)
    private Integer turno;

    @Column(name = "piezas_ok", nullable = false)
    private Integer piezasOk;

    @Column(name = "tiempo_muerto_min")
    private Integer tiempoMuertoMin = 0;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro = LocalDateTime.now();
}