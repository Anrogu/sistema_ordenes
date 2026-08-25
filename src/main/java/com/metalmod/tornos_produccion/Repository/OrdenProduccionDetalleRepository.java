package com.metalmod.tornos_produccion.Repository;

import com.metalmod.tornos_produccion.Entity.OrdenProduccionDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrdenProduccionDetalleRepository extends JpaRepository<OrdenProduccionDetalle, Long> {

    // Permite traer todos los requerimientos de piso atados a una orden de venta específica
    List<OrdenProduccionDetalle> findByOrdenVenta_IdOrden(String idOrden);
}