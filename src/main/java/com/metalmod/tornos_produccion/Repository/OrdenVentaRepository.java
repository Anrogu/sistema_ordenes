package com.metalmod.tornos_produccion.Repository;

import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenVentaRepository extends JpaRepository<OrdenVenta, String> {

    // Útil para buscar solo las órdenes que están activas o en proceso
    List<OrdenVenta> findByEstado(String estado);

    // Útil para ordenar la lista y dar prioridad en los reportes
    List<OrdenVenta> findAllByOrderByPrioridadVentasAscPrioridadSistemaAsc();
    Optional<OrdenVenta> findByNumeroOrdenTrabajo(String numeroOrdenTrabajo);
    Optional<OrdenVenta> findFirstByNumeroParteAndEstadoNotOrderByFechaCreacionDesc(String numeroParte, String estado);

    @Query("SELECT DISTINCT o.numeroParte FROM OrdenVenta o WHERE o.numeroParte IS NOT NULL ORDER BY o.numeroParte")
    List<String> findDistinctNumeroParte();
}