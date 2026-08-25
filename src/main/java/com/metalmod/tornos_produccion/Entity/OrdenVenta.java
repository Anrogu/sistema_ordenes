package com.metalmod.tornos_produccion.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ordenes_venta")
public class OrdenVenta {
    @Id
    @Column(name = "id_orden", length = 50)
    private String idOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_entrega_prometida", nullable = false)
    private LocalDate fechaEntregaPrometida;

    @Column(name = "prioridad_sistema", nullable = false)
    private Integer prioridadSistema = 3;

    @Column(name = "prioridad_ventas")
    private Integer prioridadVentas;

    @Column(length = 50)
    private String estado = "PENDIENTE";
}
