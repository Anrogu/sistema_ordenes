package com.metalmod.tornos_produccion.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ordenes_produccion_detalle")
public class OrdenProduccionDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_orden_venta")
    private OrdenVenta ordenVenta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parte_id")
    private ParteManufactura parte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquina_id")
    private Maquina maquina;

    @Column(name = "cantidad_requerida", nullable = false)
    private Integer cantidadRequerida;

    @Column(name = "cantidad_fabricada")
    private Integer cantidadFabricada = 0;
}