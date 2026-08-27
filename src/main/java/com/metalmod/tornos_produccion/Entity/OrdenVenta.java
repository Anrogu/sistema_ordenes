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

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_entrega_prometida")
    private LocalDate fechaEntregaPrometida;

    @Column(name = "prioridad_sistema")
    private Integer prioridadSistema;

    @Column(name = "prioridad_ventas")
    private Integer prioridadVentas;

    @Column(length = 50)
    private String estado;

    // @Transient evita que Hibernate intente crear una columna en PostgreSQL para esto.
    // Es solo una propiedad calculada en memoria (La opinión de Ventas domina sobre el Sistema).
    @Transient
    public Integer getPrioridadFinal() {
        if (this.prioridadVentas != null) {
            return this.prioridadVentas;
        }
        return this.prioridadSistema != null ? this.prioridadSistema : 3;
    }
}