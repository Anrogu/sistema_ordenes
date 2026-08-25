package com.metalmod.tornos_produccion.Entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "partes_manufactura")
public class ParteManufactura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "no_parte", nullable = false, length = 50)
    private String noParte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "no_operacion", length = 20)
    private String noOperacion;

    @Column(name = "tiempo_ciclo_seg")
    private Integer tiempoCicloSeg;

    @Column(name = "tiempo_herramentacion_min")
    private Integer tiempoHerramentacionMin;
}