package com.metalmod.tornos_produccion.Repository;

import com.metalmod.tornos_produccion.Entity.SeguimientoAcp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SeguimientoAcpRepository extends JpaRepository<SeguimientoAcp, Long> {

    // Trae el historial de todos los reportes de turnos para un detalle de producción específico
    List<SeguimientoAcp> findByOrdenDetalle_Id(Long idOrdenDetalle);
}