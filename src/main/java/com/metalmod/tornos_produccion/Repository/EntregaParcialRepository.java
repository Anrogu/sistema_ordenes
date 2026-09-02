package com.metalmod.tornos_produccion.Repository;

import com.metalmod.tornos_produccion.Entity.EntregaParcial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EntregaParcialRepository extends JpaRepository<EntregaParcial, Long> {
    List<EntregaParcial> findByOrdenVenta_IdOrdenOrderByFechaEntregaAsc(String idOrden);
    void deleteByOrdenVenta_IdOrden(String idOrden);
    @Query("SELECT e.ordenVenta.idOrden as idOrden, COUNT(e) as total " +
            "FROM EntregaParcial e GROUP BY e.ordenVenta.idOrden HAVING COUNT(e) > 1")
    List<ConteoEntregasProjection> contarOrdenesConMultiplesEntregas();
}