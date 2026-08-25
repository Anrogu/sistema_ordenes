package com.metalmod.tornos_produccion.Repository;

import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrdenVentaRepository extends JpaRepository<OrdenVenta, String> {

    // Útil para buscar solo las órdenes que están activas o en proceso
    List<OrdenVenta> findByEstado(String estado);

    // Útil para ordenar la lista y dar prioridad en los reportes
    List<OrdenVenta> findAllByOrderByPrioridadVentasAscPrioridadSistemaAsc();
}