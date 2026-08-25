package com.metalmod.tornos_produccion.Service;

import com.metalmod.tornos_produccion.Entity.OrdenProduccionDetalle;
import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Entity.SeguimientoAcp;
import com.metalmod.tornos_produccion.Repository.OrdenProduccionDetalleRepository;
import com.metalmod.tornos_produccion.Repository.OrdenVentaRepository;
import com.metalmod.tornos_produccion.Repository.SeguimientoAcpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrdenVentaService {

    private final OrdenVentaRepository ordenVentaRepository;
    private final OrdenProduccionDetalleRepository detalleRepository;
    private final SeguimientoAcpRepository seguimientoRepository;

    // 1. Obtener el tablero ordenado para Planeación
    public List<OrdenVenta> obtenerTableroPrioridades() {
        // Trae las órdenes ordenadas primero por la prioridad manual de ventas, luego por la del sistema
        return ordenVentaRepository.findAllByOrderByPrioridadVentasAscPrioridadSistemaAsc();
    }

    // 2. Acción exclusiva de Ventas: Cambiar prioridad manual
    @Transactional
    public OrdenVenta actualizarPrioridadVentas(String idOrden, Integer nuevaPrioridad) {
        OrdenVenta orden = ordenVentaRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + idOrden));

        orden.setPrioridadVentas(nuevaPrioridad);
        return ordenVentaRepository.save(orden);
    }

    // 3. Acción de ACP: Registrar avance de turno
    @Transactional
    public SeguimientoAcp registrarAvanceAcp(Long idDetalle, SeguimientoAcp avance) {
        OrdenProduccionDetalle detalle = detalleRepository.findById(idDetalle)
                .orElseThrow(() -> new RuntimeException("Detalle de producción no encontrado"));

        // Guardar el reporte
        avance.setOrdenDetalle(detalle);
        SeguimientoAcp reporteGuardado = seguimientoRepository.save(avance);

        // Actualizar el total fabricado en el detalle de la orden
        detalle.setCantidadFabricada(detalle.getCantidadFabricada() + avance.getPiezasOk());
        detalleRepository.save(detalle);

        // Aquí se podría agregar la lógica futura para que el "sistema" 
        // cambie automáticamente la prioridadSistema si detecta atraso.

        return reporteGuardado;
    }
}